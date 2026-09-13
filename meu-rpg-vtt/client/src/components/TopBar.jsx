import React from 'react';
import { version } from '../../package.json';

export default function TopBar({ username, role }) {
  return (
    <div className="top-bar">
      <h3>
        RPG4v <span style={{ fontSize: '0.6em', fontWeight: 'normal', opacity: 0.5 }}>v{version}</span>
      </h3>
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