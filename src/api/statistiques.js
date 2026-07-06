import api from './client';
export const getStatsAvancees = () => api.get('/statistiques/avancees/');