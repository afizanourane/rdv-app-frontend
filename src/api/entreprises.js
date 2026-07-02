// src/api/entreprises.js
import api from './client';
export const getEntreprises = (params) => api.get('/entreprises/', { params });
export const creerEntreprise = (data) => api.post('/entreprises/', data);
export const getDomaines = () => api.get('/domaines/');
export const laisserAvis = (data) => api.post('/avis/', data);
