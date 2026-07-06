import api from './client';
export const getEntreprises  = (p) => api.get('/entreprises/', { params: p });
export const creerEntreprise = (d) => api.post('/entreprises/', d);
export const getDomaines     = ()  => api.get('/domaines/');
export const laisserAvis     = (d) => api.post('/avis/', d);
