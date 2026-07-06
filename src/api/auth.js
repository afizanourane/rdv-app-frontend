import api from './client';
export const login           = (email, password) => api.post('/auth/login/', { email, password });
export const logout          = (refresh)         => api.post('/auth/logout/', { refresh });
export const changerMdp      = (data)            => api.post('/auth/changer-mot-de-passe/', data);
export const getMonProfil    = ()                => api.get('/users/moi/');
export const updateMonProfil = (data)            => api.put('/users/moi/', data);
export const inscrire        = (data)            => api.post('/users/inscription/', data);
export const getUtilisateurs = (params)          => api.get('/users/', { params });
export const getStatistiques = ()                => api.get('/users/statistiques/');



// ── Reset mot de passe ────────────────────────────────────────
export const demanderReset  = (email)  => api.post('/auth/demander-reset/', { email });
export const validerToken   = (token)  => api.get('/auth/valider-token/', { params: { token } });
export const resetPassword  = (data)  => api.post('/auth/reset-password/', data);


// Gestion admin des utilisateurs
export const creerUtilisateur     = (data)    => api.post('/users/creer/', data);
export const getUtilisateur       = (id)      => api.get(`/users/${id}/`);
export const modifierUtilisateur  = (id, data)=> api.put(`/users/${id}/`, data);
export const supprimerUtilisateur = (id)      => api.delete(`/users/${id}/`);
export const activerUtilisateur   = (id)      => api.post(`/users/${id}/activer/`);

// PDF reçu
export const telechargerRecu = (paiement_id) => {
  const token = localStorage.getItem('access_token');
  const url   = `http://127.0.0.1:8000/api/paiements/${paiement_id}/recu/`;
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => {
      if (!r.ok) throw new Error('Erreur PDF');
      return r.blob();
    })
    .then(blob => {
      const objUrl  = URL.createObjectURL(blob);
      const link    = document.createElement('a');
      link.href     = objUrl;
      link.download = `recu-paiement-${paiement_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objUrl);
    });
};
export const envoyerRecu = (id) => api.post(`/paiements/${id}/envoyer-recu/`);