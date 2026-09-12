import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// Receives "user" (to know who we are) and "onJoinGame" (a function to tell App which game was picked)
export default function Dashboard({ user, onJoinGame }) {
  const [newGameName, setNewGameName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [myGames, setMyGames] = useState([]);

  const fetchGames = async () => {
    try {
      const data = await api.myGames();
      setMyGames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [user]);

  const handleEnterGame = (originalGame) => {
    // Build a new object copying everything from the original
    const readyGame = {
      ...originalGame, // Copies id, name, inviteCode...
      role: originalGame.UserGame ? originalGame.UserGame.role : 'GUEST'
    };

    // Send it up to App.jsx
    onJoinGame(readyGame);
  };

  const handleCreateGame = async () => {
    if (newGameName.trim() === '') {
      alert('Enter a name for the game!');
      return;
    }

    try {
      const data = await api.createGame(newGameName);
      alert(`Game "${data.name}" created successfully!`);
      setNewGameName('');
      fetchGames();
    } catch (err) {
      alert('Error creating game: ' + err.message);
    }
  };

  const handleJoinGame = async () => {
    if (joinCode.trim() === '') {
      alert('Enter an invite code!');
      return;
    }

    try {
      await api.joinGame(joinCode.trim());
      setJoinCode('');
      fetchGames();
    } catch (err) {
      alert('Error joining game: ' + err.message);
    }
  };
 return (
    <div style={{ padding: '20px', color: 'white' }}>

      <header style={{ marginBottom: '40px', borderBottom: '1px solid #444' }}>
        <h2>Welcome, {user.username}!</h2>
        <p>Choose your adventure.</p>
      </header>

      <div style={{ display: 'flex', gap: '50px' }}>

        {/* GAME LIST */}
        <section style={{ flex: 1 }}>
          <h3>📜 Your Games</h3>
          <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {myGames.length === 0 && <p style={{ color: '#aaa' }}>No games found.</p>}

            {myGames.map((game) => (
              <div
                key={game.id}
                style={{ padding: '10px', background: '#4a5568', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <strong>{game.name}</strong>
                  <span style={{ fontSize: '0.8em', marginLeft: '10px', color: '#cbd5e0' }}>
                     ({game.UserGame ? game.UserGame.role : 'Guest'})
                  </span>
                </div>

                <button
                  onClick={() => handleEnterGame(game)}
                  style={{ background: '#48bb78', border: 'none', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}
                >
                  Play
                </button>
              </div>
            ))}

          </div>
        </section>

        {/* ACTIONS */}
        <section style={{ width: '300px' }}>

          {/* CREATE NEW GAME */}
          <div style={{ marginBottom: '30px', background: '#2d3748', padding: '15px', borderRadius: '8px' }}>
            <h4>🔨 Create New Game</h4>
            <input
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                type="text"
                placeholder="Game name"
                style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            <button
                onClick={handleCreateGame}
                style={{ width: '100%', padding: '5px', cursor: 'pointer', background: '#3182ce', color: 'white', border: 'none' }}
            >
                Create and Join
            </button>
          </div>

          {/* JOIN WITH CODE */}
          <div style={{ background: '#2d3748', padding: '15px', borderRadius: '8px' }}>
            <h4>🔗 Join via Code</h4>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              type="text"
              placeholder="Code (UUID)"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            <button onClick={handleJoinGame} style={{ width: '100%', padding: '5px', cursor: 'pointer' }}>Join</button>
          </div>

        </section>

      </div>
    </div>
  );
}
