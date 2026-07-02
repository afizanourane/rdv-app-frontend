// src/api/auth.js
import api from './client';
export const login = (email, password) => api.post('/auth/login/', { email, password });
export const logout = (refresh) => api.post('/auth/logout/', { refresh });
export const changerMotDePasse = (data) => api.post('/auth/changer-mot-de-passe/', data);
export const getMonProfil = () => api.get('/users/moi/');
export const updateMonProfil = (data) => api.put('/users/moi/', data);
export const inscrire = (data) => api.post('/users/inscription/', data);
