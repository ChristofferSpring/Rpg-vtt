import React, { useState } from 'react';
import { getSocket } from '../services/socket';

const DICE = [4, 6, 8, 10, 12, 20, 100];

export default function DicePanel() {
  const [count, setCount] = useState(1);

  const roll = (sides) => {
    getSocket()?.emit('roll_dice', { sides, count: Number(count) || 1 });
  };

  return (
    <div style={{ borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px' }}>
      <div>🎲 Roll dice</div>
      <input
        type="number"
        min="1"
        max="20"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        style={{ width: '100%', marginBottom: '5px' }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {DICE.map((sides) => (
          <button key={sides} onClick={() => roll(sides)} style={{ flex: '1 0 40px' }}>
            d{sides}
          </button>
        ))}
      </div>
    </div>
  );
}
