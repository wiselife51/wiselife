-- ============================================
-- SPRINT 1: SISTEMA DE HISTORIA CLÍNICA
-- Base de datos para cumplimiento normativo colombiano
-- ============================================

-- ============================================
-- TABLA 1: clinical_records (Apertura de Historia Clínica)
-- Cumple con Resolución 1995/1999, Ley 1581/2012, Ley 1090/2006
-- ============================================

CREATE TABLE IF NOT EXISTS clinical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Datos demográficos expandidos
  identification_type VARCHAR(50), -- CC, TI, CE, Pasaporte
  identification_number VARCHAR(50) NOT NULL,
  birth_place VARCHAR(255),
  residence_address TEXT,
  city VARCHAR(100),
  occupation VARCHAR(255),
  education_level VARCHAR(100), -- Primaria, Bachillerato, Técnico, Universitario, Posgrado
  marital_status VARCHAR(50), -- Soltero, Casado, Unión libre, Divorciado, Viudo

  -- Contacto de emergencia
  emergency_contact_name VARCHAR(255),
  emergency_contact_relationship VARCHAR(100),
  emergency_contact_phone VARCHAR(50),

  -- Motivo de consulta (OBLIGATORIO - Resolución 1995)
  consultation_reason TEXT NOT NULL,
  current_illness_history TEXT,
  consultation_date DATE DEFAULT CURRENT_DATE,

  -- Antecedentes personales
  personal_medical_history TEXT,
  personal_psychiatric_history TEXT,
  current_medications TEXT,
  allergies TEXT,
  substance_use TEXT,

  -- Antecedentes familiares
  family_psychiatric_history TEXT,
  family_medical_history TEXT,

  -- Historia psicosocial
  childhood_history TEXT,
  academic_history TEXT,
  work_history TEXT,
  relationship_history TEXT,
  trauma_history TEXT,

  -- Evaluación inicial
  mental_status_exam TEXT,
  risk_assessment TEXT,
  strengths_resources TEXT,

  -- Consentimientos (OBLIGATORIO - Ley 1581/2012)
  informed_consent_accepted BOOLEAN DEFAULT FALSE,
  informed_consent_date TIMESTAMPTZ,
  data_treatment_consent BOOLEAN DEFAULT FALSE,
  data_treatment_date TIMESTAMPTZ,

  -- Plan inicial
  initial_treatment_goals TEXT,
  initial_therapeutic_approach VARCHAR(255),
  estimated_sessions INTEGER,
  session_frequency VARCHAR(100),

  -- Metadatos
  record_status VARCHAR(50) DEFAULT 'active',

  CONSTRAINT unique_patient_psychologist UNIQUE(patient_id, psychologist_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_clinical_records_patient ON clinical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_psychologist ON clinical_records(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_created ON clinical_records(created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE clinical_records IS 'Historia Clínica de pacientes - Cumple normativa colombiana';
COMMENT ON COLUMN clinical_records.consultation_reason IS 'OBLIGATORIO - Resolución 1995/1999';
COMMENT ON COLUMN clinical_records.informed_consent_accepted IS 'OBLIGATORIO - Ley 1581/2012';

-- ============================================
-- TABLA 2: session_notes (Registro por Sesión)
-- Registro de evolución clínica por cada cita
-- ============================================

CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinical_record_id UUID NOT NULL REFERENCES clinical_records(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Información de la sesión
  session_number INTEGER NOT NULL,
  session_date DATE NOT NULL,
  session_duration_minutes INTEGER,
  session_type VARCHAR(50) DEFAULT 'individual',
  session_modality VARCHAR(50), -- Virtual, Presencial

  -- Evolución (SOAP simplificado - OBLIGATORIO)
  subjective_data TEXT NOT NULL, -- Relato del paciente
  objective_observations TEXT NOT NULL, -- Observaciones del psicólogo
  intervention_description TEXT NOT NULL, -- Técnicas utilizadas
  patient_response TEXT,

  -- Diagnóstico CIE-10 (OBLIGATORIO)
  primary_diagnosis_code VARCHAR(10) NOT NULL,
  primary_diagnosis_description TEXT NOT NULL,
  secondary_diagnoses JSONB, -- [{code, description}]
  diagnostic_impression TEXT,

  -- Evaluación del progreso
  treatment_progress VARCHAR(50), -- Excelente, Bueno, Regular, Sin cambios, Deterioro
  goals_progress TEXT,
  homework_assigned TEXT,
  homework_completion TEXT,

  -- Plan de tratamiento
  treatment_plan_modifications TEXT,
  next_session_goals TEXT,
  therapeutic_techniques_used TEXT[],

  -- Prescripciones (opcional)
  medication_prescribed BOOLEAN DEFAULT FALSE,
  prescription_details TEXT,

  -- Riesgo y alertas
  suicide_risk_level VARCHAR(50), -- Ninguno, Bajo, Medio, Alto
  requires_immediate_attention BOOLEAN DEFAULT FALSE,
  alert_notes TEXT,

  -- Seguimiento
  next_appointment_recommendation DATE,
  referral_made BOOLEAN DEFAULT FALSE,
  referral_details TEXT,

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_draft BOOLEAN DEFAULT FALSE,

  CONSTRAINT unique_session_per_appointment UNIQUE(appointment_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_session_notes_clinical_record ON session_notes(clinical_record_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_appointment ON session_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_patient ON session_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_date ON session_notes(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_notes_psychologist ON session_notes(psychologist_id);

-- Comentarios para documentación
COMMENT ON TABLE session_notes IS 'Notas de evolución clínica por sesión - Resolución 1995/1999';
COMMENT ON COLUMN session_notes.subjective_data IS 'OBLIGATORIO - Relato del paciente (SOAP)';
COMMENT ON COLUMN session_notes.primary_diagnosis_code IS 'OBLIGATORIO - Código CIE-10';

-- ============================================
-- TABLA 3: cie10_codes (Catálogo CIE-10)
-- Códigos diagnósticos internacionales
-- ============================================

CREATE TABLE IF NOT EXISTS cie10_codes (
  code VARCHAR(10) PRIMARY KEY,
  description TEXT NOT NULL,
  category VARCHAR(50),
  keywords TEXT[],
  commonly_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_cie10_description ON cie10_codes USING gin(to_tsvector('spanish', description));
CREATE INDEX IF NOT EXISTS idx_cie10_keywords ON cie10_codes USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_cie10_commonly_used ON cie10_codes(commonly_used) WHERE commonly_used = TRUE;

-- Comentarios
COMMENT ON TABLE cie10_codes IS 'Catálogo de códigos CIE-10 para diagnósticos psicológicos';

-- ============================================
-- DATOS INICIALES: Códigos CIE-10 más comunes en psicología
-- ============================================

INSERT INTO cie10_codes (code, description, category, commonly_used, keywords) VALUES
  ('F41.1', 'Trastorno de ansiedad generalizada', 'Trastornos de ansiedad', TRUE, ARRAY['ansiedad', 'preocupación', 'nerviosismo', 'TAG']),
  ('F32.1', 'Episodio depresivo moderado', 'Trastornos del estado de ánimo', TRUE, ARRAY['depresión', 'tristeza', 'anhedonia', 'depresivo']),
  ('F32.0', 'Episodio depresivo leve', 'Trastornos del estado de ánimo', TRUE, ARRAY['depresión', 'leve', 'tristeza']),
  ('F32.2', 'Episodio depresivo grave sin síntomas psicóticos', 'Trastornos del estado de ánimo', TRUE, ARRAY['depresión', 'grave', 'severo']),
  ('F41.0', 'Trastorno de pánico', 'Trastornos de ansiedad', TRUE, ARRAY['pánico', 'crisis', 'palpitaciones', 'ataque']),
  ('F43.1', 'Trastorno de estrés postraumático', 'Trastornos adaptativos', TRUE, ARRAY['trauma', 'estrés', 'flashback', 'TEPT', 'PTSD']),
  ('F43.2', 'Trastornos de adaptación', 'Trastornos adaptativos', TRUE, ARRAY['adaptación', 'ajuste', 'estrés']),
  ('F60.3', 'Trastorno de inestabilidad emocional de la personalidad', 'Trastornos de personalidad', TRUE, ARRAY['borderline', 'impulsividad', 'TLP']),
  ('F60.31', 'Trastorno de inestabilidad emocional de la personalidad tipo límite', 'Trastornos de personalidad', TRUE, ARRAY['borderline', 'límite', 'TLP']),
  ('F90.0', 'Trastorno de la actividad y de la atención', 'Trastornos del desarrollo', TRUE, ARRAY['TDAH', 'hiperactividad', 'atención', 'déficit']),
  ('F40.1', 'Fobias sociales', 'Trastornos de ansiedad', TRUE, ARRAY['fobia', 'social', 'timidez', 'ansiedad social']),
  ('F40.2', 'Fobias específicas', 'Trastornos de ansiedad', TRUE, ARRAY['fobia', 'miedo', 'específica']),
  ('F50.0', 'Anorexia nerviosa', 'Trastornos alimentarios', TRUE, ARRAY['anorexia', 'alimentación', 'peso', 'TCA']),
  ('F50.2', 'Bulimia nerviosa', 'Trastornos alimentarios', TRUE, ARRAY['bulimia', 'atracón', 'purga', 'TCA']),
  ('F33.1', 'Trastorno depresivo recurrente, episodio actual moderado', 'Trastornos del estado de ánimo', TRUE, ARRAY['depresión', 'recurrente', 'crónico']),
  ('F42', 'Trastorno obsesivo-compulsivo', 'Trastornos de ansiedad', TRUE, ARRAY['TOC', 'obsesiones', 'compulsiones', 'obsesivo']),
  ('F51.0', 'Insomnio no orgánico', 'Trastornos del sueño', TRUE, ARRAY['insomnio', 'sueño', 'dormir']),
  ('F52.0', 'Ausencia o pérdida del deseo sexual', 'Trastornos sexuales', FALSE, ARRAY['libido', 'deseo', 'sexual']),
  ('F63.0', 'Juego patológico', 'Trastornos de control de impulsos', FALSE, ARRAY['ludopatía', 'juego', 'apuestas']),
  ('F84.0', 'Autismo infantil', 'Trastornos del desarrollo', TRUE, ARRAY['autismo', 'TEA', 'espectro']),
  ('F84.5', 'Síndrome de Asperger', 'Trastornos del desarrollo', TRUE, ARRAY['asperger', 'autismo', 'TEA']),
  ('F43.0', 'Reacción a estrés agudo', 'Trastornos adaptativos', TRUE, ARRAY['estrés', 'agudo', 'crisis']),
  ('F45.0', 'Trastorno de somatización', 'Trastornos somatomorfos', FALSE, ARRAY['somatización', 'síntomas', 'físicos']),
  ('F45.4', 'Trastorno de dolor somatomorfo persistente', 'Trastornos somatomorfos', FALSE, ARRAY['dolor', 'crónico', 'somatomorfo']),
  ('F48.0', 'Neurastenia', 'Otros trastornos neuróticos', FALSE, ARRAY['fatiga', 'agotamiento', 'neurastenia']),
  ('F93.0', 'Trastorno de ansiedad de separación de la infancia', 'Trastornos de la infancia', TRUE, ARRAY['separación', 'ansiedad', 'niños', 'infantil']),
  ('F91.1', 'Trastorno disocial', 'Trastornos de conducta', TRUE, ARRAY['conducta', 'disocial', 'agresión']),
  ('F10.2', 'Trastorno por dependencia de alcohol', 'Trastornos por sustancias', TRUE, ARRAY['alcohol', 'alcoholismo', 'dependencia']),
  ('F11.2', 'Trastorno por dependencia de opioides', 'Trastornos por sustancias', FALSE, ARRAY['opioides', 'drogas', 'dependencia']),
  ('F12.2', 'Trastorno por dependencia de cannabinoides', 'Trastornos por sustancias', FALSE, ARRAY['marihuana', 'cannabis', 'dependencia']),
  ('F14.2', 'Trastorno por dependencia de cocaína', 'Trastornos por sustancias', FALSE, ARRAY['cocaína', 'drogas', 'dependencia']),
  ('F20.0', 'Esquizofrenia paranoide', 'Trastornos psicóticos', FALSE, ARRAY['esquizofrenia', 'paranoide', 'psicosis']),
  ('F31.0', 'Trastorno bipolar, episodio actual hipomaníaco', 'Trastornos del estado de ánimo', TRUE, ARRAY['bipolar', 'hipomanía', 'estado de ánimo']),
  ('F31.3', 'Trastorno bipolar, episodio actual depresivo leve o moderado', 'Trastornos del estado de ánimo', TRUE, ARRAY['bipolar', 'depresión', 'ciclotimia']),
  ('F34.0', 'Ciclotimia', 'Trastornos del estado de ánimo', FALSE, ARRAY['ciclotimia', 'ciclotímico', 'humor']),
  ('F34.1', 'Distimia', 'Trastornos del estado de ánimo', TRUE, ARRAY['distimia', 'depresión', 'crónico']),
  ('Z63.0', 'Problemas en la relación con el cónyuge o la pareja', 'Códigos Z - Factores psicosociales', TRUE, ARRAY['pareja', 'matrimonio', 'relación', 'conflicto']),
  ('Z63.4', 'Desaparición o muerte de un miembro de la familia', 'Códigos Z - Factores psicosociales', TRUE, ARRAY['duelo', 'muerte', 'pérdida', 'luto']),
  ('Z65.4', 'Víctima de crimen y terrorismo', 'Códigos Z - Factores psicosociales', FALSE, ARRAY['trauma', 'víctima', 'violencia']),
  ('Z73.0', 'Agotamiento', 'Códigos Z - Factores psicosociales', TRUE, ARRAY['burnout', 'agotamiento', 'fatiga', 'laboral'])
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Garantiza que solo el psicólogo que creó la HC puede accederla
-- ============================================

-- Habilitar RLS en clinical_records
ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;

-- Política: Solo el psicólogo que creó el registro puede verlo y modificarlo
DROP POLICY IF EXISTS "Psychologists access own clinical records" ON clinical_records;
CREATE POLICY "Psychologists access own clinical records"
  ON clinical_records
  FOR ALL
  USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE user_id = auth.uid()
    )
  );

-- Habilitar RLS en session_notes
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- Política: Solo el psicólogo que creó la nota puede verla y modificarla
DROP POLICY IF EXISTS "Psychologists access own session notes" ON session_notes;
CREATE POLICY "Psychologists access own session notes"
  ON session_notes
  FOR ALL
  USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE user_id = auth.uid()
    )
  );

-- Habilitar RLS en cie10_codes (solo lectura para todos los psicólogos autenticados)
ALTER TABLE cie10_codes ENABLE ROW LEVEL SECURITY;

-- Política: Todos los psicólogos autenticados pueden leer códigos CIE-10
DROP POLICY IF EXISTS "Psychologists can read CIE-10 codes" ON cie10_codes;
CREATE POLICY "Psychologists can read CIE-10 codes"
  ON cie10_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM psychologists WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCIÓN AUXILIAR: Actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para clinical_records
DROP TRIGGER IF EXISTS update_clinical_records_updated_at ON clinical_records;
CREATE TRIGGER update_clinical_records_updated_at
  BEFORE UPDATE ON clinical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para session_notes
DROP TRIGGER IF EXISTS update_session_notes_updated_at ON session_notes;
CREATE TRIGGER update_session_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICACIÓN: Queries de prueba
-- ============================================

-- Verificar que las tablas se crearon correctamente
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('clinical_records', 'session_notes', 'cie10_codes');

-- Verificar códigos CIE-10 insertados
-- SELECT COUNT(*) as total_codes,
--        COUNT(*) FILTER (WHERE commonly_used = TRUE) as commonly_used_codes
-- FROM cie10_codes;

-- Buscar códigos CIE-10 por palabra clave (ejemplo)
-- SELECT code, description, category
-- FROM cie10_codes
-- WHERE 'ansiedad' = ANY(keywords)
-- ORDER BY commonly_used DESC, code;

-- ============================================
-- FIN DEL SCRIPT - SPRINT 1 COMPLETADO
-- ============================================

-- IMPORTANTE:
-- 1. Ejecutar este script completo en Supabase SQL Editor
-- 2. Verificar que no hay errores
-- 3. Confirmar que se crearon 40 códigos CIE-10
-- 4. Las políticas RLS garantizan privacidad de datos
