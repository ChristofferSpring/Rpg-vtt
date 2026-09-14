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
  const [onlineUsers, setOnlineUsers] = useState([]);

  // hydrate from localStorage synchronously so we skip a flash of the login screen
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

  // join the game's room, leave it again on cleanup (game switch or unmount)
  useEffect(() => {
    if (!currentGame) return;

    joinRoom(currentGame.id, setOnlineUsers);

    const socket = getSocket();
    const handleError = (payload) => {
      if (payload?.scope === 'room') {
        alert(payload?.message || 'Error joining game');
        setCurrentGame(null);
      }
    };
    socket?.on('error', handleError);
    socket?.on('presence_update', setOnlineUsers);

    return () => {
      socket?.off('error', handleError);
      socket?.off('presence_update', setOnlineUsers);
      leaveRoom();
      setOnlineUsers([]);
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

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!currentGame) {
    return (
      <div className="app-container">
         <TopBar username={user.username} onLogout={handleLogout} />

         <Dashboard
            user={user}
            onJoinGame={(game) => setCurrentGame(game)}
         />
      </div>
    );
  }

  return (
    <div className="app-container">
      <TopBar username={user.username} role={currentGame.role} onLogout={handleLogout} />

      <div className="main-content">
        <GameMap
          user={user}
          game={currentGame}
          onJoinGame={(game) => setCurrentGame(game)}
          onlineUsers={onlineUsers}
        />
        <ChatSidebar user={user} game={currentGame} />
      </div>
    </div>
  );
}

export default App;
