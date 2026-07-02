// src/api/paiements.js
import api from './client';
export const getPaiements = () => api.get('/paiements/');
export const initierPaiement = (data) => api.post('/paiements/', data);
export const confirmerPaiement = (id, data) => api.post(`/paiements/${id}/confirmer/`, data);
export const rembourserPaiement = (id) => api.post(`/paiements/${id}/rembourser/`);
