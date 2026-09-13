import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export default function ChatSidebar({ game }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.getBoard(game.id)
      .then((board) => setMessages(board.messages))
      .catch((err) => console.error('Error loading chat history:', err));
  }, [game.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    getSocket()?.emit('send_message', { text: text.trim() });
    setText('');
  };

  return (
    <div className="chat-sidebar">
      <div style={{ padding: '10px', borderBottom: '1px solid #4a5568' }}>
        <strong>Game Chat</strong>
      </div>

      <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        {messages.length === 0 && (
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Welcome to the room...</p>
        )}
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: '6px', fontSize: '0.9rem' }}>
            <strong>{message.username}:</strong> {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '10px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: 'none' }}
        />
      </div>
    </div>
  );
}