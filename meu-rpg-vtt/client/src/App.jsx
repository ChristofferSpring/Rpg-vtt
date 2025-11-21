import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css'; 

// Componentes
import TopBar from './components/TopBar';
import ChatSidebar from './components/ChatSidebar';
import GameMap from './components/GameMap';

// Conexão Socket (Fora do componente para não reconectar a cada render)
const socket = io(); //ngrok

function App() {
  const [role, setRole] = useState(null); // 'MESTRE' ou 'JOGADOR'
  const [username, setUsername] = useState('');

  // TELA DE "LOGIN" FAKE - aprimorar
  if (!role) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <h1>Quem é você?</h1>
        <input 
          placeholder="Seu Nome" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          style={{ padding: '10px', marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setRole('JOGADOR')}>Entrar como JOGADOR</button>
          <button onClick={() => setRole('MESTRE')}>Entrar como MESTRE</button>
        </div>
      </div>
    );
  }

  // A INTERFACE PRINCIPAL
  return (
    <div className="app-container">
      {/* 1. Barra do Topo */}
      <TopBar username={username || 'Anônimo'} role={role} />

      <div className="main-content">
        {/* 2. O Mapa (Centro) */}
        <GameMap />

        {/* 3. O Chat (Direita) */}
        <ChatSidebar />
      </div>
    </div>
  );
}

export default App;