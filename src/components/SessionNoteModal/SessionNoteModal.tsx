import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  SessionNoteModalProps,
  SessionNoteFormData,
  CIE10Code,
  SessionType,
  SessionModality,
  TreatmentProgress,
  SuicideRiskLevel,
} from '../../types/clinicalHistory';
import {
  initialSessionNoteForm,
  sessionNoteFormToDatabase,
  validateSOAPField,
  validatePrimaryDiagnosis,
  validateHighRiskAlert,
} from '../../types/clinicalHistory';
import './SessionNoteModal.css';

const SessionNoteModal: React.FC<SessionNoteModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  clinicalRecordId,
  sessionNumber,
  patientId,
  patientName,
  patientEmail,
  patientAvatarUrl,
  psychologistId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'diagnosis' | 'plan'>('evolution');
  const [formData, setFormData] = useState<SessionNoteFormData>({
    ...initialSessionNoteForm,
    sessionInfo: {
      ...initialSessionNoteForm.sessionInfo,
      sessionNumber,
    },
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // CIE-10 search state
  const [cie10Query, setCie10Query] = useState('');
  const [cie10Results, setCie10Results] = useState<CIE10Code[]>([]);
  const [showCie10Dropdown, setShowCie10Dropdown] = useState(false);
  const [loadingCie10, setLoadingCie10] = useState(false);

  // ============================================
  // BÚSQUEDA CIE-10 CON AUTOCOMPLETADO
  // ============================================

  const searchCIE10 = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setCie10Results([]);
      return;
    }

    setLoadingCie10(true);

    try {
      // Buscar por código o descripción
      const { data, error } = await supabase
        .from('cie10_codes')
        .select('*')
        .or(
          `code.ilike.%${query}%,description.ilike.%${query}%,keywords.cs.{${query.toLowerCase()}}`
        )
        .order('commonly_used', { ascending: false })
        .order('code')
        .limit(10);

      if (error) throw error;

      setCie10Results(data || []);
      setShowCie10Dropdown(true);
    } catch (err) {
      console.error('Error searching CIE-10:', err);
      setCie10Results([]);
    } finally {
      setLoadingCie10(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cie10Query) {
        searchCIE10(cie10Query);
      } else {
        setCie10Results([]);
        setShowCie10Dropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cie10Query, searchCIE10]);

  // Debe ir despues de todos los hooks: un early return antes de ellos
  // cambia el orden de hooks entre renders y corrompe el estado de React.
  if (!isOpen) return null;

  const handleSelectPrimaryDiagnosis = (code: CIE10Code) => {
    setFormData((prev) => ({
      ...prev,
      diagnosis: {
        ...prev.diagnosis,
        primary: {
          code: code.code,
          description: code.description,
        },
      },
    }));
    setCie10Query('');
    setShowCie10Dropdown(false);
  };

  const handleAddSecondaryDiagnosis = (code: CIE10Code) => {
    // Evitar duplicados
    const exists = formData.diagnosis.secondary.some((d) => d.code === code.code);
    if (exists) return;

    setFormData((prev) => ({
      ...prev,
      diagnosis: {
        ...prev.diagnosis,
        secondary: [
          ...prev.diagnosis.secondary,
          { code: code.code, description: code.description },
        ],
      },
    }));
    setCie10Query('');
    setShowCie10Dropdown(false);
  };

  const handleRemoveSecondaryDiagnosis = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      diagnosis: {
        ...prev.diagnosis,
        secondary: prev.diagnosis.secondary.filter((d) => d.code !== code),
      },
    }));
  };

  // ============================================
  // VALIDACIONES
  // ============================================

  const validateForm = (isDraft: boolean): boolean => {
    const newErrors: Record<string, string> = {};

    // Si es borrador, no validar campos obligatorios
    if (isDraft) {
      setErrors({});
      return true;
    }

    // Validar SOAP (Resolución 1995)
    if (!validateSOAPField(formData.soap.subjective)) {
      newErrors.subjective = 'El campo Subjetivo debe tener mínimo 20 caracteres (Resolución 1995/1999)';
    }

    if (!validateSOAPField(formData.soap.objective)) {
      newErrors.objective = 'El campo Objetivo debe tener mínimo 20 caracteres (Resolución 1995/1999)';
    }

    if (!validateSOAPField(formData.soap.intervention)) {
      newErrors.intervention = 'El campo Intervención debe tener mínimo 20 caracteres (Resolución 1995/1999)';
    }

    // Validar diagnóstico principal obligatorio
    if (!validatePrimaryDiagnosis(formData.diagnosis.primary.code, formData.diagnosis.primary.description)) {
      newErrors.primaryDiagnosis = 'El diagnóstico principal CIE-10 es obligatorio';
    }

    // Validar riesgo alto requiere notas
    if (!validateHighRiskAlert(formData.risk.suicideRisk, formData.risk.alertNotes)) {
      newErrors.alertNotes = 'Si el riesgo suicida es Alto, debe incluir notas de alerta detalladas (mín. 10 caracteres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // GUARDAR EN SUPABASE
  // ============================================

  const handleSave = async (isDraft: boolean) => {
    if (!validateForm(isDraft)) {
      // Si hay errores, ir al primer tab con error
      if (errors.subjective || errors.objective || errors.intervention) {
        setActiveTab('evolution');
      } else if (errors.primaryDiagnosis || errors.alertNotes) {
        setActiveTab('diagnosis');
      }
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const dbData = {
        ...sessionNoteFormToDatabase(formData, clinicalRecordId, appointmentId, psychologistId, patientId),
        is_draft: isDraft,
      };

      const { error } = await supabase.from('session_notes').insert(dbData);

      if (error) {
        if (error.code === '23505') {
          setErrors({ submit: 'Ya existe una nota para esta cita' });
        } else {
          setErrors({ submit: `Error al guardar: ${error.message}` });
        }
        setSaving(false);
        return;
      }

      // Si no es borrador, marcar cita como completada
      if (!isDraft) {
        await supabase
          .from('appointments')
          .update({
            status: 'completada',
            updated_at: new Date().toISOString(),
          })
          .eq('id', appointmentId);
      }

      // Éxito
      onSuccess();
      onClose();
    } catch (err) {
      setErrors({ submit: 'Error inesperado al guardar la nota de sesión' });
      setSaving(false);
    }
  };

  // ============================================
  // ACTUALIZAR CAMPOS
  // ============================================

  const updateField = (section: keyof SessionNoteFormData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const updateTechniques = (technique: string) => {
    const techniques = formData.plan.techniquesUsed;
    const index = techniques.indexOf(technique);

    if (index > -1) {
      // Remover
      setFormData((prev) => ({
        ...prev,
        plan: {
          ...prev.plan,
          techniquesUsed: techniques.filter((t) => t !== technique),
        },
      }));
    } else {
      // Agregar
      setFormData((prev) => ({
        ...prev,
        plan: {
          ...prev.plan,
          techniquesUsed: [...techniques, technique],
        },
      }));
    }
  };

  // ============================================
  // RENDERIZADO DE TABS
  // ============================================

  const renderTabEvolution = () => (
    <div className="sn-tab-content">
      <h3 className="sn-section-title">Información de la Sesión</h3>

      <div className="sn-fields">
        <div className="sn-row">
          <div className="sn-field">
            <label>Número de sesión</label>
            <input type="number" value={formData.sessionInfo.sessionNumber} disabled />
          </div>

          <div className="sn-field">
            <label>Fecha</label>
            <input
              type="date"
              value={formData.sessionInfo.date}
              onChange={(e) => updateField('sessionInfo', 'date', e.target.value)}
            />
          </div>

          <div className="sn-field">
            <label>Duración (min)</label>
            <input
              type="number"
              value={formData.sessionInfo.duration}
              onChange={(e) => updateField('sessionInfo', 'duration', parseInt(e.target.value) || 50)}
              min="15"
              max="180"
            />
          </div>
        </div>

        <div className="sn-row">
          <div className="sn-field">
            <label>Tipo de sesión</label>
            <select
              value={formData.sessionInfo.type}
              onChange={(e) => updateField('sessionInfo', 'type', e.target.value as SessionType)}
            >
              <option value="individual">Individual</option>
              <option value="grupal">Grupal</option>
              <option value="familiar">Familiar</option>
              <option value="pareja">Pareja</option>
            </select>
          </div>

          <div className="sn-field">
            <label>Modalidad</label>
            <select
              value={formData.sessionInfo.modality}
              onChange={(e) => updateField('sessionInfo', 'modality', e.target.value as SessionModality)}
            >
              <option value="Virtual">Virtual</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>
        </div>
      </div>

      <h3 className="sn-section-title">Evolución Clínica (SOAP)</h3>
      <p className="sn-section-desc">Registro sistemático según Resolución 1995/1999</p>

      <div className="sn-fields">
        <div className="sn-field">
          <label>
            Subjetivo - Relato del paciente <span className="sn-required">*</span>
          </label>
          <textarea
            value={formData.soap.subjective}
            onChange={(e) => updateField('soap', 'subjective', e.target.value)}
            placeholder="¿Qué dice el paciente? Síntomas, preocupaciones, experiencias desde la última sesión... (Mínimo 20 caracteres)"
            rows={4}
          />
          {errors.subjective && <span className="sn-error">{errors.subjective}</span>}
          <small className="sn-hint">
            {formData.soap.subjective.length}/20 caracteres mínimos
          </small>
        </div>

        <div className="sn-field">
          <label>
            Objetivo - Observaciones del profesional <span className="sn-required">*</span>
          </label>
          <textarea
            value={formData.soap.objective}
            onChange={(e) => updateField('soap', 'objective', e.target.value)}
            placeholder="¿Qué observa el psicólogo? Estado de ánimo, lenguaje corporal, higiene, contacto visual... (Mínimo 20 caracteres)"
            rows={4}
          />
          {errors.objective && <span className="sn-error">{errors.objective}</span>}
          <small className="sn-hint">
            {formData.soap.objective.length}/20 caracteres mínimos
          </small>
        </div>

        <div className="sn-field">
          <label>
            Intervención - Técnicas y estrategias utilizadas <span className="sn-required">*</span>
          </label>
          <textarea
            value={formData.soap.intervention}
            onChange={(e) => updateField('soap', 'intervention', e.target.value)}
            placeholder="¿Qué se hizo en sesión? Técnicas aplicadas, temas tratados, ejercicios realizados... (Mínimo 20 caracteres)"
            rows={4}
          />
          {errors.intervention && <span className="sn-error">{errors.intervention}</span>}
          <small className="sn-hint">
            {formData.soap.intervention.length}/20 caracteres mínimos
          </small>
        </div>

        <div className="sn-field">
          <label>Respuesta del paciente</label>
          <textarea
            value={formData.soap.patientResponse}
            onChange={(e) => updateField('soap', 'patientResponse', e.target.value)}
            placeholder="¿Cómo respondió el paciente a las intervenciones? Reacciones, insights, resistencias..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderTabDiagnosis = () => (
    <div className="sn-tab-content">
      <h3 className="sn-section-title">Diagnóstico CIE-10</h3>
      <p className="sn-section-desc">Código internacional obligatorio</p>

      <div className="sn-fields">
        <div className="sn-field">
          <label>
            Diagnóstico principal <span className="sn-required">*</span>
          </label>

          {formData.diagnosis.primary.code ? (
            <div className="sn-diagnosis-selected">
              <div className="sn-diagnosis-badge">
                <strong>{formData.diagnosis.primary.code}</strong>
                <span>{formData.diagnosis.primary.description}</span>
              </div>
              <button
                type="button"
                className="sn-diagnosis-remove"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    diagnosis: {
                      ...prev.diagnosis,
                      primary: { code: '', description: '' },
                    },
                  }))
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="sn-cie10-search">
              <input
                type="text"
                value={cie10Query}
                onChange={(e) => setCie10Query(e.target.value)}
                onFocus={() => cie10Results.length > 0 && setShowCie10Dropdown(true)}
                placeholder="Buscar por código o descripción (ej: F41.1, ansiedad, depresión...)"
              />

              {loadingCie10 && (
                <div className="sn-cie10-loading">Buscando...</div>
              )}

              {showCie10Dropdown && cie10Results.length > 0 && (
                <div className="sn-cie10-dropdown">
                  {cie10Results.map((code) => (
                    <button
                      key={code.code}
                      type="button"
                      className="sn-cie10-option"
                      onClick={() => handleSelectPrimaryDiagnosis(code)}
                    >
                      <div className="sn-cie10-option-code">
                        <strong>{code.code}</strong>
                        {code.commonly_used && (
                          <span className="sn-cie10-badge">Común</span>
                        )}
                      </div>
                      <div className="sn-cie10-option-desc">{code.description}</div>
                      {code.category && (
                        <div className="sn-cie10-option-cat">{code.category}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {errors.primaryDiagnosis && <span className="sn-error">{errors.primaryDiagnosis}</span>}
        </div>

        <div className="sn-field">
          <label>Diagnósticos secundarios (opcional)</label>

          {formData.diagnosis.secondary.length > 0 && (
            <div className="sn-secondary-list">
              {formData.diagnosis.secondary.map((diag) => (
                <div key={diag.code} className="sn-diagnosis-badge sn-diagnosis-badge--secondary">
                  <strong>{diag.code}</strong>
                  <span>{diag.description}</span>
                  <button
                    type="button"
                    className="sn-diagnosis-remove-sm"
                    onClick={() => handleRemoveSecondaryDiagnosis(diag.code)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="sn-cie10-search">
            <input
              type="text"
              value={cie10Query}
              onChange={(e) => setCie10Query(e.target.value)}
              placeholder="Agregar diagnóstico secundario..."
            />

            {showCie10Dropdown && cie10Results.length > 0 && (
              <div className="sn-cie10-dropdown">
                {cie10Results.map((code) => (
                  <button
                    key={code.code}
                    type="button"
                    className="sn-cie10-option"
                    onClick={() => handleAddSecondaryDiagnosis(code)}
                  >
                    <div className="sn-cie10-option-code">
                      <strong>{code.code}</strong>
                    </div>
                    <div className="sn-cie10-option-desc">{code.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sn-field">
          <label>Impresión diagnóstica</label>
          <textarea
            value={formData.diagnosis.impression}
            onChange={(e) => updateField('diagnosis', 'impression', e.target.value)}
            placeholder="Justificación del diagnóstico, diagnóstico diferencial, evolución..."
            rows={3}
          />
        </div>
      </div>

      <h3 className="sn-section-title">Evaluación de Riesgo</h3>

      <div className="sn-fields">
        <div className="sn-row">
          <div className="sn-field">
            <label>Nivel de riesgo suicida</label>
            <select
              value={formData.risk.suicideRisk}
              onChange={(e) => updateField('risk', 'suicideRisk', e.target.value as SuicideRiskLevel)}
            >
              <option value="Ninguno">Ninguno</option>
              <option value="Bajo">Bajo</option>
              <option value="Medio">Medio</option>
              <option value="Alto">Alto</option>
            </select>
          </div>

          <div className="sn-field">
            <label>
              <input
                type="checkbox"
                checked={formData.risk.requiresAttention}
                onChange={(e) => updateField('risk', 'requiresAttention', e.target.checked)}
              />
              Requiere atención inmediata
            </label>
          </div>
        </div>

        {(formData.risk.suicideRisk === 'Alto' || formData.risk.requiresAttention) && (
          <div className="sn-field">
            <label>
              Notas de alerta <span className="sn-required">*</span>
            </label>
            <textarea
              value={formData.risk.alertNotes}
              onChange={(e) => updateField('risk', 'alertNotes', e.target.value)}
              placeholder="Descripción detallada del riesgo, plan de intervención inmediata, contactos de emergencia..."
              rows={4}
            />
            {errors.alertNotes && <span className="sn-error">{errors.alertNotes}</span>}
          </div>
        )}
      </div>
    </div>
  );

  const renderTabPlan = () => {
    const commonTechniques = [
      'Reestructuración cognitiva',
      'Exposición gradual',
      'Relajación',
      'Mindfulness',
      'Psicoeducación',
      'Role-playing',
      'Resolución de problemas',
      'Activación conductual',
    ];

    return (
      <div className="sn-tab-content">
        <h3 className="sn-section-title">Evaluación del Progreso</h3>

        <div className="sn-fields">
          <div className="sn-field">
            <label>Progreso general</label>
            <select
              value={formData.progress.overall}
              onChange={(e) => updateField('progress', 'overall', e.target.value as TreatmentProgress)}
            >
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Sin cambios">Sin cambios</option>
              <option value="Deterioro">Deterioro</option>
            </select>
          </div>

          <div className="sn-field">
            <label>Avance en objetivos terapéuticos</label>
            <textarea
              value={formData.progress.goalsProgress}
              onChange={(e) => updateField('progress', 'goalsProgress', e.target.value)}
              placeholder="¿Qué objetivos se han logrado? ¿Cuáles están en proceso?"
              rows={3}
            />
          </div>

          <div className="sn-field">
            <label>Tareas asignadas</label>
            <textarea
              value={formData.progress.homeworkAssigned}
              onChange={(e) => updateField('progress', 'homeworkAssigned', e.target.value)}
              placeholder="Tareas o ejercicios para realizar antes de la próxima sesión..."
              rows={2}
            />
          </div>

          <div className="sn-field">
            <label>Cumplimiento de tareas previas</label>
            <textarea
              value={formData.progress.homeworkCompletion}
              onChange={(e) => updateField('progress', 'homeworkCompletion', e.target.value)}
              placeholder="¿Completó las tareas de la sesión anterior? Observaciones..."
              rows={2}
            />
          </div>
        </div>

        <h3 className="sn-section-title">Plan para Próximas Sesiones</h3>

        <div className="sn-fields">
          <div className="sn-field">
            <label>Modificaciones al plan de tratamiento</label>
            <textarea
              value={formData.plan.modifications}
              onChange={(e) => updateField('plan', 'modifications', e.target.value)}
              placeholder="¿Hay cambios en el enfoque o estrategia terapéutica?"
              rows={2}
            />
          </div>

          <div className="sn-field">
            <label>Objetivos para próxima sesión</label>
            <textarea
              value={formData.plan.nextSessionGoals}
              onChange={(e) => updateField('plan', 'nextSessionGoals', e.target.value)}
              placeholder="¿Qué se trabajará en la siguiente sesión?"
              rows={2}
            />
          </div>

          <div className="sn-field">
            <label>Técnicas terapéuticas utilizadas</label>
            <div className="sn-techniques-grid">
              {commonTechniques.map((technique) => (
                <button
                  key={technique}
                  type="button"
                  className={`sn-technique-chip ${
                    formData.plan.techniquesUsed.includes(technique) ? 'sn-technique-chip--active' : ''
                  }`}
                  onClick={() => updateTechniques(technique)}
                >
                  {technique}
                </button>
              ))}
            </div>
          </div>
        </div>

        <h3 className="sn-section-title">Seguimiento</h3>

        <div className="sn-fields">
          <div className="sn-field">
            <label>Fecha recomendada para próxima cita</label>
            <input
              type="date"
              value={formData.followUp.nextAppointmentRecommendation}
              onChange={(e) => updateField('followUp', 'nextAppointmentRecommendation', e.target.value)}
            />
          </div>

          <div className="sn-field">
            <label>
              <input
                type="checkbox"
                checked={formData.followUp.referralMade}
                onChange={(e) => updateField('followUp', 'referralMade', e.target.checked)}
              />
              Se realizó remisión a otro profesional
            </label>
          </div>

          {formData.followUp.referralMade && (
            <div className="sn-field">
              <label>Detalles de la remisión</label>
              <textarea
                value={formData.followUp.referralDetails}
                onChange={(e) => updateField('followUp', 'referralDetails', e.target.value)}
                placeholder="¿A qué profesional? ¿Por qué motivo?"
                rows={2}
              />
            </div>
          )}

          <div className="sn-field">
            <label>
              <input
                type="checkbox"
                checked={formData.medication?.prescribed}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    medication: {
                      prescribed: e.target.checked,
                      details: prev.medication?.details || '',
                    },
                  }))
                }
              />
              Se prescribió medicación (si aplica)
            </label>
          </div>

          {formData.medication?.prescribed && (
            <div className="sn-field">
              <label>Detalles de la prescripción</label>
              <textarea
                value={formData.medication.details}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    medication: {
                      ...prev.medication!,
                      details: e.target.value,
                    },
                  }))
                }
                placeholder="Medicamento, dosis, frecuencia..."
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="sn-modal-backdrop" onClick={onClose}>
      <div className="sn-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sn-modal-header">
          <div className="sn-modal-heading">
            <div className="sn-brand" aria-label="Vida Sabia">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
                <defs><linearGradient id="sn-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4dd0e1" /><stop offset="50%" stopColor="#42a5f5" /><stop offset="100%" stopColor="#7e57c2" /></linearGradient></defs>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#sn-logo-grad)" />
              </svg>
              <span>Vida Sabia</span>
            </div>
            <h2 className="sn-modal-title">Nota de Sesión #{sessionNumber}</h2>
            <p className="sn-modal-subtitle">Registro de evolución clínica - Resolución 1995/1999</p>
          </div>
          <div className="sn-patient-summary">
            <div className="sn-patient-avatar">
              {patientAvatarUrl ? <img src={patientAvatarUrl} alt={patientName || 'Paciente'} /> : (patientName || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="sn-patient-copy">
              <strong>{patientName || 'Paciente'}</strong>
              <span>{patientEmail || 'Información del paciente'}</span>
            </div>
          </div>
          <button className="sn-modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="sn-tabs">
          <button
            type="button"
            className={`sn-tab ${activeTab === 'evolution' ? 'sn-tab--active' : ''}`}
            onClick={() => setActiveTab('evolution')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Evolución
          </button>

          <button
            type="button"
            className={`sn-tab ${activeTab === 'diagnosis' ? 'sn-tab--active' : ''}`}
            onClick={() => setActiveTab('diagnosis')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Diagnóstico
          </button>

          <button
            type="button"
            className={`sn-tab ${activeTab === 'plan' ? 'sn-tab--active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Plan
          </button>
        </div>

        {/* Content */}
        <div className="sn-modal-body">
          {activeTab === 'evolution' && renderTabEvolution()}
          {activeTab === 'diagnosis' && renderTabDiagnosis()}
          {activeTab === 'plan' && renderTabPlan()}
        </div>

        {/* Footer */}
        {errors.submit && (
          <div className="sn-error-box-global">{errors.submit}</div>
        )}

        <div className="sn-modal-footer">
          <button
            type="button"
            className="sn-btn-ghost"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar borrador
          </button>

          <button
            type="button"
            className="sn-btn-primary"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {saving ? 'Guardando...' : 'Finalizar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionNoteModal;
