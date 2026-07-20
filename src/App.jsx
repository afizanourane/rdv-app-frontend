import MotDePasseOubliePage from './pages/MotDePasseOubliePage';
import ResetPasswordPage    from './pages/ResetPasswordPage';


import CalendrierPage from './pages/CalendrierPage';

import StatistiquesPage from './pages/StatistiquesPage';





import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout         from './components/layout/AppLayout';
import LandingPage       from './pages/LandingPage';
import LoginPage         from './pages/LoginPage';
import InscriptionPage   from './pages/InscriptionPage';
import DashboardPage     from './pages/DashboardPage';
import RendezVousPage    from './pages/RendezVousPage';
import CreneauxPage      from './pages/CreneauxPage';
import EntreprisesPage   from './pages/EntreprisesPage';
import PaiementsPage     from './pages/PaiementsPage';
import NotificationsPage from './pages/NotificationsPage';
import UtilisateursPage  from './pages/UtilisateursPage';
import ProfilPage        from './pages/ProfilPage';
import PriseRendezVousPage from './pages/PriseRendezVousPage';
import DomainesPage   from './pages/DomainesPage';
import PersonnelsPage from './pages/PersonnelsPage';
import ChatPage from './pages/ChatPage';

// ── Guards ────────────────────────────────────────────────────

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, fontFamily: 'Inter,sans-serif', background: 'var(--bg-main)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Chargement…</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

// Admin only — redirige les non-admins vers dashboard
function AdminOnly({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/login"     replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// Personnel ne peut pas accéder à certaines pages
function NotPersonnel({ children }) {
  const { user, isPersonnel } = useAuth();
  if (!user)       return <Navigate to="/login"     replace />;
  if (isPersonnel) return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Routes ────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/"            element={<LandingPage />} />
      <Route path="/login"       element={<Public><LoginPage /></Public>} />
      <Route path="/inscription" element={<Public><InscriptionPage /></Public>} />

      {/*Mot de passe oublier*/}
      <Route path="/mot-de-passe-oublie"    element={<Public><MotDePasseOubliePage /></Public>} />
      <Route path="/reset-password/:token"  element={<Public><ResetPasswordPage />   </Public>} />

      {/* Pages protégées dans le layout */}
      <Route element={<Private><AppLayout /></Private>}>

        {/* Toutes les pages connectées */}
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profil"        element={<ProfilPage />} />

        {/* RDV : tous les rôles voient la page, actions filtrées par rôle */}
        <Route path="/rendezvous"    element={<RendezVousPage />} />

        {/* Prise de RDV — CLIENT SEULEMENT (pas le personnel) */}
        <Route path="/prendre-rdv" element={
        <NotPersonnel><PriseRendezVousPage /></NotPersonnel>} />

        {/* Créneaux : tous les rôles, actions filtrées par rôle */}
        <Route path="/creneaux"      element={<CreneauxPage />} />

        {/* Entreprises : client et admin (pas le personnel) */}
        <Route path="/entreprises"   element={
          <NotPersonnel><EntreprisesPage /></NotPersonnel>
        } />

        {/* Paiements : client et admin (pas le personnel) */}
        <Route path="/paiements"     element={
          <NotPersonnel><PaiementsPage /></NotPersonnel>
        } />

        {/* Domaines — tous les connectés */}
        <Route path="/domaines" element={<DomainesPage />} />

        {/* Personnels — admin seulement */}
        <Route path="/personnels" element={
          <AdminOnly><PersonnelsPage /></AdminOnly>} />
        {/* Calendrier visuel */}
        <Route path="/calendrier" element={<CalendrierPage />} />

        {/* Dans les routes admin :*/} 
        <Route path="/statistiques" element={
          <AdminOnly><StatistiquesPage /></AdminOnly>} />

        
        {/* Utilisateurs : ADMIN seulement */}
        <Route path="/utilisateurs"  element={
          <AdminOnly><UtilisateursPage /></AdminOnly>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      {/* Chat — tous les rôles connectés */}
      <Route path="/chat" element={<ChatPage />} />
    </Routes>

    
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background:   'var(--bg-card)',
                color:        'var(--text-1)',
                border:       '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow:    'var(--shadow-lg)',
                fontSize:     '13.5px',
                fontFamily:   'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
