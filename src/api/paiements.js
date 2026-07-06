import api from './client';
export const getPaiements       = ()       => api.get('/paiements/');
export const initierPaiement    = (d)      => api.post('/paiements/', d);
export const confirmerPaiement  = (id, d)  => api.post(`/paiements/${id}/confirmer/`, d);
export const rembourserPaiement = (id)     => api.post(`/paiements/${id}/rembourser/`);
