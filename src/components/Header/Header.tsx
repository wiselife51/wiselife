import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '../Typography/Typography';
import Button from '../Button/Button';
import './Header.css';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
            <Typography as="a" href="#" variant="body2" color="primary" className="navLink">
              {t('features')}
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#" variant="body2" color="primary" className="navLink">
              {t('pricing')}
            </Typography>
          </li>
          <li className="navItem">
            <Typography as="a" href="#" variant="body2" color="primary" className="navLink">
              {t('contact')}
            </Typography>
          </li>
        </ul>
      </nav>

      {/* --- 3. Sección Derecha (Acciones) --- */}
      <div className="header__actions">
        <div className="language-switcher">
          <Button
            variant={i18n.language === 'es' ? 'primary' : 'secondary'}
            onClick={() => changeLanguage('es')}
          >
            ES
          </Button>
          <Button
            variant={i18n.language === 'en' ? 'primary' : 'secondary'}
            onClick={() => changeLanguage('en')}
          >
            EN
          </Button>
        </div>
        <div className="header__divider" />
        <Button variant="secondary">{t('signIn')}</Button>
        <Button variant="primary">{t('signUp')}</Button>
      </div>
    </header>
  );
};

export default Header;
