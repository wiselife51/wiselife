import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toDateStr } from '../../lib/date';
import { formatNequiPhone, toLocalNequiNumber } from '../../config/payments';
import {
  MODALITY_LABELS,
  PATIENT_TYPE_LABELS,
  formatDateLong,
  formatTime,
} from './booking';
import type { AvailabilitySlot, BookingDay, BookingPsychologist } from './booking';

type Step = 'confirm' | 'payment' | 'success';

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CopyRow: React.FC<{ label: string; value: string; copyValue: string }> = ({ label, value, copyValue }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="sp-pay-row">
      <div className="sp-pay-row-text">
        <span className="sp-pay-label">{label}</span>
        <span className="sp-pay-value">{value}</span>
      </div>
      <button type="button" className="sp-copy-btn" onClick={copy}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!proofFile) {
      setProofPreview(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
      setError('El comprobante debe ser una imagen JPG, PNG o WEBP.');
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      setError('La imagen supera los 5 MB. Sube una más liviana.');
      return;
    }
    setError('');
    setProofFile(file);
  };

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

  const handleSubmitProof = async () => {
    if (!appointmentId || !proofFile) return;
    setError('');
    setLoading(true);
    const extension = proofFile.type === 'image/png' ? 'png' : proofFile.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${patientId}/${appointmentId}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(path, proofFile, { contentType: proofFile.type, upsert: false });
    if (uploadError) {
      setLoading(false);
      setError('No se pudo subir el comprobante. Intenta de nuevo.');
      return;
    }
    const { error: rpcError } = await supabase.rpc('submit_payment_proof', {
      p_appointment_id: appointmentId,
      p_path: path,
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
              <h3>Pago por Nequi</h3>
              <button className="sp-modal-close" onClick={onClose} type="button" aria-label="Cerrar"><CloseIcon /></button>
            </div>
            <div className="sp-modal-body sp-pay-body">
              <div className="sp-pay-hero">
                <span className="sp-pay-hero-label">Total a transferir</span>
                <strong>${amount.toLocaleString('es-CO')} COP</strong>
                <span className="sp-pay-hero-sub">Directo a {psy.full_name}</span>
              </div>

              <section className="sp-pay-card" aria-labelledby="pay-step-1">
                <div className="sp-pay-card-head">
                  <span className="sp-step-num">1</span>
                  <h4 id="pay-step-1">Haz la transferencia</h4>
                </div>
                {psy.phone ? (
                  <>
                    <CopyRow label="Número Nequi" value={formatNequiPhone(psy.phone)} copyValue={toLocalNequiNumber(psy.phone)} />
                    <CopyRow label="Monto exacto" value={`$${amount.toLocaleString('es-CO')} COP`} copyValue={String(amount)} />
                    <button className="sp-btn-secondary sp-btn-full" onClick={handleOpenNequi} type="button">Abrir Nequi</button>
                  </>
                ) : (
                  <p className="sp-pay-empty">Este especialista aún no configuró su número Nequi. Escríbele por WhatsApp desde "Mis citas".</p>
                )}
              </section>

              <section className="sp-pay-card" aria-labelledby="pay-step-2">
                <div className="sp-pay-card-head">
                  <span className="sp-step-num">2</span>
                  <h4 id="pay-step-2">Sube tu comprobante</h4>
                </div>
                <input
                  ref={fileInputRef}
                  className="sp-pay-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  aria-label="Comprobante de pago"
                />
                {proofPreview ? (
                  <div className="sp-pay-preview">
                    <img src={proofPreview} alt="Vista previa del comprobante" />
                    <button type="button" className="sp-copy-btn" onClick={() => fileInputRef.current?.click()}>Cambiar imagen</button>
                  </div>
                ) : (
                  <button type="button" className="sp-pay-drop" onClick={() => fileInputRef.current?.click()}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Toca para adjuntar la captura</span>
                    <small>JPG, PNG o WEBP · máx. 5 MB</small>
                  </button>
                )}
              </section>

              <p className="sp-payment-ref-help">
                El psicólogo revisará tu comprobante y marcará la cita como pagada para continuar.
              </p>
              {error && <p className="sp-payment-error" role="alert">{error}</p>}
            </div>
            <div className="sp-modal-footer">
              <button className="sp-btn-secondary" onClick={onClose} type="button">Cancelar</button>
              <button
                className="sp-btn-primary"
                onClick={handleSubmitProof}
                disabled={loading || !proofFile || !psy.phone}
                type="button"
              >
                {loading ? 'Enviando...' : 'Enviar comprobante'}
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
              <p className="sp-success-note">Tu comprobante fue enviado. El psicólogo verificará el pago y marcará tu cita como pagada. Podrás escribirle por WhatsApp desde "Mis citas".</p>
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
