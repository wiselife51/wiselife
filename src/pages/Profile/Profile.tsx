import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import './Profile.css';

interface ProfileData {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  referral_credits: number;
}

const MENU_ITEMS = [
  {
    label: 'Configuracion de cuenta',
    icon: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  },
  {
    label: 'Mis paquetes',
    icon: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z M3.3 7l8.7 5 8.7-5 M12 22V12',
  },
  {
    label: 'Mis citas',
    icon: 'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  },
  {
    label: 'Pagos',
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v12 M8 10h8 M8 14h8',
  },
  {
    label: 'Mis especialistas',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    label: 'Especialistas favoritos',
    icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
];

const Profile: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
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
          .select('full_name, email, avatar_url, phone, date_of_birth, gender, referral_credits')
          .eq('id', user.id)
          .single();
        setProfileData(data);
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
      <div className="dash-loading-screen">
        <div className="dash-loading-spinner" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  const displayName = profileData?.full_name
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || 'Usuario';
  const displayEmail = profileData?.email || user?.email || '';
  const avatarUrl = profileData?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DashboardLayout pageTitle="Mi perfil">
      <div className="profile-page">
        {/* User card */}
        <div className="profile-user-card">
          <div className="profile-user-info">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="profile-avatar" crossOrigin="anonymous" />
            ) : (
              <div className="profile-avatar-placeholder">{initial}</div>
            )}
            <div className="profile-user-details">
              <h2 className="profile-user-name">{displayName}</h2>
              <p className="profile-user-email">{displayEmail}</p>
              <button className="profile-manage-link" type="button">
                {'Administrar cuentas familiares >'}
              </button>
            </div>
          </div>
        </div>

        {/* Referral card */}
        <div className="profile-referral-card">
          <div className="profile-referral-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className="profile-referral-text">
            <h3>Refiere a un amigo</h3>
            <p>Ayuda a alguien a empezar su camino hacia el bienestar y recibe creditos por cada referido.</p>
            <button className="profile-referral-link" type="button">
              {'Invitar ahora ->'}
            </button>
          </div>
        </div>

        {/* General section */}
        <h3 className="profile-section-title">General</h3>

        <div className="profile-menu-list">
          {MENU_ITEMS.map((item) => (
            <button key={item.label} className="profile-menu-item" type="button">
              <div className="profile-menu-item-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button className="profile-logout-btn" type="button" onClick={handleSignOut}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesion</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
