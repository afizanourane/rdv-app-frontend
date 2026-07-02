// src/components/layout/AppLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './AppLayout.css';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className={`app-main ${collapsed ? 'app-main--collapsed' : ''}`}>
        <Header onToggleSidebar={() => setCollapsed(c => !c)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
