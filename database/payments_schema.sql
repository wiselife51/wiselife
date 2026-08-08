-- ============================================
-- SISTEMA DE PAGOS CON NEQUI
-- Tabla para registrar transacciones
-- ============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relaciones
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id),
  psychologist_id UUID NOT NULL REFERENCES psychologists(id),

  -- Información del pago
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'COP',

  -- Información de Nequi
  nequi_transaction_id VARCHAR(255), -- ID de transacción de Nequi
  nequi_push_token VARCHAR(255), -- Token del push payment
  nequi_phone_number VARCHAR(20), -- Número del psicólogo que recibe el pago

  -- Estados del pago
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  payment_method VARCHAR(50) DEFAULT 'nequi',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Información adicional
  error_message TEXT,
  webhook_data JSONB,

  -- Notificaciones enviadas
  patient_email_sent BOOLEAN DEFAULT FALSE,
  psychologist_email_sent BOOLEAN DEFAULT FALSE,

  UNIQUE(appointment_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_transactions_appointment ON payment_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_patient ON payment_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_psychologist ON payment_transactions(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_nequi_id ON payment_transactions(nequi_transaction_id);

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Pacientes pueden ver sus propias transacciones
CREATE POLICY "Patients can view own transactions"
  ON payment_transactions
  FOR SELECT
  USING (patient_id = auth.uid());

-- Policy: Psicólogos pueden ver transacciones de sus citas
CREATE POLICY "Psychologists can view own transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    psychologist_id IN (
      SELECT id FROM psychologists WHERE user_id = auth.uid()
    )
  );

-- Policy: Sistema puede insertar transacciones (service_role)
CREATE POLICY "Service role can insert transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Sistema puede actualizar transacciones (service_role)
CREATE POLICY "Service role can update transactions"
  ON payment_transactions
  FOR UPDATE
  USING (true);

COMMENT ON TABLE payment_transactions IS 'Registro de transacciones de pago con Nequi';
COMMENT ON COLUMN payment_transactions.status IS 'pending: esperando pago, processing: procesando, completed: completado, failed: falló, cancelled: cancelado';
