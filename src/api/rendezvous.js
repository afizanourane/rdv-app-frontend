import api from './client';

export const getRdvs      = (params)   => api.get('/rendezvous/', { params });
export const getRdvById   = (id)       => api.get(`/rendezvous/${id}/`);
export const creerRdv     = (data)     => api.post('/rendezvous/', data);
export const traiterRdv   = (id, data) => api.post(`/rendezvous/${id}/traiter/`, data);
export const annulerRdv   = (id)       => api.post(`/rendezvous/${id}/annuler/`);
export const getDashboard = ()         => api.get('/rendezvous/tableau-de-bord/');

// Export CSV — télécharge le fichier directement
export const exportRdvsCsv = (params = {}) => {
  const token  = localStorage.getItem('access_token');
  const query  = new URLSearchParams({ ...params, export: 'csv' }).toString();
  const url    = `http://127.0.0.1:8000/api/rendezvous/?${query}`;
  const link   = document.createElement('a');
  link.href    = url;
  // Axios ne gère pas bien les téléchargements — on passe par fetch
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.blob())
    .then(blob => {
      const objUrl  = URL.createObjectURL(blob);
      link.href     = objUrl;
      link.download = `rendez-vous-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objUrl);
    });
};