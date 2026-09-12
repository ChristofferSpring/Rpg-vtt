import React from 'react';

export default function GameMap({ onJoinGame }) {
  const HandleLeave = () => {
  //voltar
  onJoinGame(null);
  };
  return (
    <div className="map-area">
      {/* O componente Stage do Konva será inserido aqui depois.
          Por enquanto, um placeholder visual. */}
      <div style={{ 
          position: 'absolute', 
          top: '50%', left: '50%', 
          transform: 'translate(-50%, -50%)', 
          color: '#555' 
      }}>
        [ GRID ]
      </div>

      {/* Exemplo do botão flutuante dentro da área do mapa */}
      <FloatingMenu onExit={HandleLeave}/>
    </div>
  );
}

function FloatingMenu({onExit}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
      {open && (
        <div style={{ 
            marginBottom: '10px', background: 'white', color: 'black', 
            padding: '10px', borderRadius: '5px' 
        }}>
          <div>🛠️ Ferramentas</div>
          <div>🎲 Dados</div>
          <div>📏 Régua</div>
          <div> 
            <button onClick={onExit}> voltar </button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setOpen(!open)}
        style={{
            width: '50px', height: '50px', borderRadius: '50%', 
            border: 'none', background: '#e53e3e', color: 'white', 
            fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}
      >
        {open ? 'x' : '+'}
      </button>
    </div>
  );
}