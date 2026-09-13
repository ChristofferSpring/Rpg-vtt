import { useEffect, useState } from 'react';
import './App.css';

import TopBar from './components/TopBar';
import ChatSidebar from './components/ChatSidebar';
import GameMap from './components/GameMap';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { connectSocket, disconnectSocket, getSocket, joinRoom, leaveRoom } from './services/socket';

function App() {
  const [currentGame, setCurrentGame] = useState(null);

  // Saved login already comes in as initial state (avoids an extra re-render)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('rpg_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Connects the authenticated socket once logged in
  useEffect(() => {
    if (user) {
      connectSocket();
    }
  }, [user]);

  // Joins the socket room for the current game (server listens for 'join_room'),
  // and leaves it again on cleanup so switching games (or returning to the
  // Dashboard) can never leave the socket in two rooms at once.
  useEffect(() => {
    if (!currentGame) return;

    joinRoom(currentGame.id);

    const socket = getSocket();
    const handleError = (payload) => {
      alert(payload?.message || 'Error joining game');
      setCurrentGame(null);
    };
    socket?.on('error', handleError);

    return () => {
      socket?.off('error', handleError);
      leaveRoom();
    };
  }, [currentGame]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('rpg_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentGame(null);
    localStorage.removeItem('rpg_user');
    disconnectSocket();
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

      <TopBar username={user.username} role={currentGame.role} />

      <div className="main-content">
        <GameMap
          user={user}
          game={currentGame}
          onJoinGame={(game) => setCurrentGame(game)}
        />
        <ChatSidebar user={user} game={currentGame} />
      </div>
    </div>
  );
}

export default App;
