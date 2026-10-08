import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: { fullName: string; email: string; avatarUrl: string | null };
}

const NAV_ITEMS: { to: string; label: string; icon: React.ReactNode }[] = [
  {
    to: '/dashboard',
    label: 'Inicio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/especialistas',
    label: 'Especialistas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2" />
        <path d="M3 20c.7-3.2 2.7-5 6-5s5.3 1.8 6 5M14 16c2.5-.2 4.5 1.2 5 4" />
      </svg>
    ),
  },
  {
    to: '/mis-citas',
    label: 'Mis citas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/mi-perfil',
    label: 'Mi perfil',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" />
      </svg>
    ),
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, profile }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <aside
        className={`psy-dash-sidebar ${isOpen ? 'psy-dash-sidebar--open' : ''}`}
        style={isOpen ? { position: 'fixed', inset: '0 auto 0 0', zIndex: 1000, transform: 'translate3d(0, 0, 0)' } : undefined}
      >
        <div className="psy-dash-sidebar-header">
          <div className="psy-dash-brand">
            <div className="psy-dash-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <defs>
                  <linearGradient id="pt-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4dd0e1" />
                    <stop offset="50%" stopColor="#42a5f5" />
                    <stop offset="100%" stopColor="#7e57c2" />
                  </linearGradient>
                </defs>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#pt-logo-grad)" />
              </svg>
              <span>Vida Sabia</span>
            </div>
            <div className="psy-dash-badge">Paciente</div>
          </div>
        </div>

        <div className="psy-dash-profile">
          <div className="psy-dash-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} crossOrigin="anonymous" />
            ) : (
              <span>{profile.fullName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h3 className="psy-dash-name">{profile.fullName}</h3>
        </div>

        <nav className="psy-dash-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `psy-dash-nav-item ${isActive ? 'psy-dash-nav-item--active' : ''}`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="psy-dash-signout" onClick={handleSignOut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesion</span>
        </button>
      </aside>

      {isOpen && (
        <button
          type="button"
          className="psy-mobile-menu-backdrop"
          aria-label="Cerrar menú"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
