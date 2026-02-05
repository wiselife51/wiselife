import React, { useState, useEffect } from 'react';
import Typography from '../Typography/Typography';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  const gradientId = "brand-gradient";
  const SvgGradient = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4dd0e1' }} />
          <stop offset="35%" style={{ stopColor: '#42a5f5' }} />
          <stop offset="70%" style={{ stopColor: '#5c6bc0' }} />
          <stop offset="100%" style={{ stopColor: '#7e57c2' }} />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <SvgGradient />
      <div className="header__logo">
        <Typography as="a" href="#" variant="body1" color="primary" className="logo">
          <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span className="logo-text">Vida Sabia</span>
        </Typography>
      </div>

      <nav className="header__nav">
        <ul className="navList">
          <li className="navItem"><Typography as="a" href="#servicios" variant="body2" color="primary" className="navLink">Servicios</Typography></li>
          <li className="navItem"><Typography as="a" href="#proceso" variant="body2" color="primary" className="navLink">Proceso</Typography></li>
          <li className="navItem"><Typography as="a" href="#precios" variant="body2" color="primary" className="navLink">Precios</Typography></li>
          <li className="navItem"><Typography as="a" href="#testimonios" variant="body2" color="primary" className="navLink">Testimonios</Typography></li>
          <li className="navItem"><Typography as="a" href="#especialistas" variant="body2" color="primary" className="navLink">Especialistas</Typography></li>
        </ul>
      </nav>

      <div className="header__actions">
        <button className="header-btn-secondary">Iniciar Sesión</button>
        <button className="header-btn-primary">Agendar Cita</button>
      </div>

      <button
        className={`hamburger ${isMenuOpen ? 'hamburger--active' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-expanded={isMenuOpen}
        aria-label="Toggle menu"
      >
        <div className="hamburger__line" />
        <div className="hamburger__line" />
        <div className="hamburger__line" />
      </button>

      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}>
        <video autoPlay loop muted playsInline className="mobile-menu__background-video">
          <source src="/assets/VideoFondo.mp4" type="video/mp4" />
        </video>
        
        <nav className="mobile-menu__nav">
          <ul className="mobile-navList">
            <li className="mobile-navItem">
              <a href="#servicios" className="mobile-navLink" onClick={handleLinkClick}>
                <div className="mobile-navLink-content">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  <span>Servicios</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#proceso" className="mobile-navLink" onClick={handleLinkClick}>
                <div className="mobile-navLink-content">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Proceso</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#precios" className="mobile-navLink" onClick={handleLinkClick}>
                <div className="mobile-navLink-content">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <span>Precios</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#testimonios" className="mobile-navLink" onClick={handleLinkClick}>
                <div className="mobile-navLink-content">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Testimonios</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#especialistas" className="mobile-navLink" onClick={handleLinkClick}>
                <div className="mobile-navLink-content">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>Especialistas</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </li>
          </ul>
        </nav>
        <div className="mobile-menu__actions">
          <button className="mobile-btn-secondary" onClick={handleLinkClick}>Iniciar Sesión</button>
          <button className="mobile-btn-primary" onClick={handleLinkClick}>Agendar Cita</button>
        </div>
      </div>
      {isMenuOpen && <div className="mobile-menu__overlay" onClick={() => setIsMenuOpen(false)} />}
    </header>
  );
};

export default Header;