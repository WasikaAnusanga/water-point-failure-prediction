import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/logo.png';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-column">
            <div className="footer-logo">
              <img src={logoImage} alt="WaterPoint AI Logo" className="footer-logo-img" />
              <span className="footer-title">WaterPoint AI</span>
            </div>
            <p className="footer-tagline">
              Tanzania Waterpoint Status Prediction and Maintenance Prioritization System.
            </p>
            <div className="footer-badge">
              IT3051 Fundamentals of Data Mining · Mini Project
            </div>
          </div>

          <div className="footer-links-column">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-list">
              <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
              <li><a href="/#problem">About the Problem</a></li>
              <li><a href="/#how-it-works">How It Works</a></li>
              <li><Link to="/predict">Prediction Tool</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4 className="footer-heading">Access</h4>
            <ul className="footer-list">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/signup">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="footer-academic-notice">
            Decision-support prototype developed for academic evaluation. Predictions should support, not replace, physical field inspection and professional engineering assessment.
          </p>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} WaterPoint AI · Republic of Tanzania Water Basin Data
          </p>
        </div>
      </div>
    </footer>
  );
}
