import React from 'react';
import Typography from '../Typography/Typography';
import './Footer.css';

// Importando los 8 iconos de redes sociales (incluyendo WhatsApp)
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaYoutube,
  FaTiktok,
  FaWhatsapp, // <-- AÑADIDO: Icono de WhatsApp
} from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__copyright">
        <Typography variant="body2" color="secondary">
          © 2024 Wiselife. All rights reserved.
        </Typography>
      </div>

      <div className="footer__socials">
        {/* AÑADIDO: Clases específicas para cada icono */}
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
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--github">
          <FaGithub />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--youtube">
          <FaYoutube />
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--tiktok">
          <FaTiktok />
        </a>
        {/* AÑADIDO: Icono de WhatsApp */}
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="social-icon social-icon--whatsapp">
          <FaWhatsapp />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
