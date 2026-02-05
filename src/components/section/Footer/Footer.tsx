import Typography from '../../Typography/Typography';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        <div className="footer-main-content">

          {/* Columna de Enlaces Rápidos (Izquierda) */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span>Enlaces Rápidos</span>
            </h4>
            <ul className="footer-links">
              <li><a href="#servicios" className="footer-link"><span>Servicios</span></a></li>
              <li><a href="#proceso" className="footer-link"><span>Proceso</span></a></li>
              <li><a href="#precios" className="footer-link"><span>Precios</span></a></li>
              <li><a href="#testimonios" className="footer-link"><span>Testimonios</span></a></li>
              <li><a href="#contacto" className="footer-link"><span>Contacto</span></a></li>
            </ul>
          </div>

          {/* Columna Central de la Marca */}
          <div className="footer-brand-section">
            <Typography as="h3" variant="heroTitle" color="primary" className="footer-brand">
              Psicologa Clinica <span className="footer-brand-gradient">Stephanie Rincon</span>
            </Typography>
            <Typography as="p" variant="body1" color="secondary" className="footer-tagline">
              Terapia psicológica personalizada con enfoque en TCC. Tu bienestar emocional es mi prioridad.
            </Typography>
            <div className="footer-contact-info">
              <div className="contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Bogotá, Colombia</span>
              </div>
              <div className="contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>contacto@psicologo.com</span>
              </div>
              <div className="contact-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>+57 300 123 4567</span>
              </div>
            </div>
          </div>

          {/* Columna de Servicios (Derecha) */}
          <div className="footer-column">
            <h4 className="footer-column-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              <span>Servicios</span>
            </h4>
            <ul className="footer-links">
              <li><a href="#terapia-individual" className="footer-link"><span>Terapia Individual</span></a></li>
              <li><a href="#terapia-pareja" className="footer-link"><span>Terapia de Pareja</span></a></li>
              <li><a href="#evaluacion" className="footer-link"><span>Evaluación Psicológica</span></a></li>
              <li><a href="#tcc" className="footer-link"><span>TCC</span></a></li>
              <li><a href="#orientacion" className="footer-link"><span>Orientación Vocacional</span></a></li>
            </ul>
          </div>

        </div>

      </div>

      {/* Footer Bottom (ahora es hijo directo de footer-section) */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <Typography as="p" variant="body1" color="secondary" className="footer-copyright">
            © {new Date().getFullYear()} Vida Sabia. Todos los derechos reservados.
          </Typography>
          <div className="footer-legal">
            <a href="#privacidad" className="footer-legal-link">Política de Privacidad</a>
            <span className="separator">•</span>
            <a href="#terminos" className="footer-legal-link">Términos y Condiciones</a>
            <span className="separator">•</span>
            <a href="#cookies" className="footer-legal-link">Cookies</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
