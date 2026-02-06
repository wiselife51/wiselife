import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './MotivationSurvey.css';

interface MotivationOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const motivationOptions: MotivationOption[] = [
  {
    id: 'sanar',
    label: 'Quiero sanar algo que duele',
    emoji: '💜',
    description: 'Heridas emocionales, traumas o dolor interno',
  },
  {
    id: 'crecimiento',
    label: 'Busco crecer como persona',
    emoji: '🌱',
    description: 'Desarrollo personal y autoconocimiento',
  },
  {
    id: 'ansiedad',
    label: 'Necesito manejar mi ansiedad',
    emoji: '🧘',
    description: 'Estres, nervios o pensamientos acelerados',
  },
  {
    id: 'relaciones',
    label: 'Quiero mejorar mis relaciones',
    emoji: '🤝',
    description: 'Familia, pareja, amigos o entorno social',
  },
  {
    id: 'proposito',
    label: 'Estoy buscando mi proposito',
    emoji: '✨',
    description: 'Sentido de vida, direccion o claridad',
  },
];

const MotivationSurvey: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSelect = (id: string) => {
    setSelected(prev => (prev === id ? null : id));
  };

  const handleSubmit = async () => {
    if (!user || !selected) return;

    setError(null);
    setSaving(true);

    try {
      console.log("[v0] MotivationSurvey - user.id:", user.id);
      console.log("[v0] MotivationSurvey - selected:", selected);

      const { error: updateError, data: updateData } = await supabase
        .from('profiles')
        .update({
          motivation: selected,
          motivation_completed: true,
        })
        .eq('id', user.id)
        .select();

      console.log("[v0] MotivationSurvey - updateError:", updateError);
      console.log("[v0] MotivationSurvey - updateData:", updateData);

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
      .update({ motivation_completed: true })
      .eq('id', user.id);

    navigate('/');
  };

  if (loading) return null;

  return (
    <div className="motivation-container">
      <video autoPlay loop muted playsInline className="motivation-video-bg">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="motivation-overlay" />

      <div className="motivation-content">
        <div className="motivation-card">
          <div className="motivation-header">
            <div className="motivation-step-badge">
              <span>Paso 3 de 3</span>
            </div>
            <h2 className="motivation-title">
              {'Por que estas '}
              <span className="motivation-title-highlight">aqui?</span>
            </h2>
            <p className="motivation-subtitle">
              Saber tu motivacion nos ayuda a personalizar tu experiencia
            </p>
          </div>

          <div className="motivation-options">
            {motivationOptions.map((option, index) => (
              <button
                key={option.id}
                className={`motivation-option ${selected === option.id ? 'motivation-option--selected' : ''}`}
                onClick={() => handleSelect(option.id)}
                type="button"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="motivation-option-emoji">
                  {option.emoji}
                </div>
                <div className="motivation-option-text">
                  <span className="motivation-option-label">{option.label}</span>
                  <span className="motivation-option-desc">{option.description}</span>
                </div>
                <div className="motivation-option-radio">
                  <div className="motivation-option-radio-inner" />
                </div>
              </button>
            ))}
          </div>

          {error && <p className="motivation-error">{error}</p>}

          <div className="motivation-actions">
            <button
              className="motivation-submit"
              onClick={handleSubmit}
              disabled={saving || !selected}
              type="button"
            >
              {saving ? (
                <>
                  <span className="motivation-btn-spinner" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>Comenzar mi viaje</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            <button className="motivation-skip" onClick={handleSkip} type="button">
              Omitir por ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationSurvey;
