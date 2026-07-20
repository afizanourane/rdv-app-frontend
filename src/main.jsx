import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/theme.css'

// Attraper les erreurs globales
window.addEventListener('error', e => {
  console.error('Erreur globale:', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', e => {
  console.error('Promise rejetée:', e.reason);
});

const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<h1 style="color:red">Erreur: #root introuvable</h1>';
} else {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch(e) {
    console.error('Erreur render:', e);
    root.innerHTML = `<div style="padding:20px;color:red;font-family:monospace">
      <h2>Erreur de rendu</h2>
      <pre>${e.message}</pre>
    </div>`;
  }
}