const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

function getToken() {
  try {
    const saved = localStorage.getItem('rpg_user');
    return saved ? JSON.parse(saved).token : null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export const api = {
  register: (username, password) =>
    request('/api/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  login: (username, password) =>
    request('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  myGames: () => request('/api/games/my-games'),

  createGame: (name) =>
    request('/api/games/create', { method: 'POST', body: JSON.stringify({ name }) }),

  joinGame: (inviteCode) =>
    request('/api/games/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
};
