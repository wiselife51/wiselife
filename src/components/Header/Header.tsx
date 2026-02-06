import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'servicios',
    label: 'Servicios',
    href: '#servicios',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7e57c2" />
            <stop offset="100%" stopColor="#b388ff" />
          </linearGradient>
        </defs>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
  {
    id: 'especialistas',
    label: 'Especialistas',
    href: '#especialistas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'proceso',
    label: 'Proceso',
    href: '#proceso',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'precios',
    label: 'Precios',
    href: '#precios',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3l5-10" />
        <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3l5-10" />
      </svg>
    ),
  },
  {
    id: 'testimonios',
    label: 'Testimonios',
    href: '#testimonios',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    id: 'contacto',
    label: 'Contacto',
    href: '#contacto',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Detectar sección activa
      const sections = navItems.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      {/* Logo */}
      <a href="#" className="header__logo" aria-label="Vida Sabia - Inicio">
        <div className="logo-icon-wrapper">
          <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4dd0e1" />
                <stop offset="50%" stopColor="#42a5f5" />
                <stop offset="100%" stopColor="#7e57c2" />
              </linearGradient>
            </defs>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#logo-gradient)" />
          </svg>
          <div className="logo-glow" />
        </div>
        <span className="logo-text">Vida Sabia</span>
      </a>

      {/* Desktop Navigation */}
      <nav className="header__nav" aria-label="Navegación principal">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <a
                href={item.href}
                className={`nav-link ${activeSection === item.id ? 'nav-link--active' : ''}`}
              >
                <span className="nav-link__text">{item.label}</span>
                <span className="nav-link__indicator" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop Actions */}
      <div className="header__actions">
        <button className="btn btn--ghost" type="button" onClick={() => navigate('/login')}>
          <span>Iniciar Sesion</span>
        </button>
        <button className="btn btn--primary" type="button" onClick={() => navigate('/login')}>
          <span>Agendar Cita</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Hamburger Menu Button */}
      <button
        className={`hamburger ${isMenuOpen ? 'hamburger--active' : ''}`}
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        type="button"
      >
        <span className="hamburger__line" />
        <span className="hamburger__line" />
        <span className="hamburger__line" />
      </button>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`} role="dialog" aria-modal="true">
        <video autoPlay loop muted playsInline className="mobile-menu__bg-video">
          <source src="/assets/VideoFondo.mp4" type="video/mp4" />
        </video>
        <div className="mobile-menu__overlay-inner" />

        <nav className="mobile-menu__nav" aria-label="Navegación móvil">
          <ul className="mobile-nav-list">
            {navItems.map((item, index) => (
              <li
                key={item.id}
                className="mobile-nav-item"
                style={{ '--delay': `${index * 0.05 + 0.1}s` } as React.CSSProperties}
              >
                <a href={item.href} className="mobile-nav-link" onClick={handleLinkClick}>
                  <div className="mobile-nav-link__content">
                    <span className="mobile-nav-link__icon">{item.icon}</span>
                    <span className="mobile-nav-link__text">{item.label}</span>
                  </div>
                  <ChevronIcon />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-menu__actions">
          <button className="btn btn--ghost btn--full" onClick={() => { handleLinkClick(); navigate('/login'); }} type="button">
            Iniciar Sesion
          </button>
          <button className="btn btn--primary btn--full" onClick={() => { handleLinkClick(); navigate('/login'); }} type="button">
            <span>Agendar Cita</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="mobile-menu__backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
