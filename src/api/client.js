import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('access_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(r => r, async err => {
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error();
      const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh });
      localStorage.setItem('access_token', data.access);
      orig.headers.Authorization = `Bearer ${data.access}`;
      return api(orig);
    } catch { localStorage.clear(); window.location.href = '/login'; }
  }
  return Promise.reject(err);
});
export default api;
