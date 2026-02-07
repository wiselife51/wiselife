import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './PsychologistOnboarding.css';

const SPECIALTIES_OPTIONS = [
  'Ansiedad', 'Depresion', 'Traumas', 'Relaciones interpersonales',
  'Sexualidad', 'Duelo', 'Autoestima', 'Trastornos alimenticios',
  'Adicciones', 'Terapia de pareja', 'Terapia familiar', 'Estres laboral',
  'TDAH', 'Autismo', 'Trastornos de personalidad', 'Fobias',
];

const MODALITY_OPTIONS = ['Virtual', 'Presencial', 'Hibrido'];
const LANGUAGE_OPTIONS = ['Espanol', 'Ingles', 'Portugues', 'Frances'];

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miercoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sabado' },
  { value: 0, label: 'Domingo' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return `${h.toString().padStart(2, '0')}:00`;
});

interface FormData {
  fullName: string;
  phone: string;
  licenseNumber: string;
  education: string;
  yearsExperience: string;
  bio: string;
  specialties: string[];
  sessionPrice: string;
  sessionDuration: string;
  modality: string[];
  languages: string[];
  city: string;
}

interface AvailabilitySlot {
  day: number;
  startTime: string;
  endTime: string;
}

const PsychologistOnboarding: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    licenseNumber: '',
    education: '',
    yearsExperience: '',
    bio: '',
    specialties: [],
    sessionPrice: '',
    sessionDuration: '60',
    modality: ['Virtual'],
    languages: ['Espanol'],
    city: '',
  });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/psicologo/login');
      return;
    }
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      }));
      // Check if already completed onboarding
      supabase
        .from('psychologists')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.onboarding_completed) {
            navigate('/psicologo/dashboard');
          }
        });
    }
  }, [user, loading, navigate]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'specialties' | 'modality' | 'languages', value: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const addAvailabilitySlot = () => {
    setAvailability((prev) => [...prev, { day: 1, startTime: '08:00', endTime: '09:00' }]);
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string | number) => {
    setAvailability((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeSlot = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) return 'El nombre es requerido';
    if (!formData.phone.trim()) return 'El telefono es requerido';
    if (!formData.licenseNumber.trim()) return 'El numero de licencia es requerido';
    return '';
  };

  const validateStep2 = () => {
    if (!formData.education.trim()) return 'La formacion academica es requerida';
    if (formData.specialties.length === 0) return 'Selecciona al menos una especialidad';
    if (!formData.sessionPrice.trim()) return 'El precio por sesion es requerido';
    return '';
  };

  const handleNext = () => {
    let err = '';
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      // Upsert psychologist profile
      const { error: psyError } = await supabase
        .from('psychologists')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          email: user.email || '',
          phone: formData.phone,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          license_number: formData.licenseNumber,
          specialties: formData.specialties,
          bio: formData.bio,
          education: formData.education,
          years_experience: parseInt(formData.yearsExperience) || 0,
          session_price: parseFloat(formData.sessionPrice) || 0,
          session_duration: parseInt(formData.sessionDuration) || 60,
          languages: formData.languages,
          modality: formData.modality,
          city: formData.city,
          onboarding_completed: true,
        }, { onConflict: 'user_id' });

      if (psyError) throw psyError;

      // Get psychologist id
      const { data: psyData } = await supabase
        .from('psychologists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (psyData && availability.length > 0) {
        // Insert availability slots
        const slots = availability.map((s) => ({
          psychologist_id: psyData.id,
          day_of_week: s.day,
          start_time: s.startTime,
          end_time: s.endTime,
          is_available: true,
        }));

        await supabase
          .from('psychologist_availability')
          .insert(slots);
      }

      navigate('/psicologo/dashboard');
    } catch {
      setError('Ocurrio un error al guardar. Intenta de nuevo.');
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="psy-onb-container">
      <video autoPlay loop muted playsInline className="psy-onb-video">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="psy-onb-overlay" />

      <div className="psy-onb-content">
        {/* Progress */}
        <div className="psy-onb-progress">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`psy-onb-step ${step >= s ? 'psy-onb-step--active' : ''}`}>
              <div className="psy-onb-step-dot">{s}</div>
              <span className="psy-onb-step-label">
                {s === 1 ? 'Datos personales' : s === 2 ? 'Profesional' : 'Disponibilidad'}
              </span>
            </div>
          ))}
        </div>

        <div className="psy-onb-card">
          {/* Step 1: Datos personales */}
          {step === 1 && (
            <>
              <h2 className="psy-onb-title">Datos personales</h2>
              <p className="psy-onb-desc">Cuentanos sobre ti para crear tu perfil profesional.</p>

              <div className="psy-onb-fields">
                <div className="psy-onb-field">
                  <label htmlFor="fullName">Nombre completo *</label>
                  <input id="fullName" type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Dr. Juan Perez" />
                </div>
                <div className="psy-onb-field">
                  <label htmlFor="phone">Telefono *</label>
                  <input id="phone" type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+57 300 123 4567" />
                </div>
                <div className="psy-onb-field">
                  <label htmlFor="licenseNumber">Numero de licencia profesional *</label>
                  <input id="licenseNumber" type="text" value={formData.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} placeholder="TP-123456" />
                </div>
                <div className="psy-onb-field">
                  <label htmlFor="city">Ciudad</label>
                  <input id="city" type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Bogota" />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Informacion profesional */}
          {step === 2 && (
            <>
              <h2 className="psy-onb-title">Informacion profesional</h2>
              <p className="psy-onb-desc">Detalla tu experiencia y especialidades.</p>

              <div className="psy-onb-fields">
                <div className="psy-onb-field">
                  <label htmlFor="education">Formacion academica *</label>
                  <input id="education" type="text" value={formData.education} onChange={(e) => updateField('education', e.target.value)} placeholder="Psicologo clinico - Universidad Nacional" />
                </div>
                <div className="psy-onb-field">
                  <label htmlFor="yearsExperience">Anos de experiencia</label>
                  <input id="yearsExperience" type="number" min="0" value={formData.yearsExperience} onChange={(e) => updateField('yearsExperience', e.target.value)} placeholder="5" />
                </div>
                <div className="psy-onb-field">
                  <label htmlFor="bio">Biografia / Descripcion</label>
                  <textarea id="bio" value={formData.bio} onChange={(e) => updateField('bio', e.target.value)} placeholder="Cuentale a tus pacientes sobre tu enfoque terapeutico..." rows={3} />
                </div>

                <div className="psy-onb-field">
                  <label>Especialidades * <span className="psy-onb-hint">(selecciona una o mas)</span></label>
                  <div className="psy-onb-tags">
                    {SPECIALTIES_OPTIONS.map((s) => (
                      <button key={s} type="button" className={`psy-onb-tag ${formData.specialties.includes(s) ? 'psy-onb-tag--active' : ''}`} onClick={() => toggleArrayField('specialties', s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="psy-onb-row">
                  <div className="psy-onb-field">
                    <label htmlFor="sessionPrice">Precio por sesion (COP) *</label>
                    <input id="sessionPrice" type="number" min="0" value={formData.sessionPrice} onChange={(e) => updateField('sessionPrice', e.target.value)} placeholder="120000" />
                  </div>
                  <div className="psy-onb-field">
                    <label htmlFor="sessionDuration">Duracion (min)</label>
                    <select id="sessionDuration" value={formData.sessionDuration} onChange={(e) => updateField('sessionDuration', e.target.value)}>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                    </select>
                  </div>
                </div>

                <div className="psy-onb-field">
                  <label>Modalidad</label>
                  <div className="psy-onb-tags">
                    {MODALITY_OPTIONS.map((m) => (
                      <button key={m} type="button" className={`psy-onb-tag ${formData.modality.includes(m) ? 'psy-onb-tag--active' : ''}`} onClick={() => toggleArrayField('modality', m)}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="psy-onb-field">
                  <label>Idiomas</label>
                  <div className="psy-onb-tags">
                    {LANGUAGE_OPTIONS.map((l) => (
                      <button key={l} type="button" className={`psy-onb-tag ${formData.languages.includes(l) ? 'psy-onb-tag--active' : ''}`} onClick={() => toggleArrayField('languages', l)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Disponibilidad */}
          {step === 3 && (
            <>
              <h2 className="psy-onb-title">Disponibilidad</h2>
              <p className="psy-onb-desc">Configura tu horario semanal. Puedes modificarlo despues.</p>

              <div className="psy-onb-availability">
                {availability.map((slot, index) => (
                  <div key={index} className="psy-onb-slot">
                    <select value={slot.day} onChange={(e) => updateSlot(index, 'day', parseInt(e.target.value))}>
                      {DAYS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <select value={slot.startTime} onChange={(e) => updateSlot(index, 'startTime', e.target.value)}>
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="psy-onb-slot-sep">a</span>
                    <select value={slot.endTime} onChange={(e) => updateSlot(index, 'endTime', e.target.value)}>
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <button type="button" className="psy-onb-slot-remove" onClick={() => removeSlot(index)} aria-label="Eliminar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}

                <button type="button" className="psy-onb-add-slot" onClick={addAvailabilitySlot}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  <span>Agregar horario</span>
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {error && <p className="psy-onb-error">{error}</p>}

          {/* Actions */}
          <div className="psy-onb-actions">
            {step > 1 && (
              <button type="button" className="psy-onb-btn psy-onb-btn--back" onClick={handleBack}>
                Atras
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="psy-onb-btn psy-onb-btn--next" onClick={handleNext}>
                Continuar
              </button>
            ) : (
              <button type="button" className="psy-onb-btn psy-onb-btn--next" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Guardando...' : 'Finalizar registro'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologistOnboarding;
