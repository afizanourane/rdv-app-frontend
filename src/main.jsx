import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Pas d'import de index.css ici — notre globals.css est importé dans App.jsx

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)