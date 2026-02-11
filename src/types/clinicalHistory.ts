// ============================================
// TIPOS E INTERFACES - SISTEMA DE HISTORIA CLÍNICA
// Cumplimiento normativo colombiano
// ============================================

// ============================================
// TIPOS BÁSICOS
// ============================================

export type IdentificationType = 'CC' | 'TI' | 'CE' | 'Pasaporte';

export type EducationLevel =
  | 'Primaria'
  | 'Bachillerato'
  | 'Técnico'
  | 'Universitario'
  | 'Posgrado';

export type MaritalStatus =
  | 'Soltero'
  | 'Casado'
  | 'Unión libre'
  | 'Divorciado'
  | 'Viudo';

export type SessionType = 'individual' | 'grupal' | 'familiar' | 'pareja';

export type SessionModality = 'Virtual' | 'Presencial';

export type TreatmentProgress =
  | 'Excelente'
  | 'Bueno'
  | 'Regular'
  | 'Sin cambios'
  | 'Deterioro';

export type SuicideRiskLevel = 'Ninguno' | 'Bajo' | 'Medio' | 'Alto';

export type RecordStatus = 'active' | 'inactive' | 'closed';

// ============================================
// INTERFACES DE BASE DE DATOS (espejo de las tablas)
// ============================================

export interface ClinicalRecord {
  id: string;
  patient_id: string;
  psychologist_id: string;
  created_at: string;
  updated_at: string;

  // Datos demográficos
  identification_type: IdentificationType | null;
  identification_number: string;
  birth_place: string | null;
  residence_address: string | null;
  city: string | null;
  occupation: string | null;
  education_level: EducationLevel | null;
  marital_status: MaritalStatus | null;

  // Contacto de emergencia
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;

  // Motivo de consulta
  consultation_reason: string;
  current_illness_history: string | null;
  consultation_date: string;

  // Antecedentes personales
  personal_medical_history: string | null;
  personal_psychiatric_history: string | null;
  current_medications: string | null;
  allergies: string | null;
  substance_use: string | null;

  // Antecedentes familiares
  family_psychiatric_history: string | null;
  family_medical_history: string | null;

  // Historia psicosocial
  childhood_history: string | null;
  academic_history: string | null;
  work_history: string | null;
  relationship_history: string | null;
  trauma_history: string | null;

  // Evaluación inicial
  mental_status_exam: string | null;
  risk_assessment: string | null;
  strengths_resources: string | null;

  // Consentimientos
  informed_consent_accepted: boolean;
  informed_consent_date: string | null;
  data_treatment_consent: boolean;
  data_treatment_date: string | null;

  // Plan inicial
  initial_treatment_goals: string | null;
  initial_therapeutic_approach: string | null;
  estimated_sessions: number | null;
  session_frequency: string | null;

  // Metadatos
  record_status: RecordStatus;
}

export interface SessionNote {
  id: string;
  clinical_record_id: string;
  appointment_id: string;
  psychologist_id: string;
  patient_id: string;

  // Información de la sesión
  session_number: number;
  session_date: string;
  session_duration_minutes: number | null;
  session_type: SessionType;
  session_modality: SessionModality | null;

  // Evolución (SOAP)
  subjective_data: string;
  objective_observations: string;
  intervention_description: string;
  patient_response: string | null;

  // Diagnóstico CIE-10
  primary_diagnosis_code: string;
  primary_diagnosis_description: string;
  secondary_diagnoses: SecondaryDiagnosis[] | null;
  diagnostic_impression: string | null;

  // Evaluación del progreso
  treatment_progress: TreatmentProgress | null;
  goals_progress: string | null;
  homework_assigned: string | null;
  homework_completion: string | null;

  // Plan de tratamiento
  treatment_plan_modifications: string | null;
  next_session_goals: string | null;
  therapeutic_techniques_used: string[] | null;

  // Prescripciones
  medication_prescribed: boolean;
  prescription_details: string | null;

  // Riesgo y alertas
  suicide_risk_level: SuicideRiskLevel | null;
  requires_immediate_attention: boolean;
  alert_notes: string | null;

  // Seguimiento
  next_appointment_recommendation: string | null;
  referral_made: boolean;
  referral_details: string | null;

  // Metadatos
  created_at: string;
  updated_at: string;
  is_draft: boolean;
}

export interface CIE10Code {
  code: string;
  description: string;
  category: string | null;
  keywords: string[];
  commonly_used: boolean;
  created_at: string;
}

export interface SecondaryDiagnosis {
  code: string;
  description: string;
}

// ============================================
// INTERFACES PARA FORMULARIOS (datos de entrada)
// ============================================

export interface ClinicalRecordFormData {
  // Paso 1: Datos Demográficos
  demographicData: {
    identificationType: IdentificationType;
    identificationNumber: string;
    birthPlace: string;
    residenceAddress: string;
    city: string;
    occupation: string;
    educationLevel: EducationLevel;
    maritalStatus: MaritalStatus;
  };

  // Paso 1B: Contacto de Emergencia
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Paso 2: Antecedentes
  history: {
    personal: {
      medical: string;
      psychiatric: string;
      medications: string;
      allergies: string;
      substanceUse: string;
    };
    family: {
      psychiatric: string;
      medical: string;
    };
    psychosocial: {
      childhood: string;
      academic: string;
      work: string;
      relationships: string;
      trauma: string;
    };
  };

  // Paso 3: Motivo de Consulta y Evaluación Inicial
  consultation: {
    reason: string;
    currentIllnessHistory: string;
    date: string;
  };

  initialAssessment: {
    mentalStatusExam: string;
    riskAssessment: string;
    strengthsResources: string;
  };

  // Paso 4: Plan de Tratamiento Inicial
  treatmentPlan: {
    goals: string;
    therapeuticApproach: string;
    estimatedSessions: number;
    sessionFrequency: string;
  };

  // Paso 5: Consentimientos
  consents: {
    informedConsent: boolean;
    dataProcessing: boolean;
    date: string;
  };
}

export interface SessionNoteFormData {
  // Tab 1: Información y Evolución
  sessionInfo: {
    sessionNumber: number;
    date: string;
    duration: number;
    type: SessionType;
    modality: SessionModality;
  };

  soap: {
    subjective: string;
    objective: string;
    intervention: string;
    patientResponse: string;
  };

  // Tab 2: Diagnóstico y Riesgo
  diagnosis: {
    primary: {
      code: string;
      description: string;
    };
    secondary: SecondaryDiagnosis[];
    impression: string;
  };

  risk: {
    suicideRisk: SuicideRiskLevel;
    requiresAttention: boolean;
    alertNotes: string;
  };

  // Tab 3: Progreso y Plan
  progress: {
    overall: TreatmentProgress;
    goalsProgress: string;
    homeworkAssigned: string;
    homeworkCompletion: string;
  };

  plan: {
    modifications: string;
    nextSessionGoals: string;
    techniquesUsed: string[];
  };

  followUp: {
    nextAppointmentRecommendation: string;
    referralMade: boolean;
    referralDetails?: string;
  };

  medication?: {
    prescribed: boolean;
    details: string;
  };
}

// ============================================
// INTERFACES PARA TRANSFORMACIÓN DE DATOS
// ============================================

/**
 * Transforma datos del formulario a formato de base de datos
 */
export function clinicalRecordFormToDatabase(
  formData: ClinicalRecordFormData,
  patientId: string,
  psychologistId: string
): Omit<ClinicalRecord, 'id' | 'created_at' | 'updated_at'> {
  return {
    patient_id: patientId,
    psychologist_id: psychologistId,

    // Datos demográficos
    identification_type: formData.demographicData.identificationType,
    identification_number: formData.demographicData.identificationNumber,
    birth_place: formData.demographicData.birthPlace || null,
    residence_address: formData.demographicData.residenceAddress || null,
    city: formData.demographicData.city || null,
    occupation: formData.demographicData.occupation || null,
    education_level: formData.demographicData.educationLevel || null,
    marital_status: formData.demographicData.maritalStatus || null,

    // Contacto de emergencia
    emergency_contact_name: formData.emergencyContact.name || null,
    emergency_contact_relationship: formData.emergencyContact.relationship || null,
    emergency_contact_phone: formData.emergencyContact.phone || null,

    // Motivo de consulta
    consultation_reason: formData.consultation.reason,
    current_illness_history: formData.consultation.currentIllnessHistory || null,
    consultation_date: formData.consultation.date,

    // Antecedentes personales
    personal_medical_history: formData.history.personal.medical || null,
    personal_psychiatric_history: formData.history.personal.psychiatric || null,
    current_medications: formData.history.personal.medications || null,
    allergies: formData.history.personal.allergies || null,
    substance_use: formData.history.personal.substanceUse || null,

    // Antecedentes familiares
    family_psychiatric_history: formData.history.family.psychiatric || null,
    family_medical_history: formData.history.family.medical || null,

    // Historia psicosocial
    childhood_history: formData.history.psychosocial.childhood || null,
    academic_history: formData.history.psychosocial.academic || null,
    work_history: formData.history.psychosocial.work || null,
    relationship_history: formData.history.psychosocial.relationships || null,
    trauma_history: formData.history.psychosocial.trauma || null,

    // Evaluación inicial
    mental_status_exam: formData.initialAssessment.mentalStatusExam || null,
    risk_assessment: formData.initialAssessment.riskAssessment || null,
    strengths_resources: formData.initialAssessment.strengthsResources || null,

    // Consentimientos
    informed_consent_accepted: formData.consents.informedConsent,
    informed_consent_date: formData.consents.informedConsent ? formData.consents.date : null,
    data_treatment_consent: formData.consents.dataProcessing,
    data_treatment_date: formData.consents.dataProcessing ? formData.consents.date : null,

    // Plan inicial
    initial_treatment_goals: formData.treatmentPlan.goals || null,
    initial_therapeutic_approach: formData.treatmentPlan.therapeuticApproach || null,
    estimated_sessions: formData.treatmentPlan.estimatedSessions || null,
    session_frequency: formData.treatmentPlan.sessionFrequency || null,

    // Metadatos
    record_status: 'active',
  };
}

/**
 * Transforma datos del formulario de sesión a formato de base de datos
 */
export function sessionNoteFormToDatabase(
  formData: SessionNoteFormData,
  clinicalRecordId: string,
  appointmentId: string,
  psychologistId: string,
  patientId: string
): Omit<SessionNote, 'id' | 'created_at' | 'updated_at'> {
  return {
    clinical_record_id: clinicalRecordId,
    appointment_id: appointmentId,
    psychologist_id: psychologistId,
    patient_id: patientId,

    // Información de la sesión
    session_number: formData.sessionInfo.sessionNumber,
    session_date: formData.sessionInfo.date,
    session_duration_minutes: formData.sessionInfo.duration || null,
    session_type: formData.sessionInfo.type,
    session_modality: formData.sessionInfo.modality || null,

    // Evolución (SOAP)
    subjective_data: formData.soap.subjective,
    objective_observations: formData.soap.objective,
    intervention_description: formData.soap.intervention,
    patient_response: formData.soap.patientResponse || null,

    // Diagnóstico CIE-10
    primary_diagnosis_code: formData.diagnosis.primary.code,
    primary_diagnosis_description: formData.diagnosis.primary.description,
    secondary_diagnoses: formData.diagnosis.secondary.length > 0 ? formData.diagnosis.secondary : null,
    diagnostic_impression: formData.diagnosis.impression || null,

    // Evaluación del progreso
    treatment_progress: formData.progress.overall || null,
    goals_progress: formData.progress.goalsProgress || null,
    homework_assigned: formData.progress.homeworkAssigned || null,
    homework_completion: formData.progress.homeworkCompletion || null,

    // Plan de tratamiento
    treatment_plan_modifications: formData.plan.modifications || null,
    next_session_goals: formData.plan.nextSessionGoals || null,
    therapeutic_techniques_used: formData.plan.techniquesUsed.length > 0 ? formData.plan.techniquesUsed : null,

    // Prescripciones
    medication_prescribed: formData.medication?.prescribed || false,
    prescription_details: formData.medication?.details || null,

    // Riesgo y alertas
    suicide_risk_level: formData.risk.suicideRisk || null,
    requires_immediate_attention: formData.risk.requiresAttention,
    alert_notes: formData.risk.alertNotes || null,

    // Seguimiento
    next_appointment_recommendation: formData.followUp.nextAppointmentRecommendation || null,
    referral_made: formData.followUp.referralMade,
    referral_details: formData.followUp.referralDetails || null,

    // Metadatos
    is_draft: false, // Por defecto, se establece en la UI
  };
}

// ============================================
// UTILIDADES DE VALIDACIÓN
// ============================================

/**
 * Valida que el motivo de consulta cumpla con la Resolución 1995
 * Mínimo 10 caracteres
 */
export function validateConsultationReason(reason: string): boolean {
  return reason.trim().length >= 10;
}

/**
 * Valida que los datos SOAP cumplan con los requisitos mínimos
 * Mínimo 20 caracteres cada campo
 */
export function validateSOAPField(field: string): boolean {
  return field.trim().length >= 20;
}

/**
 * Valida que ambos consentimientos estén aceptados (Ley 1581/2012)
 */
export function validateConsents(
  informedConsent: boolean,
  dataProcessing: boolean
): boolean {
  return informedConsent && dataProcessing;
}

/**
 * Valida que el diagnóstico principal esté presente
 */
export function validatePrimaryDiagnosis(code: string, description: string): boolean {
  return code.trim().length > 0 && description.trim().length > 0;
}

/**
 * Valida que si el riesgo suicida es Alto, haya notas de alerta
 */
export function validateHighRiskAlert(
  suicideRisk: SuicideRiskLevel,
  alertNotes: string
): boolean {
  if (suicideRisk === 'Alto') {
    return alertNotes.trim().length >= 10;
  }
  return true; // No es Alto, no requiere notas
}

// ============================================
// TIPOS PARA PROPS DE COMPONENTES
// ============================================

export interface ClinicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  psychologistId: string;
  onSuccess: (clinicalRecordId: string) => void;
}

export interface SessionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  clinicalRecordId: string;
  sessionNumber: number;
  patientId: string;
  psychologistId: string;
  onSuccess: () => void;
}

export interface CIE10SearchProps {
  onSelect: (code: CIE10Code) => void;
  selectedCode?: string;
  label?: string;
  required?: boolean;
}

// ============================================
// ESTADOS INICIALES PARA FORMULARIOS
// ============================================

export const initialClinicalRecordForm: ClinicalRecordFormData = {
  demographicData: {
    identificationType: 'CC',
    identificationNumber: '',
    birthPlace: '',
    residenceAddress: '',
    city: '',
    occupation: '',
    educationLevel: 'Bachillerato',
    maritalStatus: 'Soltero',
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
  history: {
    personal: {
      medical: '',
      psychiatric: '',
      medications: '',
      allergies: '',
      substanceUse: '',
    },
    family: {
      psychiatric: '',
      medical: '',
    },
    psychosocial: {
      childhood: '',
      academic: '',
      work: '',
      relationships: '',
      trauma: '',
    },
  },
  consultation: {
    reason: '',
    currentIllnessHistory: '',
    date: new Date().toISOString().split('T')[0],
  },
  initialAssessment: {
    mentalStatusExam: '',
    riskAssessment: '',
    strengthsResources: '',
  },
  treatmentPlan: {
    goals: '',
    therapeuticApproach: '',
    estimatedSessions: 10,
    sessionFrequency: 'Semanal',
  },
  consents: {
    informedConsent: false,
    dataProcessing: false,
    date: new Date().toISOString().split('T')[0],
  },
};

export const initialSessionNoteForm: SessionNoteFormData = {
  sessionInfo: {
    sessionNumber: 1,
    date: new Date().toISOString().split('T')[0],
    duration: 50,
    type: 'individual',
    modality: 'Virtual',
  },
  soap: {
    subjective: '',
    objective: '',
    intervention: '',
    patientResponse: '',
  },
  diagnosis: {
    primary: {
      code: '',
      description: '',
    },
    secondary: [],
    impression: '',
  },
  risk: {
    suicideRisk: 'Ninguno',
    requiresAttention: false,
    alertNotes: '',
  },
  progress: {
    overall: 'Regular',
    goalsProgress: '',
    homeworkAssigned: '',
    homeworkCompletion: '',
  },
  plan: {
    modifications: '',
    nextSessionGoals: '',
    techniquesUsed: [],
  },
  followUp: {
    nextAppointmentRecommendation: '',
    referralMade: false,
    referralDetails: '',
  },
  medication: {
    prescribed: false,
    details: '',
  },
};
