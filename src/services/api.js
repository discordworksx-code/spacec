const request = async (path, options = {}) => {
  const token = localStorage.getItem('space_user_token') || localStorage.getItem('space_admin_token');
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  checkUserStatus: () => request('/api/auth/status'),
  adminLogin: (username, password) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  verifyAdmin: () => request('/api/admin/verify'),
};
