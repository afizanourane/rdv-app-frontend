// src/App.jsx — Routeur principal

// AVANT (react-scripts)
import './styles/globals.css';

// APRÈS (Vite — même chose, ça marche pareil)
import './styles/globals.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import InscriptionPage from './pages/InscriptionPage';
import DashboardPage from './pages/DashboardPage';
import RendezVousPage from './pages/RendezVousPage';
import NotificationsPage from './pages/NotificationsPage';
import Spinner from './components/common/Spinner';
import './styles/globals.css';

// Route protégée — redirige vers /login si non connecté
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Spinner size="lg" text="Chargement..." /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Route publique — redirige vers /dashboard si déjà connecté
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login"       element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/inscription" element={<PublicRoute><InscriptionPage /></PublicRoute>} />

      {/* Routes protégées */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/rendezvous"    element={<RendezVousPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Placeholder pages */}
        <Route path="/creneaux"    element={<PlaceholderPage title="Créneaux" />} />
        <Route path="/entreprises" element={<PlaceholderPage title="Entreprises" />} />
        <Route path="/paiements"   element={<PlaceholderPage title="Paiements" />} />
        <Route path="/users"       element={<PlaceholderPage title="Utilisateurs" />} />
        <Route path="/profil"      element={<PlaceholderPage title="Mon profil" />} />
      </Route>

      {/* Redirections */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Page simple pour les sections non encore développées
function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Cette section sera disponible prochainement.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
