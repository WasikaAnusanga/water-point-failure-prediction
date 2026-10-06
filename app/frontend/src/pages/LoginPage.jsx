import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRedirectedFromPredict = location.state?.from?.pathname === '/predict';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate fields
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);
      const destination = location.state?.from?.pathname || '/predict';
      navigate(destination, { replace: true });
    } catch (err) {
      // Clear user-friendly error messages without raw backend stack traces
      const msg = err.message || '';
      if (msg.includes('unavailable') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setFormError('Authentication service is currently unavailable. Please verify the backend is running.');
      } else if (msg.includes('Invalid') || msg.includes('401') || msg.includes('Unauthorized')) {
        setFormError('Invalid email or password. Please check your credentials.');
      } else {
        setFormError(msg || 'Authentication failed. Please try again.');
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
          {/* Left Side: Project Context & Visual */}
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
                <div className="feature-item-icon">💧</div>
                <div className="feature-item-text">
                  <strong>Infrastructure Assessment</strong>
                  <span>Trained on 59,400+ national waterpoints across 9 river basins.</span>
                </div>
              </div>

              <div className="brand-side-feature-item">
                <div className="feature-item-icon">⚙️</div>
                <div className="feature-item-text">
                  <strong>Maintenance Scheduling</strong>
                  <span>Prioritize functional, repair-needed, and non-functional water supplies.</span>
                </div>
              </div>

              <div className="brand-side-feature-item">
                <div className="feature-item-icon">🛡️</div>
                <div className="feature-item-text">
                  <strong>Authorized Access</strong>
                  <span>Decision-support tools reserved for verified water resource personnel.</span>
                </div>
              </div>
            </div>

            <div className="brand-side-academic-note">
              IT3051 Fundamentals of Data Mining · Academic Evaluation
            </div>
          </div>

          {/* Right Side: Sign In Card */}
          <div className="auth-card-side">
            <div className="auth-card">
              <div className="auth-card-header">
                <h2 className="auth-title">Sign In</h2>
                <p className="auth-subtitle">
                  Enter your credentials to access the operational prediction portal.
                </p>
              </div>

              {isRedirectedFromPredict && !formError && (
                <div className="system-alert alert-info auth-alert" role="alert">
                  <span className="alert-icon">🔒</span>
                  <div className="alert-content">
                    <strong className="alert-title">Access Restricted:</strong>
                    <span className="alert-msg">Please sign in to access the waterpoint prediction system.</span>
                  </div>
                </div>
              )}

              {formError && (
                <div className="system-alert alert-danger alert-error auth-alert" role="alert">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-content">
                    <strong className="alert-title">Sign In Error:</strong>
                    <span className="alert-msg">{formError}</span>
                  </div>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="field-group">
                  <label htmlFor="login-email">
                    Email Address <span className="req-star">*</span>
                  </label>
                  <input
                    type="email"
                    id="login-email"
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
                  <label htmlFor="login-password">
                    Password <span className="req-star">*</span>
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    className="field-control"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
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
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="btn-icon">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="auth-card-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/signup" className="auth-link">
                    Create Account
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
