import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

// Recebemos "user" (para saber quem somos) e "onJoinGame" (uma função para avisar o App que escolhemos uma mesa)
export default function Dashboard({ user, onJoinGame }) {
  const [newGameName, setNewGameName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [myGames, setMyGames] = useState([]);  // -- AREA DE ESTADO (Memória do componente) --

  const fetchGames = async () => {
    try {
      const data = await api.myGames();
      setMyGames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar jogos:", err);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [user]);

const handleEnterGame = (gameOriginal) => {
  // Vamos criar um objeto novo, copiando tudo do original
  const gamePronto = {
    ...gameOriginal, // Copia id, name, inviteCode...
    role: gameOriginal.UserGame ? gameOriginal.UserGame.role : 'VISITANTE'
  };

  // Agora mandamos para o App.jsx
  onJoinGame(gamePronto);
};
  const handleCreateGame = async () => {
    if (newGameName.trim() === '') {
      alert('Digite um nome para a mesa!');
      return;
    }

    try {
      const data = await api.createGame(newGameName);
      alert(`Mesa "${data.name}" criada com sucesso!`);
      setNewGameName('');
      fetchGames();
    } catch (err) {
      alert('Erro ao criar mesa: ' + err.message);
    }
  };

  const handleJoinGame = async () => {
    if (joinCode.trim() === '') {
      alert('Digite um código de convite!');
      return;
    }

    try {
      await api.joinGame(joinCode.trim());
      setJoinCode('');
      fetchGames();
    } catch (err) {
      alert('Erro ao entrar na mesa: ' + err.message);
    }
  };
 return (
    <div style={{ padding: '20px', color: 'white' }}>
      
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #444' }}>
        <h2>Bem-vindo, {user.username}!</h2>
        <p>Escolha sua aventura.</p>
      </header>

      <div style={{ display: 'flex', gap: '50px' }}>
        
        {/* LISTA DE JOGOS */}
        <section style={{ flex: 1 }}>
          <h3>📜 Suas Mesas</h3>
          <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {myGames.length === 0 && <p style={{ color: '#aaa' }}>Nenhuma mesa encontrada.</p>}

            {myGames.map((game) => (
              <div 
                key={game.id} 
                style={{ padding: '10px', background: '#4a5568', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <strong>{game.name}</strong>
                  <span style={{ fontSize: '0.8em', marginLeft: '10px', color: '#cbd5e0' }}>
                     ({game.UserGame ? game.UserGame.role : 'Visitante'})
                  </span>
                </div>

                <button 
                  onClick={() => handleEnterGame(game)}
                  style={{ background: '#48bb78', border: 'none', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}
                >
                  Jogar
                </button>
              </div>
            ))}

          </div>
        </section>

        {/* AÇÕES */}
        <section style={{ width: '300px' }}>
          
          {/* CRIAR NOVA MESA */}
          <div style={{ marginBottom: '30px', background: '#2d3748', padding: '15px', borderRadius: '8px' }}>
            <h4>🔨 Criar Nova Mesa</h4>
            <input 
                value={newGameName} 
                onChange={(e) => setNewGameName(e.target.value)} 
                type="text" 
                placeholder="Nome da Mesa" 
                style={{ width: '100%', marginBottom: '10px', padding: '5px' }} 
            />
            {/* CORREÇÃO: Adicionado o onClick aqui */}
            <button 
                onClick={handleCreateGame} 
                style={{ width: '100%', padding: '5px', cursor: 'pointer', background: '#3182ce', color: 'white', border: 'none' }}
            >
                Criar e Entrar
            </button>
          </div>

          {/* ENTRAR COM CÓDIGO */}
          <div style={{ background: '#2d3748', padding: '15px', borderRadius: '8px' }}>
            <h4>🔗 Entrar via Código</h4>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              type="text"
              placeholder="Código (UUID)"
              style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
            />
            <button onClick={handleJoinGame} style={{ width: '100%', padding: '5px', cursor: 'pointer' }}>Entrar</button>
          </div>

        </section>

      </div>
    </div>
  );
}