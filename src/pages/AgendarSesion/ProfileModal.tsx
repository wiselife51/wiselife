import React, { useEffect } from 'react';
import StarRating from '../../components/StarRating/StarRating';
import type { RatingSummary } from '../../lib/reviews';
import type { BookingPsychologist } from './booking';

interface ProfileModalProps {
  psy: BookingPsychologist;
  summary?: RatingSummary;
  onClose: () => void;
  onSchedule: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ psy, summary, onClose, onSchedule }) => {
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

  const text = (psy.profile_text || psy.bio || '').trim();
  const paragraphs = text ? text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) : [];
  const languages = (psy.languages || []).filter(Boolean);

  return (
    <div className="ag-modal-backdrop ag-modal-backdrop--center" onClick={onClose}>
      <div
        className="ag-modal ag-profile"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ag-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ag-modal-close ag-profile-close" onClick={onClose} aria-label="Cerrar perfil">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="ag-profile-hero">
          <span className="ag-profile-photo">
            {psy.avatar_url ? (
              <img src={psy.avatar_url} alt={`Foto de ${psy.full_name}`} crossOrigin="anonymous" />
            ) : (
              <span aria-hidden="true">{psy.full_name.charAt(0).toUpperCase()}</span>
            )}
          </span>
          <h2 id="ag-profile-title">{psy.full_name}</h2>
          {(psy.specialties || []).length > 0 && (
            <div className="ag-profile-tags">
              {psy.specialties.slice(0, 3).map((s) => (
                <span key={s} className="ag-tag">{s}</span>
              ))}
            </div>
          )}
          <div className="ag-profile-rating">
            <StarRating value={summary?.rating_avg || 0} size={16} />
            <span>
              {summary ? `${summary.rating_avg.toFixed(1)} · ${summary.rating_count} opiniones` : 'Sin opiniones'}
            </span>
          </div>
        </div>

        <dl className="ag-profile-facts">
          <div>
            <dt>Experiencia</dt>
            <dd>{psy.years_experience} años</dd>
          </div>
          {psy.city && (
            <div>
              <dt>Ciudad</dt>
              <dd>{psy.city}</dd>
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <dt>Idiomas</dt>
              <dd>{languages.join(', ')}</dd>
            </div>
          )}
        </dl>

        <div className="ag-profile-body">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="ag-profile-empty">Este especialista aún no ha escrito su presentación.</p>
          )}
        </div>

        <button type="button" className="ag-psy-btn ag-profile-cta" onClick={onSchedule}>
          Agendar con {psy.full_name.split(' ')[0]}
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
