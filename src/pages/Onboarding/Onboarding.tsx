import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './Onboarding.css';

const Onboarding: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Mostrar bienvenida por 2.5 segundos, luego pasar al formulario
  useEffect(() => {
    if (step === 'welcome') {
      const timer = setTimeout(() => setStep('form'), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone || null,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      navigate('/dashboard');
    } catch {
      setError('Ocurrio un error. Intenta de nuevo.');
      setSaving(false);
    }
  };

  const userName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Usuario';

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  if (loading) return null;

  return (
    <div className="onboarding-container">
      <video autoPlay loop muted playsInline className="onboarding-video-bg">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="onboarding-overlay" />

      <div className="onboarding-content">
        {step === 'welcome' ? (
          <div className="onboarding-welcome" key="welcome">
            <div className="onboarding-check-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            {userAvatar && (
              <img src={userAvatar} alt={userName} className="onboarding-avatar" crossOrigin="anonymous" />
            )}
            <h1 className="onboarding-welcome-title">Cuenta creada exitosamente</h1>
            <p className="onboarding-welcome-subtitle">
              Bienvenido/a, <span className="onboarding-name-highlight">{userName}</span>
            </p>
          </div>
        ) : (
          <div className="onboarding-card" key="form">
            <div className="onboarding-card-header">
              {userAvatar && (
                <img src={userAvatar} alt={userName} className="onboarding-card-avatar" crossOrigin="anonymous" />
              )}
              <h2 className="onboarding-card-title">Completa tu perfil</h2>
              <p className="onboarding-card-subtitle">
                Necesitamos algunos datos para personalizar tu experiencia
              </p>
            </div>

            <form className="onboarding-form" onSubmit={handleSubmit}>
              {/* Fecha de nacimiento */}
              <div className="onboarding-field">
                <label className="onboarding-label" htmlFor="dateOfBirth">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Fecha de nacimiento
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className="onboarding-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Telefono */}
              <div className="onboarding-field">
                <label className="onboarding-label" htmlFor="phone">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Numero de telefono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="onboarding-input"
                  placeholder="+57 300 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Genero */}
              <div className="onboarding-field">
                <label className="onboarding-label" htmlFor="gender">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Genero
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="onboarding-input onboarding-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Selecciona tu genero</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>

              {error && <p className="onboarding-error">{error}</p>}

              <button className="onboarding-submit" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <span className="onboarding-btn-spinner" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
