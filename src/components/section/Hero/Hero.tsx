import './Hero.css';

interface Feature {
  icon: React.ReactNode;
  text: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    text: 'Presencial en Bogotá',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    text: 'Sesiones online',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    text: 'Enfoque basado en evidencia',
  },
];

const Hero = () => {
  return (
    <section className="hero" aria-label="Presentación">
      {/* Background Elements */}
      <div className="hero__bg">
        <div className="hero__bg-gradient" />
        <div className="hero__bg-glow hero__bg-glow--1" />
        <div className="hero__bg-glow hero__bg-glow--2" />
      </div>

      <div className="hero__container">
        {/* Badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          <span>Psicología clínica profesional</span>
        </div>

        {/* Title */}
        <h1 className="hero__title">
          <span className="hero__title-line">Comienza el camino hacia tu</span>
          <span className="hero__title-highlight">bienestar emocional</span>
        </h1>

        {/* Description */}
        <p className="hero__description">
          Te ofrezco un espacio seguro, confidencial y profesional para trabajar en tu
          salud mental y crecimiento personal.
        </p>

        {/* Features */}
        <div className="hero__features">
          {features.map((feature, index) => (
            <div
              key={index}
              className="hero__feature"
              style={{ '--delay': `${index * 0.1 + 0.4}s` } as React.CSSProperties}
            >
              <span className="hero__feature-icon">{feature.icon}</span>
              <span className="hero__feature-text">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hero__actions">
          <button className="hero__btn hero__btn--primary" type="button">
            <span>Agenda tu Cita</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="hero__btn hero__btn--secondary" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
            </svg>
            <span>Ver video</span>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="hero__trust">
          <div className="hero__trust-avatars">
            <div className="hero__trust-avatar" style={{ '--i': 0 } as React.CSSProperties}>
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
            </div>
            <div className="hero__trust-avatar" style={{ '--i': 1 } as React.CSSProperties}>
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
            </div>
            <div className="hero__trust-avatar" style={{ '--i': 2 } as React.CSSProperties}>
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="" />
            </div>
            <div className="hero__trust-avatar hero__trust-avatar--count" style={{ '--i': 3 } as React.CSSProperties}>
              <span>+50</span>
            </div>
          </div>
          <div className="hero__trust-info">
            <div className="hero__trust-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="hero__trust-text">Pacientes satisfechos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
