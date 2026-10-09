import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toDateStr } from '../../lib/date';
import {
  PLATFORM_NAME,
  PLATFORM_NEQUI_PHONE,
  formatNequiPhone,
  splitPayment,
  toLocalNequiNumber,
} from '../../config/payments';
import {
  MODALITY_LABELS,
  PATIENT_TYPE_LABELS,
  formatDateLong,
  formatTime,
} from './booking';
import type { AvailabilitySlot, BookingDay, BookingPsychologist } from './booking';

type Step = 'confirm' | 'payment' | 'success';

interface TransferCardProps {
  step: number;
  title: string;
  caption: string;
  amount: number;
  phone: string;
  refValue: string;
  onRefChange: (value: string) => void;
  inputId: string;
}

const TransferCard: React.FC<TransferCardProps> = ({ step, title, caption, amount, phone, refValue, onRefChange, inputId }) => {
  const [copied, setCopied] = useState<'phone' | 'amount' | null>(null);

  const copy = async (kind: 'phone' | 'amount', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="sp-transfer-card">
      <div className="sp-transfer-head">
        <span className="sp-step-num">{step}</span>
        <div className="sp-transfer-title">
          <strong>{title}</strong>
          <span>{caption}</span>
        </div>
      </div>
      <div className="sp-transfer-rows">
        <div className="sp-transfer-row">
          <div>
            <span className="sp-transfer-label">Monto exacto</span>
            <span className="sp-transfer-value">${amount.toLocaleString('es-CO')} COP</span>
          </div>
          <button type="button" className="sp-copy-btn" onClick={() => copy('amount', String(amount))}>
            {copied === 'amount' ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <div className="sp-transfer-row">
          <div>
            <span className="sp-transfer-label">Número Nequi</span>
            <span className="sp-transfer-value">{phone ? formatNequiPhone(phone) : 'No configurado'}</span>
          </div>
          {phone && (
            <button type="button" className="sp-copy-btn" onClick={() => copy('phone', toLocalNequiNumber(phone))}>
              {copied === 'phone' ? 'Copiado' : 'Copiar'}
            </button>
          )}
        </div>
      </div>
      <div className="sp-payment-ref">
        <label htmlFor={inputId}>Referencia del comprobante</label>
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          placeholder="Ej: M1234567"
          value={refValue}
          onChange={(e) => onRefChange(e.target.value)}
        />
      </div>
    </div>
  );
};

interface BookingModalProps {
  patientId: string;
  psy: BookingPsychologist;
  day: BookingDay;
  slot: AvailabilitySlot;
  modality: string;
  patientType: string;
  amount: number;
  onClose: () => void;
  onSlotTaken: () => void;
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BookingModal: React.FC<BookingModalProps> = ({ patientId, psy, day, slot, modality, patientType, amount, onClose, onSlotTaken }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('confirm');
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [commissionRef, setCommissionRef] = useState('');
  const [error, setError] = useState('');
  const { platformFee, psychologistAmount } = splitPayment(amount);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    const { data, error: insertError } = await supabase
      .from('appointments')
      .insert({
        psychologist_id: psy.id,
        patient_id: patientId,
        appointment_date: toDateStr(day.date),
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: 'pendiente_pago',
        payment_amount: amount,
        payment_status: 'pendiente',
        modality: modality || null,
        patient_type: patientType || null,
      })
      .select('id')
      .single();
    setLoading(false);

    if (insertError) {
      if (insertError.code === '23505' && insertError.message.includes('appointments_psychologist_slot_active_uidx')) {
        alert('Este horario acaba de ser reservado por otro paciente. Selecciona otro horario.');
        onSlotTaken();
        return;
      }
      setError('No se pudo crear la cita. Intenta de nuevo.');
      return;
    }
    setAppointmentId(data.id);
    setStep('payment');
  };

  const handleOpenNequi = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      window.open('https://www.nequi.com.co/', '_blank', 'noopener,noreferrer');
      return;
    }
    const fallback = window.setTimeout(() => {
      window.open('https://www.nequi.com.co/', '_blank', 'noopener,noreferrer');
    }, 1800);
    const cancelFallback = () => window.clearTimeout(fallback);
    window.addEventListener('blur', cancelFallback, { once: true });
    document.addEventListener('visibilitychange', cancelFallback, { once: true });
    window.location.href = 'nequi://';
  };

  const handleConfirmPayment = async () => {
    if (!appointmentId) return;
    const psychologistRef = paymentRef.trim();
    const platformRef = commissionRef.trim();
    if (!psychologistRef || !platformRef) {
      setError('Ingresa la referencia de las dos transferencias.');
      return;
    }
    if (psychologistRef === platformRef) {
      setError('Cada transferencia tiene su propia referencia. Revisa los comprobantes.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: rpcError } = await supabase.rpc('register_nequi_payment', {
      p_appointment_id: appointmentId,
      p_psychologist_reference: psychologistRef,
      p_commission_reference: platformRef,
    });
    setLoading(false);
    if (rpcError) {
      setError(rpcError.message || 'No se pudo registrar el pago. Intenta de nuevo.');
      return;
    }
    setStep('success');
  };

  return (
    <div className="sp-modal-overlay" onClick={step === 'success' ? onClose : undefined}>
      <div className="sp-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {step === 'confirm' && (
          <>
            <div className="sp-modal-header">
              <h3>Confirmar cita</h3>
              <button className="sp-modal-close" onClick={onClose} type="button" aria-label="Cerrar"><CloseIcon /></button>
            </div>
            <div className="sp-modal-body">
              <div className="sp-booking-summary">
                <div className="sp-booking-psy">
                  <div className="sp-booking-avatar">
                    {psy.avatar_url ? (
                      <img src={psy.avatar_url} alt={psy.full_name} crossOrigin="anonymous" />
                    ) : (
                      <span>{psy.full_name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <strong>{psy.full_name}</strong>
                    <p>Lic. {psy.license_number}</p>
                  </div>
                </div>
                <div className="sp-booking-details">
                  <div className="sp-booking-detail"><span>{formatDateLong(day.date)}</span></div>
                  <div className="sp-booking-detail"><span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span></div>
                  <div className="sp-booking-detail"><span>Duracion: {psy.session_duration} minutos</span></div>
                  <div className="sp-booking-detail">
                    <span>{MODALITY_LABELS[modality] || modality} · {PATIENT_TYPE_LABELS[patientType] || patientType}</span>
                  </div>
                </div>
                <div className="sp-booking-price">
                  <span>Total a pagar</span>
                  <strong>${amount.toLocaleString('es-CO')} COP</strong>
                </div>
              </div>
              {error && <p className="sp-payment-error" role="alert">{error}</p>}
            </div>
            <div className="sp-modal-footer">
              <button className="sp-btn-secondary" onClick={onClose} type="button">Cancelar</button>
              <button className="sp-btn-primary" onClick={handleCreate} disabled={loading} type="button">
                {loading ? 'Creando cita...' : 'Continuar al pago'}
              </button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="sp-modal-header">
              <h3>Pago con Nequi</h3>
              <button className="sp-modal-close" onClick={onClose} type="button" aria-label="Cerrar"><CloseIcon /></button>
            </div>
            <div className="sp-modal-body">
              <div className="sp-payment-section">
                <div className="sp-nequi-logo"><div className="sp-nequi-badge">Nequi</div></div>
                <p className="sp-payment-amount">${amount.toLocaleString('es-CO')} COP</p>
                <p className="sp-payment-subtitle">Total de la sesión, dividido en dos transferencias Nequi</p>
                <button className="sp-nequi-btn" onClick={handleOpenNequi} type="button">Abrir Nequi</button>
                <div className="sp-transfer-list">
                  <TransferCard
                    step={1}
                    title={`Para ${psy.full_name}`}
                    caption="95% de la sesión"
                    amount={psychologistAmount}
                    phone={psy.phone || ''}
                    refValue={paymentRef}
                    onRefChange={setPaymentRef}
                    inputId="ag-payment-ref"
                  />
                  <TransferCard
                    step={2}
                    title={`Para ${PLATFORM_NAME}`}
                    caption="5% de comisión de la plataforma"
                    amount={platformFee}
                    phone={PLATFORM_NEQUI_PHONE}
                    refValue={commissionRef}
                    onRefChange={setCommissionRef}
                    inputId="ag-commission-ref"
                  />
                </div>
                <p className="sp-payment-ref-help">
                  Haz las dos transferencias desde tu app Nequi con el monto exacto y pega aquí la referencia de cada comprobante.
                </p>
                {error && <p className="sp-payment-error" role="alert">{error}</p>}
              </div>
            </div>
            <div className="sp-modal-footer">
              <button className="sp-btn-secondary" onClick={onClose} type="button">Cancelar</button>
              <button
                className="sp-btn-primary"
                onClick={handleConfirmPayment}
                disabled={loading || !paymentRef.trim() || !commissionRef.trim()}
                type="button"
              >
                {loading ? 'Confirmando...' : 'Confirmar pago'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="sp-modal-body sp-success-body">
              <div className="sp-success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>Cita agendada con exito</h3>
              <p>Tu cita con <strong>{psy.full_name}</strong> quedó registrada.</p>
              <div className="sp-success-details">
                <span>{formatDateLong(day.date)}</span>
                <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
              </div>
              <p className="sp-success-note">El psicologo verificara tu pago y recibiras una confirmacion. Podras comunicarte por WhatsApp desde la seccion "Mis citas".</p>
            </div>
            <div className="sp-modal-footer">
              <button className="sp-btn-primary sp-btn-full" onClick={() => navigate('/mis-citas')} type="button">Ver mis citas</button>
              <button className="sp-btn-secondary sp-btn-full" onClick={onClose} type="button">Agendar otra sesión</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
