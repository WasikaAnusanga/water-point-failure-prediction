import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import logoImage from '../assets/logo.png';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

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

    if (!name.trim()) {
      errors.name = 'Please enter your full name.';
    }

    const emailRegex = /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid official email address.';
    }

    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters in length.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please ensure both passwords are identical.';
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
      await signup({ name, organization, email, password, confirm_password: confirmPassword });
      navigate('/predict');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check the provided information.';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('email')) {
        setFieldErrors({ email: 'An account with this email address already exists.' });
      } else if (msg.toLowerCase().includes('match') || msg.toLowerCase().includes('password')) {
        setFieldErrors({ confirmPassword: 'Passwords do not match. Please ensure both passwords are identical.' });
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Register as a water authority technician or regional planner to access the decision-support system.
            </p>
          </div>

          {serverError && (
            <div className="system-alert alert-danger alert-error auth-alert" role="alert">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong className="alert-title">Registration Error:</strong>
                <span className="alert-msg">{serverError}</span>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                className={`field-control ${fieldErrors.name ? 'has-error' : ''}`}
                placeholder="Dr. Juma Mwinyi"
                value={name}
                onChange={(e) => handleFieldChange('name', e.target.value, setName)}
                required
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <span className="field-error-msg">⚠️ {fieldErrors.name}</span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="signup-org">Organization / Water Board (Optional)</label>
              <input
                type="text"
                id="signup-org"
                className="field-control"
                placeholder="Rufiji Basin Water Board (RBWB)"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="field-group">
              <label htmlFor="signup-email">Official Email</label>
              <input
                type="email"
                id="signup-email"
                className={`field-control ${fieldErrors.email ? 'has-error' : ''}`}
                placeholder="jmwinyi@waterboard.gov.tz"
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
              <label htmlFor="signup-password">Password (min 6 characters)</label>
              <input
                type="password"
                id="signup-password"
                className={`field-control ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                required
                minLength={6}
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <span className="field-error-msg">⚠️ {fieldErrors.password}</span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                type="password"
                id="signup-confirm-password"
                className={`field-control ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
                required
                minLength={6}
                disabled={isLoading}
              />
              {fieldErrors.confirmPassword && (
                <span className="field-error-msg">⚠️ {fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-action btn-submit auth-submit-btn"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account & Continue'}</span>
              <span className="btn-icon">→</span>
            </button>
          </form>

          <div className="auth-card-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In
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
