import React from 'react';

export default function Header({ isConnected }) {
  return (
    <header className="app-header">
      <div className="header-meta-row">
        <span className="academic-badge">
          IT3051 Fundamentals of Data Mining · Mini Project
        </span>
        <div className="system-status-pill system-status" aria-live="polite">
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span className="status-label">
            {isConnected ? 'Model Service Online & Ready' : 'Connecting to Model Service...'}
          </span>
        </div>
      </div>

      <h1 className="header-title">Tanzania Waterpoint Status Prediction</h1>
      <p className="header-subtitle">
        A machine learning decision-support system designed to predict the operational condition of water infrastructure across Tanzania and assist regional water authorities in prioritizing field maintenance.
      </p>
    </header>
  );
}
