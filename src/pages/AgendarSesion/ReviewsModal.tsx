import React, { useEffect, useState } from 'react';
import StarRating from '../../components/StarRating/StarRating';
import { fetchReviews } from '../../lib/reviews';
import type { PsychologistReview, RatingSummary } from '../../lib/reviews';
import type { BookingPsychologist } from './booking';

interface ReviewsModalProps {
  psy: BookingPsychologist;
  summary?: RatingSummary;
  onClose: () => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

const ReviewsModal: React.FC<ReviewsModalProps> = ({ psy, summary, onClose }) => {
  const [reviews, setReviews] = useState<PsychologistReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchReviews(psy.id).then((list) => {
      if (!active) return;
      setReviews(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [psy.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="ag-modal-backdrop" onClick={onClose}>
      <div
        className="ag-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ag-reviews-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ag-modal-top">
          <div>
            <h2 id="ag-reviews-title">Opiniones de pacientes</h2>
            <p>{psy.full_name}</p>
          </div>
          <button type="button" className="ag-modal-close" onClick={onClose} aria-label="Cerrar opiniones">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ag-modal-summary">
          <strong>{summary ? summary.rating_avg.toFixed(1) : '0.0'}</strong>
          <div>
            <StarRating value={summary?.rating_avg || 0} size={18} />
            <span>
              {summary
                ? `${summary.rating_count} ${summary.rating_count === 1 ? 'opinión' : 'opiniones'}`
                : 'Aún sin opiniones'}
            </span>
          </div>
        </div>

        <div className="ag-modal-body">
          {loading ? (
            <div className="ag-state"><div className="dash-loading-spinner" /></div>
          ) : reviews.length === 0 ? (
            <div className="ag-state">
              <p>Todavía no hay opiniones. Serán visibles cuando los pacientes califiquen sus sesiones atendidas.</p>
            </div>
          ) : (
            <ul className="ag-reviews">
              {reviews.map((r) => (
                <li key={r.id} className="ag-review">
                  <div className="ag-review-head">
                    <strong>{r.patient_display_name}</strong>
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                  <StarRating value={r.rating} size={14} />
                  {r.comment && <p>{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
