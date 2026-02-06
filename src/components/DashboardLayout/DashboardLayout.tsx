import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dash-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dash-layout-main">
        <header className="dash-layout-topbar">
          <button
            className="dash-layout-menu-btn"
            onClick={() => setSidebarOpen(true)}
            type="button"
            aria-label="Abrir menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="dash-layout-page-title">{pageTitle}</h1>
          <div className="dash-layout-topbar-right">
            <button className="dash-layout-help-btn" type="button" aria-label="Ayuda">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Ayuda</span>
            </button>
          </div>
        </header>

        <main className="dash-layout-content">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="dash-layout-overlay"
          onClick={() => setSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Cerrar menu"
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
