import React, { useEffect, useState } from 'react';
import { api, BASE_URL } from '../services/api';

export default function EditTokenPanel({ game, token, onClose }) {
  const [members, setMembers] = useState([]);
  const [label, setLabel] = useState(token.label);
  const [color, setColor] = useState(token.color);
  const [ownerId, setOwnerId] = useState(token.ownerId ? String(token.ownerId) : '');
  const [visibility, setVisibility] = useState(token.visibility);

  useEffect(() => {
    api.getMembers(game.id).then(setMembers).catch((err) => console.error('Error loading members:', err));
  }, [game.id]);

  const handleSave = async () => {
    if (!label.trim()) {
      alert('Give it a name first.');
      return;
    }
    try {
      await api.updateToken(game.id, token.id, {
        label: label.trim(),
        color,
        ownerId: ownerId ? Number(ownerId) : null,
        visibility
      });
      onClose();
    } catch (err) {
      alert("Couldn't save that: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteToken(game.id, token.id);
      onClose();
    } catch (err) {
      alert("Couldn't delete it: " + err.message);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await api.uploadTokenImage(game.id, token.id, file);
    } catch (err) {
      alert("Couldn't upload that: " + err.message);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px' }}>
      <div>Edit token</div>
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
      <div style={{ marginBottom: '5px' }}>
        {token.imageUrl && (
          <img src={`${BASE_URL}${token.imageUrl}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle', marginRight: '5px' }} />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      <button onClick={handleSave} style={{ width: '100%', marginBottom: '5px' }}>Save</button>
      <button onClick={handleDelete} style={{ width: '100%', marginBottom: '5px', background: '#e53e3e', color: 'white', border: 'none' }}>Delete</button>
      <button onClick={onClose} style={{ width: '100%' }}>Cancel</button>
    </div>
  );
}
