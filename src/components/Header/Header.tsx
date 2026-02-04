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
          <stop offset="100%" style={{ stopColor: '#42a5f5' }} />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <SvgGradient />
      <div className="header__logo">
        <Typography as="a" href="#" variant="body1" color="primary" className="logo">
          Psic. Spthefanie Rincon
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
        <video autoPlay loop muted className="mobile-menu__background-video">
          <source src="/assets/VideoFondo.mp4" type="video/mp4" />
        </video>
        
        <nav className="mobile-menu__nav">
          <ul className="mobile-navList">
            <li className="mobile-navItem">
              <a href="#servicios" className="mobile-navLink" onClick={handleLinkClick}>
                <svg stroke={`url(#${gradientId})`} width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h20v14H2zM16 2v5M8 2v5"/></svg>
                <span>Servicios</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#proceso" className="mobile-navLink" onClick={handleLinkClick}>
                <svg stroke={`url(#${gradientId})`} width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l3 6h12l3-6M12 2v20"/></svg>
                <span>Proceso</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#precios" className="mobile-navLink" onClick={handleLinkClick}>
                <svg stroke={`url(#${gradientId})`} width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7" y2="7"/></svg>
                <span>Precios</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#testimonios" className="mobile-navLink" onClick={handleLinkClick}>
                <svg stroke={`url(#${gradientId})`} width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>Testimonios</span>
              </a>
            </li>
            <li className="mobile-navItem">
              <a href="#especialistas" className="mobile-navLink" onClick={handleLinkClick}>
                <svg stroke={`url(#${gradientId})`} width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>Especialistas</span>
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
