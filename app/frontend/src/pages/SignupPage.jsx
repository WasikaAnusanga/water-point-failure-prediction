import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Regex for basic email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    // 1. All fields required
    if (!fullName.trim()) {
      return 'Full Name is required.';
    }
    if (!email.trim()) {
      return 'Email Address is required.';
    }
    if (!password) {
      return 'Password is required.';
    }
    if (!confirmPassword) {
      return 'Please confirm your password.';
    }

    // 2. Valid email format
    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Please provide a valid email address (e.g. name@domain.com).';
    }

    // 3. Password minimum 8 characters
    if (password.length < 8) {
      return 'Password must be at least 8 characters in length.';
    }

    // 4. Passwords must match
    if (password !== confirmPassword) {
      return 'Passwords do not match. Please re-enter matching passwords.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name: fullName.trim(),
        email: email.trim(),
        password: password
      });
      // Automatically redirect to /predict after account creation
      navigate('/predict', { replace: true });
    } catch (err) {
      // Clear user-friendly error without exposing raw backend stack traces
      const msg = err.message || '';
      if (msg.includes('unavailable') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setFormError('Registration service is currently unavailable. Please verify the backend is running.');
      } else if (msg.includes('already exists')) {
        setFormError('An account with this email already exists.');
      } else {
        setFormError(msg || 'Failed to create account. Please verify details and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <main className="auth-split-layout-container">
        <div className="auth-split-wrapper">
          {/* Left Side: System Context & Visual */}
          <div className="auth-brand-side">
            <div className="brand-side-badge">
              <span className="badge-pulse-dot" />
              <span>Decision-Support System</span>
            </div>

            <h1 className="brand-side-title">WaterPoint AI</h1>
            <p className="brand-side-subtitle">
              Tanzania Waterpoint Status Prediction & Maintenance Prioritization System
            </p>

            <div className="brand-side-features">
              <div className="brand-side-feature-item">
                <div className="feature-item-icon">📋</div>
                <div className="feature-item-text">
                  <strong>Create Verified Account</strong>
                  <span>Gain access to data-driven operational condition forecasting.</span>
                </div>
              </div>

              <div className="brand-side-feature-item">
                <div className="feature-item-icon">🔍</div>
                <div className="feature-item-text">
                  <strong>Early Anomaly Detection</strong>
                  <span>Identify waterpoints needing repair before total pump failure occurs.</span>
                </div>
              </div>

              <div className="brand-side-feature-item">
                <div className="feature-item-icon">🔒</div>
                <div className="feature-item-text">
                  <strong>Secure Session Management</strong>
                  <span>Credentials stored with bcrypt encryption and protected sessions.</span>
                </div>
              </div>
            </div>

            <div className="brand-side-academic-note">
              IT3051 Fundamentals of Data Mining · Academic Evaluation
            </div>
          </div>

          {/* Right Side: Sign Up Card */}
          <div className="auth-card-side">
            <div className="auth-card">
              <div className="auth-card-header">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">
                  Register as an authorized operator to access the predictive system.
                </p>
              </div>

              {formError && (
                <div className="system-alert alert-danger alert-error auth-alert" role="alert">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-content">
                    <strong className="alert-title">Registration Error:</strong>
                    <span className="alert-msg">{formError}</span>
                  </div>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <label htmlFor="signup-name">
                    Full Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="signup-name"
                    className="field-control"
                    placeholder="Eng. Amina Bakari"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="signup-email">
                    Email Address <span className="req-star">*</span>
                  </label>
                  <input
                    type="email"
                    id="signup-email"
                    className="field-control"
                    placeholder="officer@waterboard.gov.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="signup-password">
                    Password <span className="req-star">*</span>
                  </label>
                  <input
                    type="password"
                    id="signup-password"
                    className="field-control"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="signup-confirm-password">
                    Confirm Password <span className="req-star">*</span>
                  </label>
                  <input
                    type="password"
                    id="signup-confirm-password"
                    className="field-control"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-action btn-submit auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <span className="btn-icon">→</span>
                    </>
                  )}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
