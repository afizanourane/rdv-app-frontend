import api from './client';
export const getEvenements = (params) => api.get('/calendrier/', { params });