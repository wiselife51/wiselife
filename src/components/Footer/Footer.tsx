import React from 'react';
import './Footer.css';

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaTiktok,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  label: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'facebook',
    href: 'https://facebook.com',
    icon: <FaFacebookF />,
    label: 'Síguenos en Facebook',
  },
  {
    name: 'twitter',
    href: 'https://twitter.com',
    icon: <FaXTwitter />,
    label: 'Síguenos en X (Twitter)',
  },
  {
    name: 'instagram',
    href: 'https://instagram.com',
    icon: <FaInstagram />,
    label: 'Síguenos en Instagram',
  },
  {
    name: 'linkedin',
    href: 'https://linkedin.com',
    icon: <FaLinkedinIn />,
    label: 'Conéctate en LinkedIn',
  },
  {
    name: 'tiktok',
    href: 'https://tiktok.com',
    icon: <FaTiktok />,
    label: 'Síguenos en TikTok',
  },
  {
    name: 'whatsapp',
    href: 'https://wa.me/573001234567',
    icon: <FaWhatsapp />,
    label: 'Contáctanos por WhatsApp',
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__socials">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`social-icon social-icon--${social.name}`}
            aria-label={social.label}
          >
            <span className="social-icon__bg" />
            <span className="social-icon__icon">{social.icon}</span>
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
