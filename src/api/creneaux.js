// src/api/creneaux.js
import api from './client';
export const getCreneaux           = (params) => api.get('/creneaux/', { params });
export const getCreneauxDisponibles = (params) => api.get('/creneaux/disponibles/', { params });
export const creerCreneau          = (data)   => api.post('/creneaux/', data);
