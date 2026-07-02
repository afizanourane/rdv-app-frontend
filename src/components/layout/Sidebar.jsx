// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Clock, Building2,
  CreditCard, Bell, Users, LogOut, CalendarCheck,
  ChevronRight, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import './Sidebar.css';

const NAV_CLIENT = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/rendezvous',    icon: Calendar,         label: 'Mes rendez-vous' },
  { to: '/creneaux',      icon: Clock,            label: 'Créneaux disponibles' },
  { to: '/entreprises',   icon: Building2,        label: 'Entreprises' },
  { to: '/paiements',     icon: CreditCard,       label: 'Mes paiements' },
  { to: '/notifications', icon: Bell,             label: 'Notifications' },
];

const NAV_ADMIN = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/rendezvous',    icon: CalendarCheck,    label: 'Rendez-vous' },
  { to: '/creneaux',      icon: Clock,            label: 'Créneaux' },
  { to: '/entreprises',   icon: Building2,        label: 'Entreprises' },
  { to: '/paiements',     icon: CreditCard,       label: 'Paiements' },
  { to: '/users',         icon: Users,            label: 'Utilisateurs' },
  { to: '/notifications', icon: Bell,             label: 'Notifications' },
];

const NAV_PERSONNEL = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/creneaux',      icon: Clock,            label: 'Mes créneaux' },
  { to: '/rendezvous',    icon: Calendar,         label: 'Rendez-vous' },
  { to: '/notifications', icon: Bell,             label: 'Notifications' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin, isPersonnel } = useAuth();
  const navigate = useNavigate();

  const nav = isAdmin ? NAV_ADMIN : isPersonnel ? NAV_PERSONNEL : NAV_CLIENT;
  const initiales = user ? `${user.prenom?.[0]}${user.nom?.[0]}`.toUpperCase() : '??';

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <aside className={clsx('sidebar', collapsed && 'sidebar--collapsed')}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CalendarCheck size={22} />
        </div>
        {!collapsed && <span className="sidebar-logo-text">RendezVous</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'sidebar-link--active')}
          >
            <Icon size={20} className="sidebar-link-icon" />
            {!collapsed && <span className="sidebar-link-label">{label}</span>}
            {!collapsed && <ChevronRight size={14} className="sidebar-link-arrow" />}
          </NavLink>
        ))}
      </nav>

      {/* Profil utilisateur */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initiales}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.prenom} {user?.nom}</p>
              <p className="sidebar-user-role">{user?.role}</p>
            </div>
          )}
        </div>
        <div className="sidebar-actions">
          {!collapsed && (
            <NavLink to="/profil" className="sidebar-action-btn" title="Paramètres">
              <Settings size={16} />
            </NavLink>
          )}
          <button className="sidebar-action-btn sidebar-action-btn--danger" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
