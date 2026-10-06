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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signup({ name, organization, email, password });
      navigate('/predict');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the provided information.');
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

          {error && (
            <div className="system-alert alert-danger alert-error auth-alert" role="alert">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <strong className="alert-title">Registration Failed:</strong>
                <span className="alert-msg">{error}</span>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                type="text"
                id="signup-name"
                className="field-control"
                placeholder="Dr. Juma Mwinyi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="field-group">
              <label htmlFor="signup-org">Organization / Water Board</label>
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
                className="field-control"
                placeholder="jmwinyi@waterboard.gov.tz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="field-group">
              <label htmlFor="signup-password">Password (min 6 characters)</label>
              <input
                type="password"
                id="signup-password"
                className="field-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
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
