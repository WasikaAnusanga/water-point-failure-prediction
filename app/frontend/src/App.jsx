import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import { getMetadata, checkHealth, predictWaterPoint } from './api';

export default function App() {
  const [metadata, setMetadata] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Initialize and fetch metadata from backend
  useEffect(() => {
    async function init() {
      const healthy = await checkHealth();
      setIsConnected(healthy);

      const meta = await getMetadata();
      setMetadata(meta);
    }
    init();

    // Heartbeat check
    const interval = setInterval(async () => {
      const healthy = await checkHealth();
      setIsConnected(healthy);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handlePredict = async (formData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const predictionResponse = await predictWaterPoint(formData);
      setResult(predictionResponse);
      
      // Smooth scroll to result
      setTimeout(() => {
        const resultEl = document.querySelector('.result-container');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (err) {
      console.error('Prediction request error:', err);
      setError(err.message || 'An error occurred while connecting to the model service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-shell">
      <Header isConnected={isConnected} />

      {error && (
        <div className="system-alert alert-danger alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <strong className="alert-title">Service Error:</strong>
            <span className="alert-msg">{error}</span>
          </div>
        </div>
      )}

      <main className="main-content">
        <PredictionForm
          metadata={metadata}
          onSubmit={handlePredict}
          onReset={handleReset}
          isLoading={isLoading}
        />

        <ResultCard result={result} />
      </main>

      <footer className="app-footer">
        <p className="footer-academic-line">
          Decision-support prototype developed for the IT3051 Fundamentals of Data Mining Mini Project.
        </p>
        <p className="footer-disclaimer-line">
          Predictions should support, not replace, field inspection and professional assessment.
        </p>
      </footer>
    </div>
  );
}
