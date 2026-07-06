import { useState, useEffect } from 'react';
import { Bell, Menu, Search, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';

export default function Header({ onToggle }) {
  const { user } = useAuth();
  const { theme, toggle, isDark } = useTheme();
  const navigate = useNavigate();
  const [nb, setNb] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getNotifications().then(r => setNb(r.data.non_lues || 0)).catch(() => {});
  }, []);

  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const now   = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
  const init  = user ? `${user.prenom?.[0]||''}${user.nom?.[0]||''}`.toUpperCase() : '?';

  return (
    <header className="app-header">
      <div className="h-left">
        <button className="h-toggle" onClick={onToggle}><Menu size={20} /></button>
        <div className="h-search">
          <Search size={15} className="h-search-icon" />
          <input
            className="h-search-input"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="h-right">
        {/* Infos */}
        <div style={{ textAlign: 'right', marginRight: 4 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {salut}, <strong style={{ color: 'var(--text-1)' }}>{user?.prenom}</strong>
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'capitalize' }}>{now}</p>
        </div>

        {/* Notifications */}
        <button className="h-icon-btn" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          {nb > 0 && <span className="h-badge">{nb > 9 ? '9+' : nb}</span>}
        </button>

        {/* Theme toggle */}
        <button className="theme-btn" onClick={toggle}>
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? 'Clair' : 'Sombre'}
        </button>

        {/* User */}
        <div className="h-user" onClick={() => navigate('/profil')}>
          <div className="h-avatar">{init}</div>
          <span className="h-user-name">{user?.prenom} {user?.nom}</span>
          <ChevronDown size={14} style={{ color: 'var(--text-4)' }} />
        </div>
      </div>
    </header>
  );
}
