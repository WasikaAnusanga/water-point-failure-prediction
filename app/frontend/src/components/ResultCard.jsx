import React, { useEffect } from 'react';

const STATUS_DETAILS = {
  'functional': {
    title: 'Functional',
    themeClass: 'status-functional',
    fillClass: 'fill-functional',
    icon: '✓',
    summary: 'The waterpoint is predicted to be operational and currently serving the community reliably.',
    actionLabel: 'Operational Recommendation',
    actionText: 'Continue standard routine monitoring and scheduled periodic servicing to sustain operational reliability.'
  },
  'functional needs repair': {
    title: 'Functional Needs Repair',
    themeClass: 'status-repair',
    fillClass: 'fill-repair',
    icon: '⚠️',
    summary: 'The waterpoint is currently operational but is predicted to require timely maintenance or repairs.',
    actionLabel: 'Maintenance Priority',
    actionText: 'Prioritize for scheduled field inspection and preventative maintenance to avoid complete system failure.'
  },
  'non functional': {
    title: 'Non Functional',
    themeClass: 'status-non-functional',
    fillClass: 'fill-non-functional',
    icon: '✕',
    summary: 'The waterpoint is predicted to be non-operational and unable to supply water.',
    actionLabel: 'Intervention Priority',
    actionText: 'Prioritize for prompt technical inspection and repair intervention to restore local water access.'
  }
};

export default function ResultCard({ result, onClose }) {
  useEffect(() => {
    if (!result) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [result, onClose]);

  if (!result) return null;

  const { prediction, confidence, probabilities } = result;
  const key = prediction ? prediction.toLowerCase() : 'functional';
  const details = STATUS_DETAILS[key] || {
    title: prediction,
    themeClass: 'status-functional',
    fillClass: 'fill-functional',
    icon: 'ℹ',
    summary: 'Prediction generated based on input characteristics.',
    actionLabel: 'Field Guidance',
    actionText: 'Review waterpoint status during routine field visits.'
  };

  const confidencePercent = Math.round((confidence || 0) * 100);

  return (
    <div
      className="result-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
      onClick={onClose}
    >
      <div
        className={`result-modal-dialog result-container result-card ${details.themeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="result-modal-header">
          <div className="result-modal-header-text">
            <span className="result-eyebrow">Waterpoint AI Assessment</span>
            <h3 id="result-modal-title" className="result-modal-title">Prediction Result</h3>
          </div>
          <button
            type="button"
            className="result-modal-close-btn"
            onClick={onClose}
            aria-label="Close result modal"
          >
            ✕
          </button>
        </div>

        <div className="result-top-bar">
          <div className="result-heading-group">
            <span className="result-status-subhead">Operational Status</span>
            <div className="result-badge status-badge">
              <span className="badge-icon">{details.icon}</span>
              <span className="badge-text">{details.title}</span>
            </div>
          </div>

          <div className="confidence-card confidence-chip">
            <div className="confidence-value val">{confidencePercent}%</div>
            <div className="confidence-label lbl">Model Confidence</div>
          </div>
        </div>

        <div className="result-body">
          <p className="status-summary-text">{details.summary}</p>
          
          <div className="action-recommendation-box">
            <span className="action-title">{details.actionLabel}:</span>
            <span className="action-description">{details.actionText}</span>
          </div>
        </div>

        {probabilities && Object.keys(probabilities).length > 0 && (
          <div className="class-probabilities-panel">
            <h4 className="probabilities-header">Class Probability Distribution</h4>
            <div className="probabilities-list">
              {Object.entries(probabilities).map(([className, probValue]) => {
                const classKey = className.toLowerCase();
                const itemDetails = STATUS_DETAILS[classKey] || {
                  title: className,
                  fillClass: 'fill-functional'
                };
                const percentage = Math.round(probValue * 100);

                return (
                  <div key={className} className="probability-item prob-row">
                    <div className="prob-meta">
                      <span className="prob-class-name">{itemDetails.title}</span>
                      <span className="prob-class-val">
                        {percentage}% <span className="prob-decimal">({probValue.toFixed(3)})</span>
                      </span>
                    </div>
                    <div className="progress-track" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
                      <div
                        className={`progress-fill ${itemDetails.fillClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="guidance-disclaimer disclaimer-banner">
          <span className="disclaimer-icon">ℹ️</span>
          <p className="disclaimer-text">
            <strong>Decision-Support Notice:</strong> Predictions should support, not replace, field inspection and professional engineering assessment. Recommended actions provide indicative guidance to support maintenance prioritization and scheduling.
          </p>
        </div>

        <div className="result-modal-footer">
          <button
            type="button"
            className="btn btn-primary result-modal-done-btn"
            onClick={onClose}
          >
            Done / Close View
          </button>
        </div>
      </div>
    </div>
  );
}
