import React, { useState, useEffect, useCallback } from 'react';
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'especialistas',
    label: 'Especialistas',
    href: '#especialistas',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'proceso',
    label: 'Proceso',
    href: '#proceso',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'precios',
    label: 'Precios',
    href: '#precios',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'testimonios',
    label: 'Testimonios',
    href: '#testimonios',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
        <button className="btn btn--ghost" type="button">
          <span>Iniciar Sesión</span>
        </button>
        <button className="btn btn--primary" type="button">
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
          <button className="btn btn--ghost btn--full" onClick={handleLinkClick} type="button">
            Iniciar Sesión
          </button>
          <button className="btn btn--primary btn--full" onClick={handleLinkClick} type="button">
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
