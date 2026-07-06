import api from './client';
export const getCreneaux    = (p) => api.get('/creneaux/', { params: p });
export const getDisponibles = (p) => api.get('/creneaux/disponibles/', { params: p });
export const creerCreneau   = (d) => api.post('/creneaux/', d);
