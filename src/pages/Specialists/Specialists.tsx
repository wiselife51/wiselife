import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import './Specialists.css';

interface Psychologist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specialties: string[];
  bio: string | null;
  session_price: number;
  session_duration: number;
  modality: string[];
  city: string | null;
  years_experience: number;
  languages: string[];
}

const ALL_SPECIALTIES = [
  'Relaciones interpersonales',
  'Ansiedad',
  'Depresion',
  'Sexualidad',
  'Traumas',
  'Cambios de Vida',
  'Autolesion',
  'Duelo',
  'Autoestima',
  'Terapia de pareja',
  'Trastornos alimenticios',
  'TDAH',
  'Estres laboral',
];

const Specialists: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(() => {
    const sp = searchParams.get('especialidad');
    return sp ? [sp] : [];
  });
  const [selectedModality, setSelectedModality] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchPsychologists = async () => {
      setLoadingData(true);

      let query = supabase
        .from('psychologists')
        .select('id, full_name, avatar_url, specialties, bio, session_price, session_duration, modality, city, years_experience, languages')
        .eq('is_active', true)
        .eq('onboarding_completed', true);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching psychologists:', error);
        setLoadingData(false);
        return;
      }

      let filtered = data || [];

      // Filtrar por especialidades seleccionadas
      if (selectedSpecialties.length > 0) {
        filtered = filtered.filter((p) =>
          selectedSpecialties.some((s) =>
            p.specialties?.some((ps: string) => ps.toLowerCase().includes(s.toLowerCase()))
          )
        );
      }

      // Filtrar por modalidad
      if (selectedModality) {
        filtered = filtered.filter((p) =>
          p.modality?.some((m: string) => m.toLowerCase() === selectedModality.toLowerCase())
        );
      }

      // Filtrar por nombre
      if (searchName.trim()) {
        filtered = filtered.filter((p) =>
          p.full_name.toLowerCase().includes(searchName.trim().toLowerCase())
        );
      }

      setPsychologists(filtered);
      setLoadingData(false);
    };

    if (user) {
      fetchPsychologists();
    }
  }, [user, selectedSpecialties, selectedModality, searchName]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedModality('');
    setSearchName('');
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="dash-loading-screen">
        <div className="dash-loading-spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <DashboardLayout pageTitle="Especialistas">
      <div className="spec-page">
        {/* Barra de busqueda */}
        <div className="spec-search-bar">
          <div className="spec-search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="spec-search-input"
            />
          </div>
          <div className="spec-modality-filter">
            <button
              className={`spec-modality-btn ${selectedModality === '' ? 'spec-modality-btn--active' : ''}`}
              onClick={() => setSelectedModality('')}
              type="button"
            >
              Todos
            </button>
            <button
              className={`spec-modality-btn ${selectedModality === 'Virtual' ? 'spec-modality-btn--active' : ''}`}
              onClick={() => setSelectedModality('Virtual')}
              type="button"
            >
              Virtual
            </button>
            <button
              className={`spec-modality-btn ${selectedModality === 'Presencial' ? 'spec-modality-btn--active' : ''}`}
              onClick={() => setSelectedModality('Presencial')}
              type="button"
            >
              Presencial
            </button>
          </div>
        </div>

        {/* Filtros de especialidad */}
        <div className="spec-filters">
          <div className="spec-filters-header">
            <h3>Filtrar por especialidad</h3>
            {selectedSpecialties.length > 0 && (
              <button className="spec-clear-btn" onClick={clearFilters} type="button">
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="spec-tags">
            {ALL_SPECIALTIES.map((s) => (
              <button
                key={s}
                className={`spec-tag ${selectedSpecialties.includes(s) ? 'spec-tag--active' : ''}`}
                onClick={() => toggleSpecialty(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div className="spec-results-header">
          <h3>{loadingData ? 'Buscando...' : `${psychologists.length} especialista${psychologists.length !== 1 ? 's' : ''} encontrado${psychologists.length !== 1 ? 's' : ''}`}</h3>
        </div>

        {loadingData ? (
          <div className="spec-loading">
            <div className="dash-loading-spinner" />
          </div>
        ) : psychologists.length === 0 ? (
          <div className="spec-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p>No se encontraron especialistas con esos filtros.</p>
            <button className="spec-clear-btn" onClick={clearFilters} type="button">
              Ver todos los especialistas
            </button>
          </div>
        ) : (
          <div className="spec-grid">
            {psychologists.map((psy) => (
              <button
                key={psy.id}
                className="spec-card"
                onClick={() => navigate(`/especialista/${psy.id}`)}
                type="button"
              >
                <div className="spec-card-top">
                  <div className="spec-card-avatar">
                    {psy.avatar_url ? (
                      <img src={psy.avatar_url} alt={psy.full_name} crossOrigin="anonymous" />
                    ) : (
                      <span>{psy.full_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="spec-card-info">
                    <h4>{psy.full_name}</h4>
                    <p className="spec-card-exp">{psy.years_experience} anios de experiencia</p>
                    {psy.city && <p className="spec-card-city">{psy.city}</p>}
                  </div>
                </div>

                {psy.bio && (
                  <p className="spec-card-bio">
                    {psy.bio.length > 120 ? `${psy.bio.substring(0, 120)}...` : psy.bio}
                  </p>
                )}

                <div className="spec-card-specialties">
                  {(psy.specialties || []).slice(0, 3).map((s) => (
                    <span key={s} className="spec-card-specialty">{s}</span>
                  ))}
                  {(psy.specialties || []).length > 3 && (
                    <span className="spec-card-specialty spec-card-specialty--more">
                      +{psy.specialties.length - 3}
                    </span>
                  )}
                </div>

                <div className="spec-card-footer">
                  <div className="spec-card-modality">
                    {(psy.modality || []).map((m) => (
                      <span key={m} className="spec-card-mod-badge">{m}</span>
                    ))}
                  </div>
                  <div className="spec-card-price">
                    <span className="spec-card-price-amount">${psy.session_price?.toLocaleString()}</span>
                    <span className="spec-card-price-duration">/ {psy.session_duration} min</span>
                  </div>
                </div>

                <div className="spec-card-cta">
                  <span>Ver agenda</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Specialists;
