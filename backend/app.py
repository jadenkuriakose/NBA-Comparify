from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_executor import Executor
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)
executor = Executor(app)  

def construct_url(first_name, last_name):
    base = "https://www.basketball-reference.com"
    initial = f"/players/{last_name[0].lower()}/{last_name.lower()[:5]}{first_name.lower()[:2]}01.html"
    return base + initial

def extract_stats(url):
    try:
        response = requests.get(url)  # Corrected from request.get to requests.get
        response.raise_for_status()  
        soup = BeautifulSoup(response.text, 'html.parser')
        stats_pullout = soup.find('div', class_='stats_pullout')
        
        if stats_pullout:
            stats = {}
            for span in stats_pullout.find_all('span', {'data-tip': True}):
                data_tip = span.get('data-tip')
                p_tag = span.find_next_sibling('p')
                while p_tag:
                    value = p_tag.text.strip()
                    if value.replace('.', '', 1).isdigit():
                        if data_tip in ["Points", "Total Rebounds", "Assists"]:
                            stats[data_tip] = value
                        break
                    p_tag = p_tag.find_next_sibling('p')
            return stats
        return {}
    except requests.RequestException as e:  # Corrected from request.RequestException to requests.RequestException
        print(f"An error occurred: {e}")
        return {}

def fetch_player_stats(first_name, last_name):
    url = construct_url(first_name, last_name)
    return extract_stats(url)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    first_name1 = request.args.get('firstName1')
    last_name1 = request.args.get('lastName1')
    first_name2 = request.args.get('firstName2')
    last_name2 = request.args.get('lastName2')

    if not all([first_name1, last_name1, first_name2, last_name2]):
        return jsonify({"error": "Please provide first and last names for both players"}), 400

    # Use executor to fetch stats concurrently
    future1 = executor.submit(fetch_player_stats, first_name1, last_name1)
    future2 = executor.submit(fetch_player_stats, first_name2, last_name2)

    stats1 = future1.result()  # Wait for the result of the first player
    stats2 = future2.result()  # Wait for the result of the second player

    if not stats1:
        return jsonify({"message": f"No statistics found for {first_name1} {last_name1}"}), 404
    if not stats2:
        return jsonify({"message": f"No statistics found for {first_name2} {last_name2}"}), 404

    response_data = {
        f"{first_name1} {last_name1}": stats1,
        f"{first_name2} {last_name2}": stats2,
    }

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True, port=8000)
