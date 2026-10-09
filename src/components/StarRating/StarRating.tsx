import React from 'react';
import './StarRating.css';

interface StarRatingProps {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
  label?: string;
}

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

const StarRating: React.FC<StarRatingProps> = ({ value, size = 16, onChange, label }) => {
  const stars = [1, 2, 3, 4, 5];

  if (onChange) {
    return (
      <div className="star-rating star-rating--input" role="radiogroup" aria-label={label || 'Calificación'}>
        {stars.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
            className={`star-rating-btn ${n <= value ? 'star-rating-btn--on' : ''}`}
            onClick={() => onChange(n)}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
              <path d={STAR_PATH} />
            </svg>
          </button>
        ))}
      </div>
    );
  }

  return (
    <span
      className="star-rating"
      role="img"
      aria-label={label || `${value.toFixed(1)} de 5 estrellas`}
    >
      {stars.map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className="star-rating-star" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="star-rating-base">
              <path d={STAR_PATH} />
            </svg>
            <span className="star-rating-fill" style={{ width: `${fill * 100}%` }}>
              <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
                <path d={STAR_PATH} />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
};

export default StarRating;
