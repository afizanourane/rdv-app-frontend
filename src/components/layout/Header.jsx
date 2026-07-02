// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [nbNonLues, setNbNonLues] = useState(0);

  useEffect(() => {
    getNotifications({ non_lues: true })
      .then(r => setNbNonLues(r.data.non_lues || 0))
      .catch(() => {});
  }, []);

  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onToggleSidebar}><Menu size={20} /></button>
        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input className="header-search-input" placeholder="Rechercher…" />
        </div>
      </div>
      <div className="header-right">
        <p className="header-greeting">
          {salut}, <strong>{user?.prenom}</strong>
        </p>
        <button className="header-notif-btn" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          {nbNonLues > 0 && <span className="header-notif-badge">{nbNonLues}</span>}
        </button>
      </div>
    </header>
  );
}
