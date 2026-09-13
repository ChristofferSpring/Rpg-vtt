export const BASE_URL = import.meta.env.VITE_API_URL
  || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');

export function getToken() {
  try {
    const saved = localStorage.getItem('rpg_user');
    return saved ? JSON.parse(saved).token : null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token) {
    // token's dead, kick back to login
    localStorage.removeItem('rpg_user');
    window.location.reload();
  }

  if (!response.ok) throw new Error(data.error || 'Request failed');
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

  getBoard: (gameId) => request(`/api/games/${gameId}/board`),

  getMembers: (gameId) => request(`/api/games/${gameId}/members`),

  createToken: (gameId, tokenData) =>
    request(`/api/games/${gameId}/tokens`, { method: 'POST', body: JSON.stringify(tokenData) }),

  uploadBackground: (gameId, file) => {
    const formData = new FormData();
    formData.append('background', file);
    return request(`/api/games/${gameId}/background`, { method: 'POST', body: formData });
  },
};
