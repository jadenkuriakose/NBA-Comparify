import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [player1, setPlayer1] = useState({ firstName: '', lastName: '' });
  const [player2, setPlayer2] = useState({ firstName: '', lastName: '' });
  const [stats, setStats] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!player1.firstName || !player1.lastName || !player2.firstName || !player2.lastName) {
      setError('Please provide complete information for both players.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/stats', {
        params: {
          firstName1: player1.firstName,
          lastName1: player1.lastName,
          firstName2: player2.firstName,
          lastName2: player2.lastName,
        },
      });
      setStats(response.data); 
    } catch (err) {
      console.error('Error fetching stats:', err);
      if (err.response) {
        setError(`Request failed with status code ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        setError('No response received from the server.');
      } else {
        setError('Error setting up request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>NBA Comparify</h1>
      <div className="input-section">
        <h2>Player 1</h2>
        <input
          type="text"
          placeholder="First Name"
          value={player1.firstName}
          onChange={(e) => setPlayer1({ ...player1, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={player1.lastName}
          onChange={(e) => setPlayer1({ ...player1, lastName: e.target.value })}
        />
        <h2>Player 2</h2>
        <input
          type="text"
          placeholder="First Name"
          value={player2.firstName}
          onChange={(e) => setPlayer2({ ...player2, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={player2.lastName}
          onChange={(e) => setPlayer2({ ...player2, lastName: e.target.value })}
        />
        <button onClick={fetchStats} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare Stats'}
        </button>
      </div>
      <div className="results-section">
        {error && <p className="error">{error}</p>}
        {stats && typeof stats === 'object' && Object.keys(stats).length > 0 && (
          <div>
            <h2>Comparison Results</h2>
            {Object.entries(stats).map(([playerName, playerStats]) => (
              <div key={playerName}>
                <h3>{playerName}</h3>
                <ul>
                  {['Points', 'Total Rebounds', 'Assists'].map((stat) => (
                    <li key={stat}>
                      {stat}: {playerStats[stat] || 'N/A'}
                    </li>
                  ))}
                  {Object.entries(playerStats).map(([stat, value]) => (
                    !['Points', 'Total Rebounds', 'Assists'].includes(stat) && (
                      <li key={stat}>
                        {stat}: {value}
                      </li>
                    )
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

