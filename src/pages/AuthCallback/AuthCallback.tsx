import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './AuthCallback.css';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error en auth callback:', error);
        navigate('/login');
        return;
      }

      if (session?.user) {
        // Verificar si el usuario ya completo el onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="callback-container">
      <video autoPlay loop muted playsInline className="callback-video-bg">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="callback-overlay" />
      <div className="callback-content">
        <div className="callback-spinner" />
        <p className="callback-text">Verificando tu cuenta...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
