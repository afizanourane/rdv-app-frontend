import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header  from './Header';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const ml = collapsed ? 72 : 240;
  return (
    <div className="app-wrap">
      <Sidebar collapsed={collapsed} />
      <div className="app-main" style={{ marginLeft: ml }}>
        <Header onToggle={() => setCollapsed(c => !c)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
