import React from 'react';

export default function ChatSidebar() {
  return (
    <div className="chat-sidebar">
      <div style={{ padding: '10px', borderBottom: '1px solid #4a5568' }}>
        <strong>Chat da Mesa</strong>
      </div>
      
      {/* Área das mensagens (Cresce) */}
      <div style={{ flex: 1, padding: '10px' }}>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Bem-vindo à sala...</p>
      </div>

      {/* Input de texto (Fixo embaixo) */}
      <div style={{ padding: '10px' }}>
        <input 
          type="text" 
          placeholder="Digite sua mensagem..." 
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: 'none' }} 
        />
      </div>
    </div>
  );
}