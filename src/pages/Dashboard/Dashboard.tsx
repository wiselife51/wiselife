import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import './Dashboard.css';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  motivation: string | null;
}

const SPECIALTIES = [
  'Relaciones interpersonales',
  'Ansiedad',
  'Depresion',
  'Sexualidad',
  'Traumas',
  'Cambios de Vida',
  'Autolesion',
  'Duelo',
  'Autoestima',
];

type MoodKey = 'muy_mal' | 'mal' | 'neutral' | 'bien' | 'muy_bien';

const MOODS: { key: MoodKey; label: string; face: string }[] = [
  { key: 'muy_mal', label: 'Muy mal', face: 'M8 15s0 0 0 0m0 0a5 5 0 0 1 8 0m0 0s0 0 0 0' },
  { key: 'mal', label: 'Mal', face: 'M8 15s1.5-1 4-1 2.5 0 4 1' },
  { key: 'neutral', label: 'Neutral', face: 'M8 15h8' },
  { key: 'bien', label: 'Bien', face: 'M8 14s1.5 2 4 2 2.5 0 4-2' },
  { key: 'muy_bien', label: 'Muy bien', face: 'M8 13s1.5 3 4 3 2.5 0 4-3' },
];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Hola, ${name}!`;
  if (hour < 18) return `Hola, ${name}!`;
  return `Hola, ${name}!`;
}

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [savingMood, setSavingMood] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const fetchData = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, motivation')
          .eq('id', user.id)
          .single();
        setProfile(data);

        // Verificar si ya registro estado de animo hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: diaryData } = await supabase
          .from('emotional_diary')
          .select('mood')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .limit(1);

        if (diaryData && diaryData.length > 0) {
          setSelectedMood(diaryData[0].mood as MoodKey);
          setMoodSaved(true);
        }

        setLoadingProfile(false);
      };
      fetchData();
    }
  }, [user, loading, navigate]);

  const handleMoodSelect = async (mood: MoodKey) => {
    if (!user || moodSaved || savingMood) return;
    setSelectedMood(mood);
    setSavingMood(true);

    await supabase.from('emotional_diary').insert({
      user_id: user.id,
      mood,
    });

    setMoodSaved(true);
    setSavingMood(false);
  };

  if (loading || loadingProfile) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-loading-spinner" />
        <p>Cargando tu espacio...</p>
      </div>
    );
  }

  const displayName = profile?.full_name
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Viajero';
  const firstName = displayName.split(' ')[0];

  return (
    <DashboardLayout pageTitle="Inicio">
      <div className="dash-home">
        {/* Saludo */}
        <div className="dash-home-top">
          <div className="dash-home-greeting">
            <h2 className="dash-home-hello">{getGreeting(firstName)}</h2>
            <p className="dash-home-sub">Nos alegra que estes aqui.</p>
          </div>

          {/* Tags de especialidades */}
          <div className="dash-home-specialties">
            <h3>Buscar especialistas en</h3>
            <div className="dash-home-tags">
              {SPECIALTIES.map((s) => (
                <button key={s} className="dash-home-tag" type="button">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Banner promocional */}
        <div className="dash-home-banner">
          <div className="dash-home-banner-text">
            <h3>Tu bienestar empieza hoy</h3>
            <p>
              Agenda tu primera sesion con un especialista y da el primer paso
              hacia una vida mas plena.
            </p>
            <button className="dash-home-banner-btn" type="button">
              {'Agendar sesion ->'}
            </button>
          </div>
          <div className="dash-home-banner-accent" />
        </div>

        {/* Accesos rapidos */}
        <h3 className="dash-home-section-title">Accesos rapidos</h3>
        <div className="dash-home-shortcuts">
          <button className="dash-home-shortcut" type="button" onClick={() => navigate('/dashboard')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Agendar sesion</span>
          </button>
          <button className="dash-home-shortcut" type="button" onClick={() => navigate('/mis-citas')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Mis citas</span>
          </button>
          <button className="dash-home-shortcut" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Mis chequeos</span>
          </button>
          <button className="dash-home-shortcut" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Mi diario emocional</span>
          </button>
        </div>

        {/* Diario emocional */}
        <div className="dash-home-diary">
          <p className="dash-home-diary-label">Mi diario emocional</p>
          <h3 className="dash-home-diary-title">Como te sentiste hoy?</h3>
          <div className="dash-home-moods">
            {MOODS.map((m) => (
              <button
                key={m.key}
                className={`dash-home-mood ${selectedMood === m.key ? 'dash-home-mood--selected' : ''} ${moodSaved && selectedMood !== m.key ? 'dash-home-mood--faded' : ''}`}
                type="button"
                onClick={() => handleMoodSelect(m.key)}
                disabled={moodSaved}
                aria-label={m.label}
                title={m.label}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="9" cy="9" r="0.5" fill="currentColor" />
                  <circle cx="15" cy="9" r="0.5" fill="currentColor" />
                  <path d={m.face} />
                </svg>
              </button>
            ))}
          </div>
          {moodSaved && (
            <p className="dash-home-diary-saved">Registrado. Gracias por compartir.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
