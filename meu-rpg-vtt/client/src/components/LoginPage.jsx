import React, { useState } from 'react';
import { api } from '../services/api';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await api.register(username, password);
        alert('Account created! Now log in.');
        setIsRegister(false);
      } else {
        const data = await api.login(username, password);
        onLogin(data); // data contains { token, username, userId }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ 
      height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', 
      backgroundColor: '#1a1a1a', color: 'white' 
    }}>
      <form onSubmit={handleSubmit} style={{ 
        padding: '40px', background: '#2d3748', borderRadius: '8px', 
        display: 'flex', flexDirection: 'column', gap: '15px', width: '300px'
      }}>
        <h2>{isRegister ? 'Create Account' : 'RPG4v Login'}</h2>

        {error && <div style={{ color: '#fc8181' }}>{error}</div>}

        <input
          type="text" placeholder="Username" required
          value={username} onChange={e => setUsername(e.target.value)}
          style={{ padding: '10px' }}
        />

        <input
          type="password" placeholder="Password" required
          value={password} onChange={e => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />

        <button type="submit" style={{
          padding: '10px', background: '#3182ce', color: 'white', border: 'none', cursor: 'pointer'
        }}>
          {isRegister ? 'Register' : 'Log in'}
        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          style={{ textAlign: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#63b3ed' }}
        >
          {isRegister ? 'Already have an account' : "Don't have an account? Create one now"}
        </p>
      </form>
    </div>
  );
}