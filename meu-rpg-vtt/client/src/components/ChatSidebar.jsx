import React from 'react';

export default function ChatSidebar() {
  return (
    <div className="chat-sidebar">
      <div style={{ padding: '10px', borderBottom: '1px solid #4a5568' }}>
        <strong>Game Chat</strong>
      </div>

      {/* Messages area (grows) */}
      <div style={{ flex: 1, padding: '10px' }}>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Welcome to the room...</p>
      </div>

      {/* Text input (fixed at the bottom) */}
      <div style={{ padding: '10px' }}>
        <input
          type="text"
          placeholder="Type your message..."
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: 'none' }} 
        />
      </div>
    </div>
  );
}