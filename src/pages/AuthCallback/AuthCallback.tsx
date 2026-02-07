import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './AuthCallback.css';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      const nextPath = searchParams.get('next');

      if (error) {
        console.error('Error en auth callback:', error);
        navigate('/login');
        return;
      }

      if (session?.user) {
        // Si viene del flujo de psicologos
        if (nextPath && nextPath.startsWith('/psicologo')) {
          const { data: psyProfile } = await supabase
            .from('psychologists')
            .select('onboarding_completed')
            .eq('user_id', session.user.id)
            .single();

          if (!psyProfile || !psyProfile.onboarding_completed) {
            navigate('/psicologo/onboarding');
          } else {
            navigate('/psicologo/dashboard');
          }
          return;
        }

        // Flujo normal de usuarios
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, referral_completed, motivation_completed')
          .eq('id', session.user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate('/onboarding');
        } else if (!profile?.referral_completed) {
          navigate('/referral-survey');
        } else if (!profile?.motivation_completed) {
          navigate('/motivation-survey');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

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
