import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMonProfil } from '../api/auth';
import toast from 'react-hot-toast';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('access_token');
    if (t) {
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
    if (data.deux_fa_requis) {
      return {
        deux_fa_requis: true,
        user_id:        data.user_id,
        email_masque:   data.email_masque,
        message:        data.message,
      };
    }
    localStorage.setItem('access_token',  data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.utilisateur);
    return data.utilisateur;
  }, []);

  const logout = useCallback(async () => {
    const r = localStorage.getItem('refresh_token');
    try { if (r) await apiLogout(r); } catch {}
    localStorage.clear();
    setUser(null);
    toast.success('Déconnexion réussie');
  }, []);

  return (
    <Ctx.Provider value={{
      user, loading, login, logout,
      isAdmin:     user?.role === 'admin',
      isClient:    user?.role === 'client',
      isPersonnel: user?.role === 'personnel',
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth hors AuthProvider');
  return c;
};