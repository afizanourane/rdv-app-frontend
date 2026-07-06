


import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck, LayoutDashboard, Calendar, Clock,
  Building2, CreditCard, Bell, Users, LogOut, Settings, ChevronRight, BarChart2
} from 'lucide-react';

// Navigation strictement filtrée par rôle
const NAV = {
  client: [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/rendezvous',    icon: Calendar,        label: 'Mes rendez-vous',  section: 'Mon espace' },
    { to: '/creneaux',      icon: Clock,           label: 'Créneaux dispo.' },
    { to: '/entreprises',   icon: Building2,       label: 'Entreprises' },
    { to: '/paiements',     icon: CreditCard,      label: 'Mes paiements' },
    { to: '/notifications', icon: Bell,            label: 'Notifications' },
    
      // Dans NAV.client, NAV.personnel, NAV.admin :
    { to: '/calendrier', icon: CalendarCheck, label: 'Calendrier' },
  ],
  personnel: [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/creneaux',      icon: Clock,           label: 'Mes créneaux',    section: 'Mon espace' },
    { to: '/rendezvous',    icon: Calendar,        label: 'Rendez-vous' },
    { to: '/notifications', icon: Bell,            label: 'Notifications' },

        // Dans NAV.client, NAV.personnel, NAV.admin :
    { to: '/calendrier', icon: CalendarCheck, label: 'Calendrier' },
  ],
  admin: [
    { to: '/dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/rendezvous',    icon: Calendar,        label: 'Rendez-vous',     section: 'Gestion' },
    { to: '/creneaux',      icon: Clock,           label: 'Créneaux' },
    { to: '/entreprises',   icon: Building2,       label: 'Entreprises' },
    { to: '/paiements',     icon: CreditCard,      label: 'Paiements' },
    { to: '/utilisateurs',  icon: Users,           label: 'Utilisateurs',    section: 'Administration' },
    { to: '/notifications', icon: Bell,            label: 'Notifications' },
    
    { to: '/statistiques', icon: BarChart2, label: 'Statistiques', section: 'Administration' },

        // Dans NAV.client, NAV.personnel, NAV.admin :
    { to: '/calendrier', icon: CalendarCheck, label: 'Calendrier' },
  ],
};

export default function Sidebar({ collapsed }) {
  const { user, logout, isAdmin, isPersonnel } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = isAdmin ? 'admin' : isPersonnel ? 'personnel' : 'client';
  const nav       = NAV[role] || NAV.client;
  const initials  = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : '?';

  let currentSection = null;

  return (
    <aside className="sidebar" style={{ width: collapsed ? 'var(--sidebar-w-col)' : 'var(--sidebar-w)' }}>

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <CalendarCheck size={20} />
        </div>
        {!collapsed && (
          <span className="sidebar-logo-text">RDV<span>Pro</span></span>
        )}
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {nav.map(({ to, icon: Icon, label, section }) => {
          const active      = location.pathname === to;
          const showSection = section && section !== currentSection && !collapsed;
          if (showSection) currentSection = section;

          return (
            <div key={to}>
              {showSection && (
                <div style={{ padding: '12px 8px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {section}
                </div>
              )}
              <button
                className={`nav-item${active ? ' active' : ''}`}
                onClick={() => navigate(to)}
                title={collapsed ? label : undefined}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                {!collapsed && (
                  <>
                    <span className="nav-label">{label}</span>
                    <ChevronRight size={13} style={{ opacity: active ? .7 : 0, color: 'var(--primary)' }} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer utilisateur */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => navigate('/profil')}>
          <div className="s-avatar">{initials}</div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="s-user-name">{user?.prenom} {user?.nom}</div>
              <div className="s-user-role" style={{
                color: role === 'admin' ? 'var(--primary)' : role === 'personnel' ? '#f59e0b' : 'var(--text-3)'
              }}>
                {role}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {!collapsed && (
            <button className="nav-item" style={{ flex: 1, fontSize: 12 }}
              onClick={() => navigate('/profil')}>
              <span className="nav-icon"><Settings size={15} /></span>
              <span className="nav-label">Paramètres</span>
            </button>
          )}
          <button className="s-logout"
            onClick={async () => { await logout(); navigate('/login'); }}
            title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
