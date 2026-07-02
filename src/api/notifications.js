// src/api/notifications.js
import api from './client';
export const getNotifications    = (params) => api.get('/notifications/', { params });
export const marquerLue          = (id)     => api.post(`/notifications/${id}/lire/`);
export const marquerToutesLues   = ()       => api.post('/notifications/tout-lire/');
