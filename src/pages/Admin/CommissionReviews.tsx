import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from './adminData';
import { ErrorNote } from './AdminUi';

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

const CommissionReviews: React.FC<{ onReviewed?: () => void }> = ({ onReviewed }) => {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc('admin_list_commission_reviews');
    if (rpcError) setError(rpcError.message);
    else setRows((data as CommissionRow[]) || []);
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
    onReviewed?.();
  };

  if (loading) return <p className="adm-muted">Cargando...</p>;

  return (
    <>
      <ErrorNote message={error} />
      {rows.length === 0 ? (
        <div className="psy-dash-empty">
          <p>No hay comisiones enviadas a verificación.</p>
        </div>
      ) : (
        <div className="psy-patients-scroll">
          <div className="adm-list">
            {rows.map((row) => (
              <article key={row.id} className="adm-block">
                <div className="adm-block-top">
                  <span className="adm-card-text">
                    <strong>{row.psychologist_name || 'Psicólogo'}</strong>
                    <small>
                      Paciente: {row.patient_name || '—'} · Sesión {formatDate(row.appointment_date)}
                    </small>
                    <small>
                      Comisión {formatCurrency(row.commission_amount)} sobre {formatCurrency(row.payment_amount)}
                      {row.commission_reference ? ` · Ref. ${row.commission_reference}` : ''}
                    </small>
                  </span>
                  <span
                    className={`psy-dash-mini-status psy-dash-mini-status--${row.commission_status === 'verificada' ? 'confirmed' : 'verify'}`}
                  >
                    {row.commission_status === 'verificada' ? 'Verificada' : 'En verificación'}
                  </span>
                </div>

                {row.commission_status === 'reportada' && (
                  <div className="adm-actions adm-actions--wrap">
                    {row.commission_proof_path && (
                      <button type="button" className="psy-dash-btn-outline" onClick={() => openProof(row.commission_proof_path as string)}>
                        Ver comprobante
                      </button>
                    )}
                    <button type="button" className="psy-dash-btn-primary" disabled={reviewingId === row.id} onClick={() => review(row.id, true)}>
                      Verificar
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn--danger"
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
                  <div className="adm-reject">
                    <label className="adm-label" htmlFor={`reject-${row.id}`}>Motivo del rechazo</label>
                    <textarea
                      id={`reject-${row.id}`}
                      className="adm-textarea"
                      rows={2}
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Ej: la foto no es legible o el valor no coincide"
                    />
                    <button type="button" className="adm-btn adm-btn--danger" disabled={reviewingId === row.id} onClick={() => review(row.id, false)}>
                      {reviewingId === row.id ? 'Guardando...' : 'Confirmar rechazo'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {proofUrl &&
        createPortal(
          <div className="psy-dash-modal-backdrop" onClick={() => setProofUrl(null)}>
            <div className="adm-proof" role="dialog" aria-modal="true" aria-label="Comprobante de comisión" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="adm-icon-btn adm-proof-close" onClick={() => setProofUrl(null)} aria-label="Cerrar comprobante">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
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
