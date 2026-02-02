import React from 'react';
import Typography from '../Typography/Typography';
import './Footer.css';

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaTiktok,
} from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__copyright">
        <Typography variant="body2" color="primary">
          © 2024 Psicología Clínica. Todos los derechos reservados.
        </Typography>
      </div>

      <div className="footer__socials">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--facebook">
          <FaFacebook />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--twitter">
          <FaTwitter />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--instagram">
          <FaInstagram />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--linkedin">
          <FaLinkedin />
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--tiktok">
          <FaTiktok />
        </a>
        <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--whatsapp">
          <FaWhatsapp />
        </a>
      </div>
    </footer>
  );
}

export default Footer;