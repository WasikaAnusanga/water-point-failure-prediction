import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import logoImage from '../assets/logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRedirectedFromPredict = location.state?.from?.pathname === '/predict';

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Please enter your registered email address.';
    }
    if (!password) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setServerError(null);
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    setServerError(null);

    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/predict';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.toLowerCase().includes('credential') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid')) {
        setFieldErrors({
          email: 'Invalid credentials. Please verify your email and password.',
          password: ' '
        });
      } else {
        setServerError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <main className="auth-main-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon-badge">
              <img src={logoImage} alt="WaterPoint AI Logo" className="auth-logo-img" />
            </div>
            <h1 className="auth-title">Sign In to WaterPoint AI</h1>
            <p className="auth-subtitle">
              Access the waterpoint status prediction tool and maintenance decision-support system.
            </p>
          </div>

          {isRedirectedFromPredict && !serverError && Object.keys(fieldErrors).length === 0 && (
            <div className="system-alert alert-info auth-alert" role="alert">
              <span className="alert-icon">🔒</span>
              <div className="alert-content">
                <strong className="alert-title">Access Restricted:</strong>
                <span className="alert-msg">The prediction system is reserved for registered users. Please sign in to continue.</span>
              </div>
            </div>
          )}

          {serverError && (
            <div className="system-alert alert-danger alert-error auth-alert" role="alert">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong className="alert-title">Sign In Error:</strong>
                <span className="alert-msg">{serverError}</span>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                className={`field-control ${fieldErrors.email ? 'has-error' : ''}`}
                placeholder="officer@waterboard.gov.tz"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                required
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <span className="field-error-msg">⚠️ {fieldErrors.email}</span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className={`field-control ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                required
                disabled={isLoading}
              />
              {fieldErrors.password && fieldErrors.password.trim() && (
                <span className="field-error-msg">⚠️ {fieldErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-action btn-submit auth-submit-btn"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <span className="btn-icon">→</span>
            </button>
          </form>

          <div className="auth-card-footer">
            <p>
              Don't have an account yet?{' '}
              <Link to="/signup" className="auth-link">
                Create Account
              </Link>
            </p>
            <p className="auth-return-home">
              <Link to="/">← Return to Home</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
