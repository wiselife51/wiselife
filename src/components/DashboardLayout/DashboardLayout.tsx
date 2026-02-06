import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Sidebar/Sidebar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'U';

  return (
    <div className="dash-layout">
      {/* Video de fondo */}
      <video autoPlay loop muted playsInline className="dash-layout-video">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="dash-layout-overlay" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dash-layout-main">
        <header className="dash-layout-topbar">
          <button
            className="dash-layout-menu-btn"
            onClick={() => setSidebarOpen(true)}
            type="button"
            aria-label="Abrir menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="dash-layout-page-title">{pageTitle}</h1>
          <div className="dash-layout-topbar-right">
            <button className="dash-layout-help-btn" type="button" aria-label="Ayuda">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Ayuda</span>
            </button>
            <button className="dash-layout-avatar-btn" type="button" onClick={() => navigate('/mi-perfil')} aria-label="Mi perfil">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="dash-layout-avatar" crossOrigin="anonymous" />
              ) : (
                <span className="dash-layout-avatar-placeholder">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </button>
          </div>
        </header>

        <main className="dash-layout-content">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="dash-layout-backdrop"
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
