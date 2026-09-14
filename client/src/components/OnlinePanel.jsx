import React, { useState } from 'react';

export default function OnlinePanel({ users, currentUserId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 15 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '5px 10px', borderRadius: '12px', border: 'none',
          background: '#2d3748', color: 'white', cursor: 'pointer', fontSize: '0.85rem'
        }}
      >
        <span style={{ color: '#48bb78' }}>●</span> {users.length} online
      </button>

      {expanded && (
        <div style={{
          marginTop: '5px', background: '#2d3748', color: 'white',
          borderRadius: '6px', padding: '10px', minWidth: '140px'
        }}>
          {users.map((u) => (
            <div key={u.userId} style={{ fontSize: '0.85rem', padding: '2px 0' }}>
              {u.username}{u.userId === currentUserId ? ' (you)' : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
