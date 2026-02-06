import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Usuario';

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  if (loading) return null;

  return (
    <div className="dashboard-container">
      <video autoPlay loop muted playsInline className="dashboard-video-bg">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="dashboard-overlay" />

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="dashboard-header">
            {userAvatar && (
              <img src={userAvatar} alt={userName} className="dashboard-avatar" crossOrigin="anonymous" />
            )}
            <h1 className="dashboard-title">
              Bienvenido, <span className="dashboard-name">{userName}</span>
            </h1>
            <p className="dashboard-subtitle">Tu perfil esta completo. Pronto tendras acceso a todos los servicios de Vida Sabia.</p>
          </div>

          <div className="dashboard-info">
            <div className="dashboard-info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Perfil completado</span>
            </div>
            <div className="dashboard-info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Encuesta completada</span>
            </div>
            <div className="dashboard-info-item dashboard-info-item--pending">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Servicios disponibles pronto</span>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="dashboard-home-btn" onClick={() => navigate('/')} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Ir al inicio</span>
            </button>
            <button className="dashboard-logout-btn" onClick={handleSignOut} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Cerrar sesion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
