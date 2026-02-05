import React, { useState } from 'react';
import './Auth.css';

type AuthMode = 'login' | 'register';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui ira la logica de autenticacion
    console.log('Form submitted:', formData);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Aqui ira la logica de autenticacion social
    console.log('Social login with:', provider);
  };

  return (
    <div className="auth-container">
      <video autoPlay loop muted playsInline className="auth-video-background">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="auth-overlay" />

      <div className="auth-content">
        {/* Logo y titulo */}
        <div className="auth-header">
          <a href="/" className="auth-logo">
            <svg className="auth-logo-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <defs>
                <linearGradient id="auth-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4dd0e1" />
                  <stop offset="50%" stopColor="#42a5f5" />
                  <stop offset="100%" stopColor="#7e57c2" />
                </linearGradient>
              </defs>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#auth-logo-gradient)" />
            </svg>
            <span className="auth-logo-text">Vida Sabia</span>
          </a>
        </div>

        {/* Card de autenticacion */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Inicia sesion para continuar tu bienestar'
                : 'Comienza tu camino hacia el bienestar emocional'}
            </p>
          </div>

          {/* Botones de modo */}
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'login' ? 'auth-mode-btn--active' : ''}`}
              onClick={() => setMode('login')}
            >
              Iniciar Sesion
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'register' ? 'auth-mode-btn--active' : ''}`}
              onClick={() => setMode('register')}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Botones sociales */}
          <div className="auth-social">
            <button
              type="button"
              className="auth-social-btn auth-social-btn--google"
              onClick={() => handleSocialLogin('google')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
            <button
              type="button"
              className="auth-social-btn auth-social-btn--facebook"
              onClick={() => handleSocialLogin('facebook')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continuar con Facebook</span>
            </button>
          </div>

          {/* Separador */}
          <div className="auth-divider">
            <span>o continua con email</span>
          </div>

          {/* Formulario */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="name" className="auth-label">
                  Nombre completo
                </label>
                <div className="auth-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="auth-input"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Correo electronico
              </label>
              <div className="auth-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="auth-input"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Contrasena
              </label>
              <div className="auth-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="auth-input"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="confirmPassword" className="auth-label">
                  Confirmar contrasena
                </label>
                <div className="auth-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="auth-input"
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="auth-forgot">
                <a href="#forgot" className="auth-forgot-link">
                  Olvidaste tu contrasena?
                </a>
              </div>
            )}

            <button type="submit" className="auth-submit-btn">
              <span>{mode === 'login' ? 'Iniciar Sesion' : 'Crear Cuenta'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          {/* Footer del card */}
          <div className="auth-card-footer">
            <p>
              {mode === 'login' ? 'No tienes una cuenta?' : 'Ya tienes una cuenta?'}{' '}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Registrate' : 'Inicia sesion'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>© {new Date().getFullYear()} Vida Sabia. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
