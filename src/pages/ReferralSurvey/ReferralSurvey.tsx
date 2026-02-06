import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './ReferralSurvey.css';

interface ReferralOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const referralOptions: ReferralOption[] = [
  {
    id: 'redes_sociales',
    label: 'Redes Sociales',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    id: 'recomendacion',
    label: 'Un amigo o familiar',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    id: 'google',
    label: 'Busqueda en Google',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.35z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  {
    id: 'publicidad',
    label: 'Publicidad online',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
  },
  {
    id: 'profesional_salud',
    label: 'Un profesional de salud',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: 'otro',
    label: 'Otro medio',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
];

const ReferralSurvey: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const toggleOption = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!user || selected.length === 0) return;

    setError(null);
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          referral_sources: selected,
          referral_completed: true,
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      navigate('/');
    } catch {
      setError('Ocurrio un error. Intenta de nuevo.');
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ referral_completed: true })
      .eq('id', user.id);

    navigate('/');
  };

  const userName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Usuario';

  if (loading) return null;

  return (
    <div className="referral-container">
      <video autoPlay loop muted playsInline className="referral-video-bg">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="referral-overlay" />

      <div className="referral-content">
        <div className="referral-card">
          <div className="referral-header">
            <div className="referral-icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h2 className="referral-title">
              {userName}, <span className="referral-title-highlight">{'como nos conociste?'}</span>
            </h2>
            <p className="referral-subtitle">
              Selecciona una o varias opciones. Esto nos ayuda a mejorar.
            </p>
          </div>

          <div className="referral-options">
            {referralOptions.map((option) => (
              <button
                key={option.id}
                className={`referral-option ${selected.includes(option.id) ? 'referral-option--selected' : ''}`}
                onClick={() => toggleOption(option.id)}
                type="button"
              >
                <div className="referral-option-icon">
                  {option.icon}
                </div>
                <span className="referral-option-label">{option.label}</span>
                <div className="referral-option-check">
                  {selected.includes(option.id) && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selected.length > 0 && (
            <div className="referral-selected-count">
              {selected.length} {selected.length === 1 ? 'opcion seleccionada' : 'opciones seleccionadas'}
            </div>
          )}

          {error && <p className="referral-error">{error}</p>}

          <div className="referral-actions">
            <button
              className="referral-submit"
              onClick={handleSubmit}
              disabled={saving || selected.length === 0}
              type="button"
            >
              {saving ? (
                <>
                  <span className="referral-btn-spinner" />
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

            <button className="referral-skip" onClick={handleSkip} type="button">
              Omitir por ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSurvey;
