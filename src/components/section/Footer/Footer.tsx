import './Footer.css';

const Footer = () => {
  return (
    <section id="contacto" className="footer-section">
      <div className="footer-container">
        {/* Header con badge solo en moviles */}
        <div className="footer-header">
          <div className="footer-badge footer-badge--mobile">
            <span className="footer-badge-dot" />
            <span>Contacto</span>
          </div>
          <h2 className="footer-title">
            Comienza tu <span className="footer-title-gradient">bienestar</span>
          </h2>
          <p className="footer-description">
            Estoy aqui para ayudarte en tu camino hacia una vida mas plena.
          </p>
        </div>

        {/* Cards de contacto */}
        <div className="footer-cards">
          <div className="footer-card">
            <div className="footer-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="footer-card-info">
              <h3 className="footer-card-title">Ubicacion</h3>
              <p className="footer-card-text">Bogota, Colombia</p>
            </div>
          </div>

          <div className="footer-card">
            <div className="footer-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="footer-card-info">
              <h3 className="footer-card-title">Email</h3>
              <p className="footer-card-text">contacto@vidasabia.com</p>
            </div>
          </div>

          <div className="footer-card">
            <div className="footer-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className="footer-card-info">
              <h3 className="footer-card-title">Telefono</h3>
              <p className="footer-card-text">+57 300 123 4567</p>
            </div>
          </div>

          <div className="footer-card">
            <div className="footer-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="footer-card-info">
              <h3 className="footer-card-title">Horario</h3>
              <p className="footer-card-text">Lun - Vie: 8am - 6pm</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="footer-cta">
          <button className="footer-cta-btn" type="button">
            <span>Agendar Cita</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Vida Sabia. Todos los derechos reservados.
          </p>
          <div className="footer-legal">
            <a href="#privacidad" className="footer-legal-link">Privacidad</a>
            <span className="separator">|</span>
            <a href="#terminos" className="footer-legal-link">Terminos</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
