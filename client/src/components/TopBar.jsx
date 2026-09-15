import React, { useState } from 'react';
import { version } from '../../package.json';

export default function TopBar({ username, role, inviteCode, onLogout }) {
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Error copying invite code:', err);
    }
  };

  return (
    <div className="top-bar">
      <h3>
        RPG VTT <span style={{ fontSize: '0.6em', fontWeight: 'normal', opacity: 0.5 }}>v{version}</span>
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {inviteCode && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85em', opacity: 0.8 }}>
            Invite code: <code>{inviteCode}</code>
            <button
              onClick={handleCopyInviteCode}
              title="Copy invite code to invite someone"
              style={{ cursor: 'pointer', background: '#4a5568', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '3px' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </span>
        )}
        <span>Logged in as: <strong>{username}</strong> </span>
        {role && (
          <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: role === 'MASTER' ? '#e53e3e' : '#3182ce'
          }}>
            {role}
          </span>
        )}
        <button onClick={onLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '5px' }}>
          Log out
        </button>
      </div>
    </div>
  );
}