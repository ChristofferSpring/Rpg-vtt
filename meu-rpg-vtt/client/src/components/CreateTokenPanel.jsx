import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function CreateTokenPanel({ game }) {
  const [members, setMembers] = useState([]);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#3182ce');
  const [ownerId, setOwnerId] = useState('');
  const [visibility, setVisibility] = useState('all');

  useEffect(() => {
    api.getMembers(game.id).then(setMembers).catch((err) => console.error('Error loading members:', err));
  }, [game.id]);

  const handleCreate = async () => {
    if (!label.trim()) {
      alert('Give it a name first.');
      return;
    }
    try {
      await api.createToken(game.id, {
        label: label.trim(),
        color,
        ownerId: ownerId ? Number(ownerId) : null,
        visibility,
        x: 0,
        y: 0
      });
      setLabel('');
    } catch (err) {
      alert("Couldn't create the token: " + err.message);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px' }}>
      <div>➕ New token</div>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Name"
        style={{ width: '100%', marginBottom: '5px' }}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={{ width: '100%', marginBottom: '5px' }}
      />
      <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} style={{ width: '100%', marginBottom: '5px' }}>
        <option value="">GM only</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>{m.username}</option>
        ))}
      </select>
      <select value={visibility} onChange={(e) => setVisibility(e.target.value)} style={{ width: '100%', marginBottom: '5px' }}>
        <option value="all">Visible to all</option>
        <option value="owner">Hidden (GM + owner only)</option>
      </select>
      <button onClick={handleCreate} style={{ width: '100%' }}>Create</button>
    </div>
  );
}
