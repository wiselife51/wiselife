import React, { useState, useEffect } from 'react';
import Typography from '../Typography/Typography';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al hacer clic en un enlace
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      {/* Logo */}
      <div className="header__logo">
        <Typography as="a" href="#" variant="body1" color="primary" className="logo">
          Psic. Spthefanie Rincon
        </Typography>
      </div>

      {/* Navegación Desktop */}
      <nav className="header__nav">
        <ul className="navList">
          <li className="navItem">
            <Typography as="a" href="#servicios" variant="body2" color="primary" className="navLink">
              Servicios
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#proceso" variant="body2" color="primary" className="navLink">
              Proceso
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#precios" variant="body2" color="primary" className="navLink">
              Precios
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#testimonios" variant="body2" color="primary" className="navLink">
              Testimonios
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#contacto" variant="body2" color="primary" className="navLink">
              Contacto
            </Typography>
          </li>
        </ul>
      </nav>

      {/* Acciones Desktop */}
      <div className="header__actions">
        <button className="header-btn-secondary">Iniciar Sesión</button>
        <button className="header-btn-primary">Agendar Cita</button>
      </div>

      {/* Botón Hamburguesa */}
      <button
        className={`hamburger ${isMenuOpen ? 'hamburger--active' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger__line"></span>
        <span className="hamburger__line"></span>
        <span className="hamburger__line"></span>
      </button>

      {/* Menú Mobile */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}>
        <nav className="mobile-menu__nav">
          <ul className="mobile-navList">
            <li className="mobile-navItem">
              <a href="#servicios" className="mobile-navLink" onClick={handleLinkClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>Servicios</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#proceso" className="mobile-navLink" onClick={handleLinkClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span>Proceso</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#precios" className="mobile-navLink" onClick={handleLinkClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span>Precios</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#testimonios" className="mobile-navLink" onClick={handleLinkClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Testimonios</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#contacto" className="mobile-navLink" onClick={handleLinkClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>Contacto</span>
              </a>
            </li>
          </ul>

          <div className="mobile-menu__actions">
            <button className="mobile-btn-secondary" onClick={handleLinkClick}>
              Iniciar Sesión
            </button>
            <button className="mobile-btn-primary" onClick={handleLinkClick}>
              Agendar Cita
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu__overlay" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;