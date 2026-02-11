import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  ClinicalRecordModalProps,
  ClinicalRecordFormData,
  IdentificationType,
  EducationLevel,
  MaritalStatus,
} from '../../types/clinicalHistory';
import {
  initialClinicalRecordForm,
  clinicalRecordFormToDatabase,
  validateConsultationReason,
  validateConsents,
} from '../../types/clinicalHistory';
import './ClinicalRecordModal.css';

const ClinicalRecordModal: React.FC<ClinicalRecordModalProps> = ({
  isOpen,
  onClose,
  patientId,
  psychologistId,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClinicalRecordFormData>(initialClinicalRecordForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // ============================================
  // VALIDACIONES POR PASO
  // ============================================

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.demographicData.identificationNumber.trim()) {
      newErrors.identificationNumber = 'El número de identificación es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateConsultationReason(formData.consultation.reason)) {
      newErrors.consultationReason = 'El motivo de consulta debe tener mínimo 10 caracteres (Resolución 1995/1999)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateConsents(formData.consents.informedConsent, formData.consents.dataProcessing)) {
      newErrors.consents = 'Ambos consentimientos son obligatorios según la Ley 1581/2012';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // NAVEGACIÓN ENTRE PASOS
  // ============================================

  const handleNext = () => {
    let isValid = true;

    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 3) isValid = validateStep3();

    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  // ============================================
  // GUARDAR EN SUPABASE
  // ============================================

  const handleSubmit = async () => {
    if (!validateStep5()) return;

    setSaving(true);
    setErrors({});

    try {
      const dbData = clinicalRecordFormToDatabase(formData, patientId, psychologistId);

      const { data, error } = await supabase
        .from('clinical_records')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // UNIQUE constraint violation
          setErrors({ submit: 'Ya existe una historia clínica para este paciente' });
        } else {
          setErrors({ submit: `Error al guardar: ${error.message}` });
        }
        setSaving(false);
        return;
      }

      // Éxito
      onSuccess(data.id);
      onClose();
    } catch (err) {
      setErrors({ submit: 'Error inesperado al guardar la historia clínica' });
      setSaving(false);
    }
  };

  // ============================================
  // ACTUALIZAR CAMPOS
  // ============================================

  const updateField = (section: keyof ClinicalRecordFormData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const updateNestedField = (
    section: keyof ClinicalRecordFormData,
    subsection: string,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [subsection]: {
          ...((prev[section] as any)[subsection] || {}),
          [field]: value,
        },
      },
    }));
  };

  // ============================================
  // RENDERIZADO POR PASOS
  // ============================================

  const renderStep1 = () => (
    <div className="cr-modal-step">
      <h3 className="cr-modal-step-title">Datos Demográficos</h3>
      <p className="cr-modal-step-desc">Información básica del paciente</p>

      <div className="cr-modal-fields">
        <div className="cr-modal-row">
          <div className="cr-modal-field">
            <label>
              Tipo de identificación <span className="cr-required">*</span>
            </label>
            <select
              value={formData.demographicData.identificationType}
              onChange={(e) => updateField('demographicData', 'identificationType', e.target.value as IdentificationType)}
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>

          <div className="cr-modal-field">
            <label>
              Número de identificación <span className="cr-required">*</span>
            </label>
            <input
              type="text"
              value={formData.demographicData.identificationNumber}
              onChange={(e) => updateField('demographicData', 'identificationNumber', e.target.value)}
              placeholder="1234567890"
            />
            {errors.identificationNumber && <span className="cr-error">{errors.identificationNumber}</span>}
          </div>
        </div>

        <div className="cr-modal-field">
          <label>Lugar de nacimiento</label>
          <input
            type="text"
            value={formData.demographicData.birthPlace}
            onChange={(e) => updateField('demographicData', 'birthPlace', e.target.value)}
            placeholder="Ej: Bogotá, Colombia"
          />
        </div>

        <div className="cr-modal-field">
          <label>Dirección de residencia</label>
          <textarea
            value={formData.demographicData.residenceAddress}
            onChange={(e) => updateField('demographicData', 'residenceAddress', e.target.value)}
            placeholder="Calle, número, barrio..."
            rows={2}
          />
        </div>

        <div className="cr-modal-row">
          <div className="cr-modal-field">
            <label>Ciudad</label>
            <input
              type="text"
              value={formData.demographicData.city}
              onChange={(e) => updateField('demographicData', 'city', e.target.value)}
              placeholder="Ej: Medellín"
            />
          </div>

          <div className="cr-modal-field">
            <label>Ocupación</label>
            <input
              type="text"
              value={formData.demographicData.occupation}
              onChange={(e) => updateField('demographicData', 'occupation', e.target.value)}
              placeholder="Ej: Ingeniero, Estudiante"
            />
          </div>
        </div>

        <div className="cr-modal-row">
          <div className="cr-modal-field">
            <label>Nivel educativo</label>
            <select
              value={formData.demographicData.educationLevel}
              onChange={(e) => updateField('demographicData', 'educationLevel', e.target.value as EducationLevel)}
            >
              <option value="Primaria">Primaria</option>
              <option value="Bachillerato">Bachillerato</option>
              <option value="Técnico">Técnico</option>
              <option value="Universitario">Universitario</option>
              <option value="Posgrado">Posgrado</option>
            </select>
          </div>

          <div className="cr-modal-field">
            <label>Estado civil</label>
            <select
              value={formData.demographicData.maritalStatus}
              onChange={(e) => updateField('demographicData', 'maritalStatus', e.target.value as MaritalStatus)}
            >
              <option value="Soltero">Soltero/a</option>
              <option value="Casado">Casado/a</option>
              <option value="Unión libre">Unión libre</option>
              <option value="Divorciado">Divorciado/a</option>
              <option value="Viudo">Viudo/a</option>
            </select>
          </div>
        </div>

        <h4 className="cr-subsection-title">Contacto de Emergencia</h4>

        <div className="cr-modal-field">
          <label>Nombre completo</label>
          <input
            type="text"
            value={formData.emergencyContact.name}
            onChange={(e) => updateField('emergencyContact', 'name', e.target.value)}
            placeholder="Nombre del contacto de emergencia"
          />
        </div>

        <div className="cr-modal-row">
          <div className="cr-modal-field">
            <label>Parentesco</label>
            <input
              type="text"
              value={formData.emergencyContact.relationship}
              onChange={(e) => updateField('emergencyContact', 'relationship', e.target.value)}
              placeholder="Ej: Madre, Esposo, Hermana"
            />
          </div>

          <div className="cr-modal-field">
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.emergencyContact.phone}
              onChange={(e) => updateField('emergencyContact', 'phone', e.target.value)}
              placeholder="3001234567"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="cr-modal-step">
      <h3 className="cr-modal-step-title">Antecedentes</h3>
      <p className="cr-modal-step-desc">Historia médica, psiquiátrica y psicosocial</p>

      <div className="cr-modal-fields">
        <h4 className="cr-subsection-title">Antecedentes Personales</h4>

        <div className="cr-modal-field">
          <label>Antecedentes médicos</label>
          <textarea
            value={formData.history.personal.medical}
            onChange={(e) => updateNestedField('history', 'personal', 'medical', e.target.value)}
            placeholder="Enfermedades, cirugías, hospitalizaciones previas..."
            rows={3}
          />
        </div>

        <div className="cr-modal-field">
          <label>Antecedentes psiquiátricos</label>
          <textarea
            value={formData.history.personal.psychiatric}
            onChange={(e) => updateNestedField('history', 'personal', 'psychiatric', e.target.value)}
            placeholder="Diagnósticos previos, tratamientos, hospitalizaciones psiquiátricas..."
            rows={3}
          />
        </div>

        <div className="cr-modal-field">
          <label>Medicamentos actuales</label>
          <textarea
            value={formData.history.personal.medications}
            onChange={(e) => updateNestedField('history', 'personal', 'medications', e.target.value)}
            placeholder="Medicamentos que toma actualmente, dosis..."
            rows={2}
          />
        </div>

        <div className="cr-modal-row">
          <div className="cr-modal-field">
            <label>Alergias</label>
            <input
              type="text"
              value={formData.history.personal.allergies}
              onChange={(e) => updateNestedField('history', 'personal', 'allergies', e.target.value)}
              placeholder="Alergias conocidas"
            />
          </div>

          <div className="cr-modal-field">
            <label>Uso de sustancias</label>
            <input
              type="text"
              value={formData.history.personal.substanceUse}
              onChange={(e) => updateNestedField('history', 'personal', 'substanceUse', e.target.value)}
              placeholder="Alcohol, tabaco, drogas..."
            />
          </div>
        </div>

        <h4 className="cr-subsection-title">Antecedentes Familiares</h4>

        <div className="cr-modal-field">
          <label>Antecedentes psiquiátricos familiares</label>
          <textarea
            value={formData.history.family.psychiatric}
            onChange={(e) => updateNestedField('history', 'family', 'psychiatric', e.target.value)}
            placeholder="Trastornos mentales en familiares directos..."
            rows={2}
          />
        </div>

        <div className="cr-modal-field">
          <label>Antecedentes médicos familiares</label>
          <textarea
            value={formData.history.family.medical}
            onChange={(e) => updateNestedField('history', 'family', 'medical', e.target.value)}
            placeholder="Enfermedades relevantes en la familia..."
            rows={2}
          />
        </div>

        <h4 className="cr-subsection-title">Historia Psicosocial</h4>

        <div className="cr-modal-field">
          <label>Historia de la infancia</label>
          <textarea
            value={formData.history.psychosocial.childhood}
            onChange={(e) => updateNestedField('history', 'psychosocial', 'childhood', e.target.value)}
            placeholder="Desarrollo temprano, relación con padres, eventos significativos..."
            rows={3}
          />
        </div>

        <div className="cr-modal-field">
          <label>Historia académica</label>
          <textarea
            value={formData.history.psychosocial.academic}
            onChange={(e) => updateNestedField('history', 'psychosocial', 'academic', e.target.value)}
            placeholder="Rendimiento escolar, dificultades, logros..."
            rows={2}
          />
        </div>

        <div className="cr-modal-field">
          <label>Historia laboral</label>
          <textarea
            value={formData.history.psychosocial.work}
            onChange={(e) => updateNestedField('history', 'psychosocial', 'work', e.target.value)}
            placeholder="Empleos, satisfacción laboral, cambios frecuentes..."
            rows={2}
          />
        </div>

        <div className="cr-modal-field">
          <label>Historia de relaciones</label>
          <textarea
            value={formData.history.psychosocial.relationships}
            onChange={(e) => updateNestedField('history', 'psychosocial', 'relationships', e.target.value)}
            placeholder="Relaciones significativas, pareja, amistades..."
            rows={2}
          />
        </div>

        <div className="cr-modal-field">
          <label>Historia de trauma</label>
          <textarea
            value={formData.history.psychosocial.trauma}
            onChange={(e) => updateNestedField('history', 'psychosocial', 'trauma', e.target.value)}
            placeholder="Eventos traumáticos, abuso, pérdidas significativas..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="cr-modal-step">
      <h3 className="cr-modal-step-title">Motivo de Consulta y Evaluación Inicial</h3>
      <p className="cr-modal-step-desc">Razón de la consulta y primera impresión clínica</p>

      <div className="cr-modal-fields">
        <div className="cr-modal-field">
          <label>
            Motivo de consulta <span className="cr-required">*</span>
          </label>
          <textarea
            value={formData.consultation.reason}
            onChange={(e) => updateField('consultation', 'reason', e.target.value)}
            placeholder="¿Por qué acude el paciente a consulta? (Mínimo 10 caracteres - Resolución 1995/1999)"
            rows={4}
          />
          {errors.consultationReason && <span className="cr-error">{errors.consultationReason}</span>}
          <small className="cr-hint">Obligatorio según Resolución 1995/1999</small>
        </div>

        <div className="cr-modal-field">
          <label>Historia de la enfermedad actual</label>
          <textarea
            value={formData.consultation.currentIllnessHistory}
            onChange={(e) => updateField('consultation', 'currentIllnessHistory', e.target.value)}
            placeholder="Evolución de los síntomas actuales, cuándo comenzaron, factores desencadenantes..."
            rows={4}
          />
        </div>

        <div className="cr-modal-field">
          <label>Fecha de consulta</label>
          <input
            type="date"
            value={formData.consultation.date}
            onChange={(e) => updateField('consultation', 'date', e.target.value)}
          />
        </div>

        <h4 className="cr-subsection-title">Evaluación Inicial</h4>

        <div className="cr-modal-field">
          <label>Examen del estado mental</label>
          <textarea
            value={formData.initialAssessment.mentalStatusExam}
            onChange={(e) => updateField('initialAssessment', 'mentalStatusExam', e.target.value)}
            placeholder="Apariencia, conducta, afecto, pensamiento, percepción, orientación, memoria, juicio..."
            rows={4}
          />
        </div>

        <div className="cr-modal-field">
          <label>Evaluación de riesgo</label>
          <textarea
            value={formData.initialAssessment.riskAssessment}
            onChange={(e) => updateField('initialAssessment', 'riskAssessment', e.target.value)}
            placeholder="Riesgo suicida, riesgo de heteroagresión, capacidad de cuidado personal..."
            rows={3}
          />
        </div>

        <div className="cr-modal-field">
          <label>Fortalezas y recursos</label>
          <textarea
            value={formData.initialAssessment.strengthsResources}
            onChange={(e) => updateField('initialAssessment', 'strengthsResources', e.target.value)}
            placeholder="Factores protectores, apoyo social, habilidades de afrontamiento..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="cr-modal-step">
      <h3 className="cr-modal-step-title">Plan de Tratamiento Inicial</h3>
      <p className="cr-modal-step-desc">Objetivos terapéuticos y enfoque propuesto</p>

      <div className="cr-modal-fields">
        <div className="cr-modal-field">
          <label>Objetivos terapéuticos</label>
          <textarea
            value={formData.treatmentPlan.goals}
            onChange={(e) => updateField('treatmentPlan', 'goals', e.target.value)}
            placeholder="Objetivos específicos, medibles y alcanzables del tratamiento..."
            rows={4}
          />
        </div>

        <div className="cr-modal-field">
          <label>Enfoque terapéutico</label>
          <input
            type="text"
            value={formData.treatmentPlan.therapeuticApproach}
            onChange={(e) => updateField('treatmentPlan', 'therapeuticApproach', e.target.value)}
            placeholder="Ej: Cognitivo-Conductual, Psicodinámico, Humanista..."
          />
        </div>

        <div className="cr-modal-row">
          <div className="cr-modal-field">
            <label>Número estimado de sesiones</label>
            <input
              type="number"
              value={formData.treatmentPlan.estimatedSessions}
              onChange={(e) => updateField('treatmentPlan', 'estimatedSessions', parseInt(e.target.value) || 10)}
              min="1"
              max="100"
            />
          </div>

          <div className="cr-modal-field">
            <label>Frecuencia de sesiones</label>
            <select
              value={formData.treatmentPlan.sessionFrequency}
              onChange={(e) => updateField('treatmentPlan', 'sessionFrequency', e.target.value)}
            >
              <option value="Semanal">Semanal</option>
              <option value="Quincenal">Quincenal</option>
              <option value="Mensual">Mensual</option>
              <option value="Según necesidad">Según necesidad</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="cr-modal-step">
      <h3 className="cr-modal-step-title">Consentimientos Informados</h3>
      <p className="cr-modal-step-desc">Obligatorio según Ley 1581/2012 de Protección de Datos</p>

      <div className="cr-modal-fields">
        <div className="cr-consent-box">
          <h4>Consentimiento Informado para Tratamiento Psicológico</h4>
          <div className="cr-consent-content">
            <p>
              Por medio del presente documento declaro que he sido informado/a de manera clara y completa sobre:
            </p>
            <ul>
              <li>Los objetivos y alcances del proceso terapéutico</li>
              <li>Las técnicas y procedimientos que se utilizarán</li>
              <li>Los beneficios esperados y posibles riesgos</li>
              <li>El carácter confidencial de la información compartida</li>
              <li>Mi derecho a suspender el tratamiento en cualquier momento</li>
              <li>Las condiciones de pago y políticas de cancelación</li>
            </ul>
            <p>
              Entiendo que la terapia psicológica es un proceso colaborativo que requiere mi participación activa.
            </p>
          </div>

          <label className="cr-consent-checkbox">
            <input
              type="checkbox"
              checked={formData.consents.informedConsent}
              onChange={(e) => updateField('consents', 'informedConsent', e.target.checked)}
            />
            <span>
              Acepto y doy mi consentimiento informado <span className="cr-required">*</span>
            </span>
          </label>
        </div>

        <div className="cr-consent-box">
          <h4>Autorización para Tratamiento de Datos Personales</h4>
          <div className="cr-consent-content">
            <p>De acuerdo con la Ley 1581 de 2012, autorizo al psicólogo/a para:</p>
            <ul>
              <li>Recopilar y almacenar mis datos personales y de salud</li>
              <li>Utilizar esta información exclusivamente para fines terapéuticos</li>
              <li>Conservar mi historia clínica según la normativa vigente</li>
              <li>Mantener la confidencialidad de mi información</li>
            </ul>
            <p>
              Conozco mis derechos de acceso, rectificación, actualización y supresión de mis datos personales.
            </p>
          </div>

          <label className="cr-consent-checkbox">
            <input
              type="checkbox"
              checked={formData.consents.dataProcessing}
              onChange={(e) => updateField('consents', 'dataProcessing', e.target.checked)}
            />
            <span>
              Autorizo el tratamiento de mis datos personales <span className="cr-required">*</span>
            </span>
          </label>
        </div>

        <div className="cr-modal-field">
          <label>Fecha de aceptación</label>
          <input
            type="date"
            value={formData.consents.date}
            onChange={(e) => updateField('consents', 'date', e.target.value)}
          />
        </div>

        {errors.consents && <div className="cr-error-box">{errors.consents}</div>}
        {errors.submit && <div className="cr-error-box">{errors.submit}</div>}
      </div>
    </div>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="cr-modal-backdrop" onClick={onClose}>
      <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cr-modal-header">
          <div>
            <h2>Apertura de Historia Clínica</h2>
            <p className="cr-modal-subtitle">Cumplimiento normativo colombiano (Resolución 1995/1999, Ley 1581/2012)</p>
          </div>
          <button className="cr-modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="cr-progress">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`cr-progress-step ${currentStep === step ? 'cr-progress-step--active' : ''} ${
                currentStep > step ? 'cr-progress-step--completed' : ''
              }`}
            >
              {currentStep > step ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{step}</span>
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="cr-step-labels">
          <span className={currentStep === 1 ? 'cr-step-label--active' : ''}>Datos</span>
          <span className={currentStep === 2 ? 'cr-step-label--active' : ''}>Antecedentes</span>
          <span className={currentStep === 3 ? 'cr-step-label--active' : ''}>Consulta</span>
          <span className={currentStep === 4 ? 'cr-step-label--active' : ''}>Plan</span>
          <span className={currentStep === 5 ? 'cr-step-label--active' : ''}>Consentimientos</span>
        </div>

        {/* Content */}
        <div className="cr-modal-body">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Footer */}
        <div className="cr-modal-footer">
          <button
            type="button"
            className="cr-btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 1 || saving}
          >
            Anterior
          </button>

          {currentStep < 5 ? (
            <button type="button" className="cr-btn-primary" onClick={handleNext}>
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              className="cr-btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Historia Clínica'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalRecordModal;
