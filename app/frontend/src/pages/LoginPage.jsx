import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Academic prototype: proceed directly to predictor
    navigate('/predict');
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <main className="auth-main-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h1 className="auth-title">Sign In to WaterPoint AI</h1>
            <p className="auth-subtitle">
              Access the waterpoint status prediction tool and maintenance decision-support system.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                className="field-control"
                placeholder="officer@waterboard.gov.tz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="field-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-action btn-submit auth-submit-btn">
              <span>Sign In</span>
              <span className="btn-icon">→</span>
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <Link to="/predict" className="btn-action btn-outline auth-guest-btn">
              Continue to Predictor as Guest
            </Link>
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
