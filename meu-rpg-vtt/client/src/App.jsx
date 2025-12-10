import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

import TopBar from './components/TopBar';
import ChatSidebar from './components/ChatSidebar';
import GameMap from './components/GameMap';
import LoginPage from './components/LoginPage'; // <--- IMPORTANTE
import Dashboard from './components/Dashboard';

const socket = io();
function App() {
  const [currentGame, setCurrentGame] = useState(null);

  const [user, setUser] = useState(null); // { username, role, token }

  // Ao carregar, verifica se já tem login salvo no navegador
  useEffect(() => {
    const savedUser = localStorage.getItem('rpg_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('rpg_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rpg_user');
  };

  // Se não tiver usuário, mostra tela de Login
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 2. Se tem usuário, MAS "currentGame" é nulo, mostra DASHBOARD
  if (!currentGame) {
    return (
      <div className="app-container">
         {/* TopBar fica fixa em todas as telas de usuário logado */}
         <button onClick={handleLogout} style={{background: 'red', color: 'white', border: 'none', padding: '5px'}}>Sair</button>
         <TopBar username={user.username}  />
         
         
         {/* Passamos o user para exibir o nome, e passamos a função "setCurrentGame" 
             para o Dashboard poder avisar quando escolhemos algo */}
         <Dashboard 
            user={user} 
            onJoinGame={(game) => setCurrentGame(game)} 
         />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Passamos o handleLogout para poder sair */}
      <div style={{position: 'absolute', top: 10, right: 10, zIndex: 20}}>
          <button onClick={handleLogout} style={{background: 'red', color: 'white', border: 'none', padding: '5px'}}>Sair</button>
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