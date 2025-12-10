import React, { useState, useEffect } from 'react';

// Recebemos "user" (para saber quem somos) e "onJoinGame" (uma função para avisar o App que escolhemos uma mesa)
export default function Dashboard({ user, onJoinGame }) {
  const [newGameName, setNewGameName] = useState('');
  const [myGames, setMyGames] = useState([]);  // -- AREA DE ESTADO (Memória do componente) --

  const fetchGames = () => {
    const idDoUsuario = user.userId || user.id;
    if (!user || !idDoUsuario) return;

    // --- CORREÇÃO: Definir quem é o servidor ---
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

    // --- CORREÇÃO: Usar a baseUrl no fetch ---
    fetch(`${baseUrl}/api/games/my-games?userId=${idDoUsuario}`)
      .then(response => {
        // Se a resposta não for ok, lança erro para cair no catch
        if (!response.ok) throw new Error('Falha ao buscar jogos');
        return response.json();
      })
      .then(data => {
        console.log("Jogos atualizados:", data);
        // Garantia extra: Se vier null ou undefined, seta array vazio para não quebrar o .map
        setMyGames(Array.isArray(data) ? data : []); 
      })
      .catch(err => console.error("Erro ao buscar jogos:", err));
  };

  // --- MUDANÇA 2: O useEffect agora só chama a função acima ---
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
  const handleCreateGame = async (e) => {
    if (newGameName.trim() === '') {
        alert('Digite um nome para a mesa!');
        return;
    }
    const endpoint = '/api/games/create';
    // Se estiver em localhost dev (5173), precisa apontar pro 3001. 
    // Em produção (ngrok), a URL relativa funciona.
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

    try {
      console.log(`Tentando conectar em: ${baseUrl}${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name: newGameName,userId: user.userId || user.id})
      });
      
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro na requisição');

      alert(`Mesa "${data.name}" criada com sucesso!`);
      
      setNewGameName(''); // Limpa o campo de texto
      fetchGames();       // Chama a função da MUDANÇA 1 para recarregar a lista

    } catch (err) {
      console.error(err);
      alert('Erro ao criar mesa: ' + err.message);
    }

  }
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
            <input type="text" placeholder="Código (UUID)" style={{ width: '100%', marginBottom: '10px', padding: '5px' }} />
            <button style={{ width: '100%', padding: '5px' }}>Entrar</button>
          </div>

        </section>

      </div>
    </div>
  );
}