import React from 'react';

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

export default function ResultCard({ result }) {
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
    <section className={`result-container result-card ${details.themeClass}`} aria-live="polite">
      <div className="result-top-bar">
        <div className="result-heading-group">
          <span className="result-eyebrow">Predicted Operational Status</span>
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
          <strong>Decision-Support Notice:</strong> Predictions should support, not replace, field inspection and professional engineering assessment. Recommended actions provide indicative guidance to support maintenance prioritization and scheduling, and do not represent guaranteed engineering decisions.
        </p>
      </div>
    </section>
  );
}
