import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';

interface CommissionRow {
  id: string;
  appointment_date: string;
  payment_amount: number | null;
  commission_amount: number | null;
  commission_status: 'reportada' | 'verificada';
  commission_reference: string | null;
  commission_proof_path: string | null;
  commission_review_note: string | null;
  psychologist_name: string | null;
  patient_name: string | null;
}

const formatCurrency = (value: number | null) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value || 0));

const formatDate = (iso: string) => iso.split('-').reverse().join('/');

const CommissionReviews: React.FC = () => {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc('admin_list_commission_reviews');
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setRows((data as CommissionRow[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openProof = async (path: string) => {
    setError('');
    const { data, error: urlError } = await supabase.storage.from('commission-proofs').createSignedUrl(path, 300);
    if (urlError || !data?.signedUrl) {
      setError('No se pudo cargar la foto del comprobante.');
      return;
    }
    setProofUrl(data.signedUrl);
  };

  const review = async (id: string, approve: boolean) => {
    if (!approve && !rejectNote.trim()) {
      setError('Indica el motivo del rechazo. El psicólogo lo va a leer.');
      return;
    }
    setReviewingId(id);
    setError('');
    const { error: rpcError } = await supabase.rpc('admin_review_commission', {
      p_appointment_id: id,
      p_approve: approve,
      p_note: approve ? null : rejectNote.trim(),
    });
    setReviewingId(null);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setRejectingId(null);
    setRejectNote('');
    load();
  };

  if (loading) return <p className="admin__empty">Cargando...</p>;

  return (
    <>
      {error && <p className="admin-modal__error" role="alert">{error}</p>}
      {rows.length === 0 ? (
        <p className="admin__empty">No hay comisiones enviadas a verificación.</p>
      ) : (
        <div className="admin__list">
          {rows.map((row) => (
            <article key={row.id} className="admin-card admin-card--static">
              <div className="admin-card__main">
                <p className="admin-card__name">{row.psychologist_name || 'Psicólogo'}</p>
                <p className="admin-card__meta">
                  Paciente: {row.patient_name || '—'} · Sesión {formatDate(row.appointment_date)}
                </p>
                <p className="admin-card__meta">
                  Comisión {formatCurrency(row.commission_amount)} sobre {formatCurrency(row.payment_amount)}
                  {row.commission_reference ? ` · Ref. ${row.commission_reference}` : ''}
                </p>

                {row.commission_status === 'reportada' && (
                  <div className="admin-commission__actions">
                    {row.commission_proof_path && (
                      <button type="button" className="admin-btn" onClick={() => openProof(row.commission_proof_path as string)}>
                        Ver comprobante
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn--approve"
                      disabled={reviewingId === row.id}
                      onClick={() => review(row.id, true)}
                    >
                      Verificar
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--reject"
                      disabled={reviewingId === row.id}
                      onClick={() => {
                        setRejectingId(rejectingId === row.id ? null : row.id);
                        setRejectNote('');
                        setError('');
                      }}
                    >
                      Rechazar
                    </button>
                  </div>
                )}

                {rejectingId === row.id && (
                  <div className="admin-commission__reject">
                    <label htmlFor={`reject-${row.id}`}>Motivo del rechazo</label>
                    <textarea
                      id={`reject-${row.id}`}
                      rows={2}
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Ej: la foto no es legible o el valor no coincide"
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn--reject"
                      disabled={reviewingId === row.id}
                      onClick={() => review(row.id, false)}
                    >
                      {reviewingId === row.id ? 'Guardando...' : 'Confirmar rechazo'}
                    </button>
                  </div>
                )}
              </div>
              <span className={`admin-badge admin-badge--${row.commission_status === 'verificada' ? 'approved' : 'pending'}`}>
                {row.commission_status === 'verificada' ? 'Verificada' : 'En verificación'}
              </span>
            </article>
          ))}
        </div>
      )}

      {proofUrl &&
        createPortal(
          <div className="admin-proof-overlay" onClick={() => setProofUrl(null)}>
            <div className="admin-proof-dialog" role="dialog" aria-modal="true" aria-label="Comprobante de comisión" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="admin-proof-close" onClick={() => setProofUrl(null)} aria-label="Cerrar comprobante">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <img src={proofUrl} alt="Comprobante de la comisión enviado por el psicólogo" />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default CommissionReviews;
