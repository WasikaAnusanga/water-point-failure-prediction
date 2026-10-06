import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isLandingPage = location.pathname === '/';

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (!isLandingPage) return;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="site-navbar" aria-label="Main Navigation">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <svg
              className="brand-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="brand-text-group">
            <span className="brand-name">WaterPoint AI</span>
            <span className="brand-badge-tag">Tanzania</span>
          </div>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
        </button>

        {/* Desktop & Mobile Navigation Links */}
        <div className={`navbar-links-group ${mobileMenuOpen ? 'mobile-visible' : ''}`}>
          <div className="nav-anchors">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Home
            </Link>

            {isLandingPage ? (
              <>
                <button
                  type="button"
                  className="nav-link nav-btn-link"
                  onClick={() => scrollToSection('problem')}
                >
                  About
                </button>
                <button
                  type="button"
                  className="nav-link nav-btn-link"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  How It Works
                </button>
              </>
            ) : (
              <>
                <Link to="/#problem" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link to="/#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </Link>
              </>
            )}

            {isAuthenticated && (
              <Link
                to="/predict"
                className={`nav-link ${location.pathname === '/predict' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Predictor
              </Link>
            )}
          </div>

          <div className="nav-actions">
            {isAuthenticated && user ? (
              <div className="user-nav-group">
                <div className="user-profile-badge" title={`${user.name} (${user.email})`}>
                  <span className="user-avatar-icon">👤</span>
                  <span className="user-name-text">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  type="button"
                  className="btn-nav-logout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-nav-signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-nav-getstarted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
