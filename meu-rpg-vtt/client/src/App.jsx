import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

import TopBar from './components/TopBar';
import ChatSidebar from './components/ChatSidebar';
import GameMap from './components/GameMap';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

const socket = io();
function App() {
  const [currentGame, setCurrentGame] = useState(null);

  // Saved login already comes in as initial state (avoids an extra re-render)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('rpg_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Joins the socket room for the current game (server listens for 'join_room')
  useEffect(() => {
    if (currentGame) {
      socket.emit('join_room', currentGame.id);
    }
  }, [currentGame]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('rpg_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rpg_user');
  };

  // No user yet, show the Login screen
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Logged in but no currentGame selected yet, show the DASHBOARD
  if (!currentGame) {
    return (
      <div className="app-container">
         {/* TopBar stays fixed on every logged-in screen */}
         <button onClick={handleLogout} style={{background: 'red', color: 'white', border: 'none', padding: '5px'}}>Log out</button>
         <TopBar username={user.username}  />


         {/* Pass user down to display the name, and setCurrentGame so the
             Dashboard can notify us when a game is chosen */}
         <Dashboard
            user={user}
            onJoinGame={(game) => setCurrentGame(game)}
         />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Logout button */}
      <div style={{position: 'absolute', top: 10, right: 10, zIndex: 20}}>
          <button onClick={handleLogout} style={{background: 'red', color: 'white', border: 'none', padding: '5px'}}>Log out</button>
      </div>

      <TopBar username={user.username} role={user.role} />

      <div className="main-content">
        <GameMap
          user={user}
          onJoinGame={(game) => setCurrentGame(game)}
        />
        <ChatSidebar />
      </div>
    </div>
  );
}

export default App;
