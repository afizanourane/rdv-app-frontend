// =============================================================
// src/context/AuthContext.jsx — Gestion globale de l'auth
// =============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMonProfil } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Au démarrage : vérifier si un token existe
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMonProfil()
        .then(r => setUser(r.data))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await apiLogin(email, password);
    localStorage.setItem('access_token',  data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.utilisateur);
    return data.utilisateur;
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    try { if (refresh) await apiLogout(refresh); } catch {}
    localStorage.clear();
    setUser(null);
    toast.success('Déconnexion réussie');
  }, []);

  const isAdmin     = user?.role === 'admin';
  const isClient    = user?.role === 'client';
  const isPersonnel = user?.role === 'personnel';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isClient, isPersonnel }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider');
  return ctx;
};
