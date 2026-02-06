import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './Dashboard.css';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  motivation: string | null;
}

const motivationMessages: Record<string, string> = {
  sanar: 'Sanar es un acto de valentia. Estamos contigo.',
  crecimiento: 'Cada paso que das te acerca a tu mejor version.',
  ansiedad: 'Respira profundo. Aqui encontraras calma.',
  relaciones: 'Las mejores relaciones comienzan contigo.',
  proposito: 'Tu proposito te esta esperando. Vamos a descubrirlo.',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos dias,';
  if (hour < 18) return 'Buenas tardes,';
  return 'Buenas noches,';
}

const Dashboard: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, motivation')
          .eq('id', user.id)
          .single();

        setProfile(data);
        setLoadingProfile(false);
      };
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || loadingProfile) {
    return (
      <div className="dashboard-container">
        <video autoPlay loop muted playsInline className="dashboard-video-bg">
          <source src="/assets/VideoFondo.mp4" type="video/mp4" />
        </video>
        <div className="dashboard-overlay" />
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
          <p>Cargando tu espacio...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Viajero';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const greeting = getGreeting();
  const motivationMsg = profile?.motivation ? motivationMessages[profile.motivation] : 'Bienvenido a tu espacio de bienestar.';

  return (
    <div className="dashboard-container">
      <video autoPlay loop muted playsInline className="dashboard-video-bg">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="dashboard-overlay" />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <button className="dashboard-home-btn" onClick={() => navigate('/')} type="button" aria-label="Ir al inicio">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
          <div className="dashboard-header-logo">Vida Sabia</div>
          <button className="dashboard-signout-btn" onClick={handleSignOut} type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Salir</span>
          </button>
        </header>

        <div className="dashboard-welcome-card">
          <div className="dashboard-welcome-left">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="dashboard-avatar" crossOrigin="anonymous" />
            ) : (
              <div className="dashboard-avatar-placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="dashboard-welcome-text">
              <p className="dashboard-greeting">{greeting}</p>
              <h1 className="dashboard-name">{displayName}</h1>
            </div>
          </div>
          <div className="dashboard-motivation-msg">
            <p>{motivationMsg}</p>
          </div>
        </div>

        <div className="dashboard-section-title">
          <h2>Tu espacio</h2>
          <span className="dashboard-section-badge">Proximamente</span>
        </div>

        <div className="dashboard-cards-grid">
          <div className="dashboard-card dashboard-card--meditation">
            <div className="dashboard-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3>Meditaciones</h3>
            <p>Sesiones guiadas para tu calma interior</p>
          </div>

          <div className="dashboard-card dashboard-card--journal">
            <div className="dashboard-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>Diario</h3>
            <p>Escribe y reflexiona sobre tu dia</p>
          </div>

          <div className="dashboard-card dashboard-card--specialists">
            <div className="dashboard-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Especialistas</h3>
            <p>Conecta con profesionales de bienestar</p>
          </div>

          <div className="dashboard-card dashboard-card--resources">
            <div className="dashboard-card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3>Recursos</h3>
            <p>Articulos, videos y herramientas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
