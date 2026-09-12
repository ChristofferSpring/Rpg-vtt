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
        alert('Conta criada! Agora faça login.');
        setIsRegister(false);
      } else {
        const data = await api.login(username, password);
        onLogin(data); // data contém { token, username, userId }
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
        <h2>{isRegister ? 'Criar Conta' : 'Login RPG4v'}</h2>
        
        {error && <div style={{ color: '#fc8181' }}>{error}</div>}

        <input 
          type="text" placeholder="Usuário" required
          value={username} onChange={e => setUsername(e.target.value)}
          style={{ padding: '10px' }}
        />
        
        <input 
          type="password" placeholder="Senha" required
          value={password} onChange={e => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />

        <button type="submit" style={{ 
          padding: '10px', background: '#3182ce', color: 'white', border: 'none', cursor: 'pointer' 
        }}>
          {isRegister ? 'Registrar' : 'Entrar'}
        </button>

        <p 
          onClick={() => setIsRegister(!isRegister)} 
          style={{ textAlign: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#63b3ed' }}
        >
          {isRegister ? 'Já tenho conta' : 'Não tenho conta? Criar agora'}
        </p>
      </form>
    </div>
  );
}