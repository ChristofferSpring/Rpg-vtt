import React from 'react';
import { api } from '../services/api';

export default function BackgroundUploader({ game }) {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await api.uploadBackground(game.id, file);
    } catch (err) {
      alert('Error uploading background: ' + err.message);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px' }}>
      <div>🖼️ Map background</div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
