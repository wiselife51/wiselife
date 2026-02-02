import React from 'react';
import Typography from '../Typography/Typography';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      {/* Logo */}
      <div className="header__logo">
        <Typography as="a" href="#" variant="body1" color="primary" className="logo">
          Psic. Nombre
        </Typography>
      </div>

      {/* Navegación */}
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

      {/* Acciones */}
      <div className="header__actions">
        <button className="header-btn-secondary">Iniciar Sesión</button>
        <button className="header-btn-primary">Agendar Cita</button>
      </div>
    </header>
  );
};

export default Header;