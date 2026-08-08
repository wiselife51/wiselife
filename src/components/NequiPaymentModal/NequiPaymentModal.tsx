import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './NequiPaymentModal.css';

interface NequiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  amount: number;
  psychologistName: string;
  psychologistPhone: string;
  appointmentDate: string;
  onSuccess: () => void;
}

const NequiPaymentModal: React.FC<NequiPaymentModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  amount,
  psychologistName,
  psychologistPhone,
  appointmentDate,
  onSuccess,
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Perfil no encontrado');

      // Call Edge Function to create Nequi payment
      const { data, error: funcError } = await supabase.functions.invoke('create-nequi-payment', {
        body: {
          appointmentId,
          amount,
          psychologistPhone,
          patientName: profile.full_name,
          patientEmail: profile.email,
        },
      });

      if (funcError) throw funcError;
      if (!data.success) throw new Error(data.error || 'Error al crear el pago');

      // Success — la transacción ya quedó persistida por el Edge Function
      setSuccess(true);

      // Auto-close after 5 seconds and refresh
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 5000);

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="nequi-backdrop" onClick={onClose}>
      <div className="nequi-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="nequi-header">
          <div className="nequi-logo">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" fill="#FF006B"/>
              <path d="M35 50L45 60L65 40" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Pagar con Nequi</h2>
          <button onClick={onClose} className="nequi-close" aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="nequi-content">
          {!success ? (
            <>
              <div className="nequi-details">
                <div className="nequi-detail-row">
                  <span className="nequi-label">Psicólogo/a:</span>
                  <span className="nequi-value">{psychologistName}</span>
                </div>
                <div className="nequi-detail-row">
                  <span className="nequi-label">Fecha de cita:</span>
                  <span className="nequi-value">
                    {new Date(appointmentDate).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="nequi-detail-row nequi-detail-row--amount">
                  <span className="nequi-label">Monto a pagar:</span>
                  <span className="nequi-amount">${amount.toLocaleString()} COP</span>
                </div>
              </div>

              <div className="nequi-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                  <p><strong>¿Cómo funciona?</strong></p>
                  <ol>
                    <li>Haz clic en "Pagar con Nequi"</li>
                    <li>Recibirás una notificación en tu celular</li>
                    <li>Autoriza el pago desde la app de Nequi</li>
                    <li>El dinero llegará al psicólogo y tu cita quedará confirmada</li>
                  </ol>
                </div>
              </div>

              {error && (
                <div className="nequi-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={processing}
                className="nequi-pay-btn"
              >
                {processing ? (
                  <>
                    <div className="nequi-spinner" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="16 12 12 8 8 12" />
                      <line x1="12" y1="16" x2="12" y2="8" />
                    </svg>
                    Pagar ${amount.toLocaleString()} COP con Nequi
                  </>
                )}
              </button>

              <p className="nequi-secure">
                🔒 Pago seguro procesado por Nequi
              </p>
            </>
          ) : (
            <div className="nequi-success">
              <div className="nequi-success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 9 10 15 7 12" />
                </svg>
              </div>
              <h3>¡Push enviado!</h3>
              <p>
                Revisa tu celular y autoriza el pago desde la app de Nequi.
              </p>
              <p className="nequi-success-note">
                Recibirás un email de confirmación cuando se complete el pago.
              </p>
              <div className="nequi-success-animation">
                <div className="nequi-phone">
                  📱
                </div>
                <div className="nequi-waves">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NequiPaymentModal;
