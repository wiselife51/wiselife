import './Hero.css';
import Typography from '../../Typography/Typography';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          
          <Typography 
            as="h1" 
            variant="heroTitle" 
            color="primary"
            className="hero-title"
          >
            Comienza el camino hacia tu{' '}
            <span className="hero-title-gradient">bienestar emocional</span>
          </Typography>
          
          <Typography 
            as="p" 
            variant="heroSubtitle" 
            color="primary"
            className="hero-description"
          >
            Terapia psicológica personalizada con enfoque en Terapia Cognitivo Conductual. 
            Te ofrezco un espacio seguro, confidencial y profesional para trabajar en tu 
            salud mental y crecimiento personal.
          </Typography>

          <div className="hero-features-inline">
            <div className="feature-item">
              <svg className="feature-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Presencial en Bogotá</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span>Sesiones online</span>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Enfoque basado en evidencia</span>
            </div>
          </div>
          
          <div className="hero-buttons">
            <button className="hero-btn-primary">
              <span>Agenda tu Cita</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className="hero-btn-secondary">
              <span>Conocer más</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;