import React from 'react';

export default function TopBar({ username, role }) {
  return (
    <div className="top-bar">
      <h3>Meu RPG VTT</h3>
      <div>
        <span>Logado como: <strong>{username}</strong> </span>
        {/* Renderização Condicional: Muda a cor se for Mestre */}
        <span style={{ 
            marginLeft: '10px', 
            padding: '2px 8px', 
            borderRadius: '4px',
            backgroundColor: role === 'MESTRE' ? '#e53e3e' : '#3182ce' 
        }}>
          {role}
        </span>
      </div>
    </div>
  );
}