import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

type AuthMode = 'login' | 'register';

const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: loginError } = await signInWithEmail(email, password);
        if (loginError) {
          setError(loginError);
          setLoading(false);
          return;
        }
        navigate('/onboarding');
      } else {
        const { error: signupError } = await signUpWithEmail(email, password, name);
        if (signupError) {
          setError(signupError);
          setLoading(false);
          return;
        }
        navigate('/onboarding');
      }
    } catch {
      setError('Ocurrio un error inesperado');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    await signInWithGoogle();
  };

  const handleFacebookLogin = async () => {
    setError(null);
    await signInWithFacebook();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <video autoPlay loop muted playsInline className="login-video-bg">
        <source src="/assets/VideoFondo.mp4" type="video/mp4" />
      </video>
      <div className="login-overlay" />

      <div className="login-content">
        {/* Logo / Back */}
        <button className="login-back" onClick={handleGoHome} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Volver</span>
        </button>

        {/* Card principal */}
        <div className="login-card">
          {/* Header de la card */}
          <div className="login-card-header">
            <div className="login-logo">
              <div className="login-logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <defs>
                    <linearGradient id="login-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4dd0e1" />
                      <stop offset="50%" stopColor="#42a5f5" />
                      <stop offset="100%" stopColor="#7e57c2" />
                    </linearGradient>
                  </defs>
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#login-logo-grad)" />
                </svg>
              </div>
              <span className="login-logo-text">Vida Sabia</span>
            </div>
            <h1 className="login-title">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h1>
            <p className="login-subtitle">
              {mode === 'login'
                ? 'Inicia sesion para acceder a tu espacio de bienestar'
                : 'Registrate y comienza tu camino hacia el bienestar'}
            </p>
          </div>

          {/* Tabs */}
          <div className="login-tabs">
            <button
              className={`login-tab ${mode === 'login' ? 'login-tab--active' : ''}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Iniciar Sesion
            </button>
            <button
              className={`login-tab ${mode === 'register' ? 'login-tab--active' : ''}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Crear Cuenta
            </button>
          </div>

          {/* Social buttons */}
          <div className="login-social">
            <button className="login-social-btn" type="button" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
            <button className="login-social-btn" type="button" onClick={handleFacebookLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Error message */}
          {error && <p className="login-error">{error}</p>}

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">o continua con email</span>
            <span className="login-divider-line" />
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="login-field">
                <label className="login-label" htmlFor="name">Nombre completo</label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="name"
                    type="text"
                    className="login-input"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="login-field">
              <label className="login-label" htmlFor="email">Correo electronico</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label className="login-label" htmlFor="password">Contrasena</label>
                {mode === 'login' && (
                  <a href="#" className="login-forgot">Olvidaste tu contrasena?</a>
                )}
              </div>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Tu contrasena"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-btn-spinner" />
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Iniciar Sesion' : 'Crear Cuenta'}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer de la card */}
          <p className="login-card-footer">
            {mode === 'login' ? (
              <>
                {'No tienes cuenta? '}
                <button className="login-switch" onClick={() => setMode('register')} type="button">
                  Registrate
                </button>
              </>
            ) : (
              <>
                {'Ya tienes cuenta? '}
                <button className="login-switch" onClick={() => setMode('login')} type="button">
                  Inicia sesion
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
