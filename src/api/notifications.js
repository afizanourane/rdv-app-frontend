import api from './client';
export const getNotifications  = (p)  => api.get('/notifications/', { params: p });
export const marquerLue        = (id) => api.post(`/notifications/${id}/lire/`);
export const marquerToutesLues = ()   => api.post('/notifications/tout-lire/');
