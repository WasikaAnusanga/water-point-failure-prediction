import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import heroImage from '../assets/hero.png';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page-wrapper">
      <Navbar />

      {/* 1. Hero Section with hero.png as Background */}
      <header
        className="hero-section hero-bg-image"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-bg-overlay" />

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse-dot" />
              <span>Machine Learning Decision-Support System</span>
            </div>

            <h1 className="hero-heading">
              Predict Waterpoint Conditions.<br />
              <span className="hero-highlight">Prioritize Maintenance Earlier.</span>
            </h1>

            <p className="hero-description">
              Use machine-learning predictions to support the identification of functional, repair-needed, and non-functional waterpoints across Tanzania.
            </p>

            <div className="hero-cta-group">
              {isAuthenticated ? (
                <Link to="/predict" className="btn-hero-primary">
                  Launch Predictor
                </Link>
              ) : (
                <Link to="/signup" className="btn-hero-primary">
                  Get Started
                </Link>
              )}
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => scrollToSection('how-it-works')}
              >
                Learn How It Works
              </button>
            </div>

            <div className="hero-quick-access">
              {isAuthenticated && user ? (
                <>
                  <span>Active Session: <strong>{user.name}</strong>. </span>
                  <Link to="/predict" className="quick-access-link">
                    Open Predictor Tool →
                  </Link>
                </>
              ) : (
                <>
                  <span>Authorized users only. </span>
                  <Link to="/login" className="quick-access-link">
                    Sign In to access prediction tool →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Key Highlights Metrics Bar */}
      <section className="stats-bar-section" aria-label="Key Performance Indicators">
        <div className="stats-bar-container">
          <div className="hero-stats-ribbon glass-ribbon">
            <div className="stat-ribbon-item">
              <div className="stat-number">59,400+</div>
              <div className="stat-label">Validated Waterpoints</div>
            </div>
            <div className="stat-ribbon-divider" />
            <div className="stat-ribbon-item">
              <div className="stat-number">18</div>
              <div className="stat-label">Geospatial & Operational Features</div>
            </div>
            <div className="stat-ribbon-divider" />
            <div className="stat-ribbon-item">
              <div className="stat-number">3 Classes</div>
              <div className="stat-label">Functional · Repair · Non-Functional</div>
            </div>
            <div className="stat-ribbon-divider" />
            <div className="stat-ribbon-item">
              <div className="stat-number">70.2%</div>
              <div className="stat-label">Independent Macro Recall</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section id="problem" className="section-block problem-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Real-World Context</span>
            <h2 className="section-title">Why Waterpoint Monitoring Matters</h2>
            <p className="section-subtitle">
              Waterpoints can become damaged or non-functional over time. Limited maintenance budgets and geographical spread make continuous physical inspection of every waterpoint difficult.
            </p>
          </div>

          <div className="cards-grid-3">
            <div className="feature-info-card">
              <div className="card-icon-box blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <h3 className="card-title">Geographically Dispersed</h3>
              <p className="card-text">
                Tens of thousands of water points span across remote rural communities in Tanzania, complicating regular manual survey schedules.
              </p>
            </div>

            <div className="feature-info-card">
              <div className="card-icon-box amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="card-title">Inspection Resource Constraints</h3>
              <p className="card-text">
                Regional water engineering crews operate with finite fleet, technician, and fuel resources, requiring data-driven target prioritization.
              </p>
            </div>

            <div className="feature-info-card">
              <div className="card-icon-box teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 className="card-title">Proactive Early Intervention</h3>
              <p className="card-text">
                Catching degrading infrastructure while still in need of minor repair prevents severe mechanical failure and community water disruption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="section-block how-it-works-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Methodology & Workflow</span>
            <h2 className="section-title">How the Prediction System Works</h2>
            <p className="section-subtitle">
              A transparent 3-step decision pipeline from raw waterpoint attributes to decoded operational classifications.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Enter Waterpoint Information</h3>
              <p className="step-text">
                The user enters location coordinates, extraction technology, water quality, adequacy quantity, and management committee information.
              </p>
            </div>

            <div className="step-connector" aria-hidden="true">→</div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Machine Learning Analysis</h3>
              <p className="step-text">
                The trained XGBoost model processes the data through the exact learned preprocessing pipeline (imputation, scaling, and one-hot encoding).
              </p>
            </div>

            <div className="step-connector" aria-hidden="true">→</div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Receive Status Prediction</h3>
              <p className="step-text">
                The system outputs the predicted status—Functional, Functional Needs Repair, or Non Functional—along with confidence and probability distributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Prediction Classes Section */}
      <section className="section-block classes-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Target Classifications</span>
            <h2 className="section-title">Waterpoint Operational Categories</h2>
            <p className="section-subtitle">
              Our multiclass model classifies infrastructure into three distinct operational states to guide field scheduling.
            </p>
          </div>

          <div className="cards-grid-3">
            <div className="class-status-card functional-theme">
              <div className="class-card-header">
                <span className="class-icon-pill">✓</span>
                <span className="class-name">Functional</span>
              </div>
              <p className="class-definition">
                Waterpoint predicted to be operational and currently supplying water to the community.
              </p>
              <div className="class-guidance-pill">
                Routine monitoring recommended
              </div>
            </div>

            <div className="class-status-card repair-theme">
              <div className="class-card-header">
                <span className="class-icon-pill">⚠️</span>
                <span className="class-name">Functional Needs Repair</span>
              </div>
              <p className="class-definition">
                Waterpoint predicted to be operational but requiring maintenance or repair to prevent full breakdown.
              </p>
              <div className="class-guidance-pill">
                Priority maintenance inspection
              </div>
            </div>

            <div className="class-status-card non-functional-theme">
              <div className="class-card-header">
                <span className="class-icon-pill">✕</span>
                <span className="class-name">Non Functional</span>
              </div>
              <p className="class-definition">
                Waterpoint predicted to be non-operational, damaged, or dry, cutting off community access.
              </p>
              <div className="class-guidance-pill">
                Urgent repair intervention
              </div>
            </div>
          </div>

          <p className="classes-disclaimer-note">
            <em>Note: Predictions represent probabilistic estimates based on historical patterns and do not imply guaranteed engineering certainty.</em>
          </p>
        </div>
      </section>

      {/* 5. Benefits Section */}
      <section className="section-block benefits-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Key Advantages</span>
            <h2 className="section-title">Benefits for Water Resource Teams</h2>
            <p className="section-subtitle">
              Designed to support regional planning authorities, NGOs, and municipal water managers.
            </p>
          </div>

          <div className="cards-grid-4">
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3 className="benefit-title">Maintenance Prioritization</h3>
              <p className="benefit-text">
                Helps identify waterpoints that may require urgent inspection before field crews are dispatched.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3 className="benefit-title">Data-Driven Support</h3>
              <p className="benefit-text">
                Uses historical waterpoint characteristics and validated field reports to support operational decisions.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3 className="benefit-title">Consistent Assessment</h3>
              <p className="benefit-text">
                Provides objective predictions using the exact same trained model and preprocessing pipeline.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3 className="benefit-title">Fast Prediction</h3>
              <p className="benefit-text">
                Provides an immediate model-based status estimate without requiring manual calculation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Responsible Use Section */}
      <section className="section-block responsible-use-section">
        <div className="section-container">
          <div className="responsible-use-banner">
            <div className="responsible-use-icon">🛡️</div>
            <div className="responsible-use-text-group">
              <h3 className="responsible-use-title">Responsible Decision-Support Notice</h3>
              <p className="responsible-use-body">
                "This system is a decision-support prototype. Predictions should support, not replace, physical field inspection and professional assessment."
              </p>
              <p className="responsible-use-subtext">
                Model outputs reflect statistical probabilities learned from historical survey records. Technicians and engineers should always perform ground-truth inspections before committing capital investments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Section */}
      <section className="section-block cta-section">
        <div className="section-container">
          <div className="cta-card">
            <h2 className="cta-heading">Ready to Assess a Waterpoint?</h2>
            <p className="cta-description">
              Access the decision-support predictor tool to evaluate water infrastructure and support maintenance planning.
            </p>
            <div className="cta-actions">
              {isAuthenticated ? (
                <Link to="/predict" className="btn-cta-primary">
                  Launch Predictor Tool →
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-cta-primary">
                    Create Account
                  </Link>
                  <Link to="/login" className="btn-cta-secondary">
                    Sign In to Access Predictor
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
