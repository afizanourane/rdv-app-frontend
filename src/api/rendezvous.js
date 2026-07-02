// src/api/rendezvous.js
import api from './client';
export const getRendezVous     = (params) => api.get('/rendezvous/', { params });
export const getRendezVousById = (id)     => api.get(`/rendezvous/${id}/`);
export const creerRendezVous   = (data)   => api.post('/rendezvous/', data);
export const traiterRendezVous = (id, data) => api.post(`/rendezvous/${id}/traiter/`, data);
export const annulerRendezVous = (id)     => api.post(`/rendezvous/${id}/annuler/`);
export const getTableauDeBord  = ()       => api.get('/rendezvous/tableau-de-bord/');
