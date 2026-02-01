import React from 'react';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      {/* --- 1. Sección Izquierda (Logo) --- */}
      <div className="header__logo">
        <Typography as="a" href="#" variant="body1" color="primary" className="logo">
          Pointer
        </Typography>
      </div>

      {/* --- 2. Sección Central (Navegación) --- */}
      <nav className="header__nav">
        <ul className="navList">
          <li className="navItem">
            <Typography as="a" href="#" variant="body2" color="secondary" className="navLink">
              Features
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#" variant="body2" color="secondary" className="navLink">
              Pricing
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#" variant="body2" color="secondary" className="navLink">
              Contact
            </Typography>
          </li>
        </ul>
      </nav>

      {/* --- 3. Sección Derecha (Acciones) --- */}
      <div className="header__actions">
        <Button variant="secondary">
          Sign In
        </Button>
        <Button variant="primary">
          Sign Up
        </Button>
      </div>
    </header>
  );
}

export default Header;
