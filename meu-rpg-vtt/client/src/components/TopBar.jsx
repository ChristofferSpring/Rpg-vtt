import React from 'react';

export default function TopBar({ username, role }) {
  return (
    <div className="top-bar">
      <h3>RPG4v</h3>
      <div>
        <span>Logged in as: <strong>{username}</strong> </span>
        <span style={{
            marginLeft: '10px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: role === 'MASTER' ? '#e53e3e' : '#3182ce'
        }}>
          {role}
        </span>
      </div>
    </div>
  );
}