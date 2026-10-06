import React, { useState } from 'react';
import logoImage from '../assets/logo.png';

const INITIAL_FORM_STATE = {
  // 1. Location
  region: 'Iringa',
  basin: 'Rufiji',
  latitude: -9.856322,
  longitude: 34.938093,
  gps_height: 1390,

  // 2. Waterpoint Information
  waterpoint_age: 12,
  population: 109,
  amount_tsh: 50,
  extraction_type_class: 'gravity',
  source_type: 'spring',
  waterpoint_type_group: 'communal standpipe',
  quantity: 'enough',
  quality_group: 'good',

  // 3. Management Information
  scheme_management: 'VWC',
  management_group: 'user-group',
  payment_type: 'never pay',
  public_meeting: 'Yes',
  permit: 'No'
};

const SAMPLE_PRESETS = {
  functional: {
    label: 'Functional Waterpoint',
    desc: 'Operational spring with communal standpipe and gravity extraction',
    data: {
      region: 'Iringa',
      basin: 'Rufiji',
      latitude: -9.856322,
      longitude: 34.938093,
      gps_height: 1390,
      waterpoint_age: 12,
      population: 109,
      amount_tsh: 50,
      extraction_type_class: 'gravity',
      source_type: 'spring',
      waterpoint_type_group: 'communal standpipe',
      quantity: 'enough',
      quality_group: 'good',
      scheme_management: 'VWC',
      management_group: 'user-group',
      payment_type: 'never pay',
      public_meeting: 'Yes',
      permit: 'No'
    }
  },
  needs_repair: {
    label: 'Needs Repair Waterpoint',
    desc: 'Operational waterpoint with insufficient yield in Pangani basin',
    data: {
      region: 'Tanga',
      basin: 'Pangani',
      latitude: -4.664984,
      longitude: 38.254087,
      gps_height: 1943,
      waterpoint_age: 7,
      population: 150,
      amount_tsh: 0,
      extraction_type_class: 'gravity',
      source_type: 'spring',
      waterpoint_type_group: 'communal standpipe',
      quantity: 'insufficient',
      quality_group: 'good',
      scheme_management: 'VWC',
      management_group: 'user-group',
      payment_type: 'never pay',
      public_meeting: 'Yes',
      permit: 'Yes'
    }
  },
  non_functional: {
    label: 'Non-Functional Waterpoint',
    desc: 'Aged shallow well with salty dry water and broken mechanism',
    data: {
      region: 'Mbeya',
      basin: 'Lake Rukwa',
      latitude: -9.174777,
      longitude: 33.542898,
      gps_height: 0,
      waterpoint_age: 25,
      population: 0,
      amount_tsh: 0,
      extraction_type_class: 'other',
      source_type: 'shallow well',
      waterpoint_type_group: 'other',
      quantity: 'dry',
      quality_group: 'salty',
      scheme_management: 'VWC',
      management_group: 'user-group',
      payment_type: 'never pay',
      public_meeting: 'No',
      permit: 'No'
    }
  }
};

export default function PredictionForm({ metadata, onSubmit, onReset, isLoading }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [clientErrors, setClientErrors] = useState({});

  const categories = metadata?.categorical_values || {};

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));

    // Clear field-level error
    if (clientErrors[name]) {
      setClientErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setClientErrors({});
    if (onReset) onReset();
  };

  const handleLoadPreset = (key) => {
    if (SAMPLE_PRESETS[key]) {
      setFormData(SAMPLE_PRESETS[key].data);
      setClientErrors({});
    }
  };

  const validate = () => {
    const errors = {};
    if (formData.amount_tsh === '' || formData.amount_tsh < 0) {
      errors.amount_tsh = 'Amount TSH must be 0 or greater';
    }
    if (formData.population === '' || formData.population < 0) {
      errors.population = 'Population must be 0 or greater';
    }
    if (formData.waterpoint_age === '' || formData.waterpoint_age < 0) {
      errors.waterpoint_age = 'Age must be 0 or greater';
    }
    if (formData.latitude === '' || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
    if (formData.longitude === '' || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
    if (formData.gps_height === '') {
      errors.gps_height = 'GPS Height is required';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form className="prediction-form-wrapper" onSubmit={handleSubmit} noValidate>
      {/* Unified Predictor Tool Header & Quick-Fill Toolbar */}
      <div className="predictor-workspace-header">
        <div className="predictor-header-main">
          <div className="predictor-brand-row">
            <div className="predictor-badge-icon">
              <img src={logoImage} alt="WaterPoint AI Logo" className="predictor-logo-img" />
            </div>
            <div>
              <h1 className="predictor-workspace-title">Tanzania Waterpoint Status Predictor</h1>
              <p className="predictor-workspace-desc">
                Evaluate infrastructure failure risk across 18 operational indicators, or load a representative test case below.
              </p>
            </div>
          </div>
        </div>

        <div className="predictor-presets-bar">
          <span className="preset-bar-tag">Quick-Fill Field Cases:</span>
          <div className="preset-buttons-row">
            <button
              type="button"
              className="preset-btn"
              onClick={() => handleLoadPreset('functional')}
              disabled={isLoading}
              title="Load functional spring with gravity extraction in Rufiji"
            >
              <span className="preset-indicator green" />
              <span>Functional Case</span>
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => handleLoadPreset('needs_repair')}
              disabled={isLoading}
              title="Load waterpoint needing minor repair in Pangani"
            >
              <span className="preset-indicator amber" />
              <span>Needs Repair Case</span>
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => handleLoadPreset('non_functional')}
              disabled={isLoading}
              title="Load non-functional hand pump in Lake Victoria"
            >
              <span className="preset-indicator red" />
              <span>Non-Functional Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 1: Geographic & Location Information */}
      <div className="form-card-panel">
        <div className="panel-header">
          <div className="panel-badge">1</div>
          <div>
            <h2 className="panel-title">Location Information</h2>
            <p className="panel-subtitle">Geographical coordinates and administrative water basin identifiers</p>
          </div>
        </div>

        <div className="fields-grid grid-3">
          <div className="field-group">
            <label htmlFor="region">
              Region <span className="req-indicator">*</span>
            </label>
            <select
              id="region"
              name="region"
              className="field-control"
              value={formData.region}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.region || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Administrative region in Tanzania</span>
          </div>

          <div className="field-group">
            <label htmlFor="basin">
              Basin <span className="req-indicator">*</span>
            </label>
            <select
              id="basin"
              name="basin"
              className="field-control"
              value={formData.basin}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.basin || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Hydrographic water management basin</span>
          </div>

          <div className="field-group">
            <label htmlFor="gps_height">
              GPS Height <span className="req-indicator">*</span>
            </label>
            <input
              type="number"
              id="gps_height"
              name="gps_height"
              className="field-control"
              value={formData.gps_height}
              onChange={handleChange}
              disabled={isLoading}
              step="any"
              required
            />
            <span className="field-help-text">Elevation in meters above sea level</span>
            {clientErrors.gps_height && (
              <span className="field-error-msg">{clientErrors.gps_height}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="latitude">
              Latitude <span className="req-indicator">*</span>
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              className="field-control"
              value={formData.latitude}
              onChange={handleChange}
              disabled={isLoading}
              step="any"
              required
            />
            <span className="field-help-text">Decimal degrees (e.g., -9.856)</span>
            {clientErrors.latitude && (
              <span className="field-error-msg">{clientErrors.latitude}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="longitude">
              Longitude <span className="req-indicator">*</span>
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              className="field-control"
              value={formData.longitude}
              onChange={handleChange}
              disabled={isLoading}
              step="any"
              required
            />
            <span className="field-help-text">Decimal degrees (e.g., 34.938)</span>
            {clientErrors.longitude && (
              <span className="field-error-msg">{clientErrors.longitude}</span>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Infrastructure & Water Characteristics */}
      <div className="form-card-panel">
        <div className="panel-header">
          <div className="panel-badge">2</div>
          <div>
            <h2 className="panel-title">Waterpoint Information</h2>
            <p className="panel-subtitle">Physical infrastructure, extraction technology, and water availability metrics</p>
          </div>
        </div>

        <div className="fields-grid grid-4">
          <div className="field-group">
            <label htmlFor="waterpoint_age">
              Waterpoint Age <span className="req-indicator">*</span>
            </label>
            <input
              type="number"
              id="waterpoint_age"
              name="waterpoint_age"
              min="0"
              className="field-control"
              value={formData.waterpoint_age}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <span className="field-help-text">Years since original construction</span>
            {clientErrors.waterpoint_age && (
              <span className="field-error-msg">{clientErrors.waterpoint_age}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="population">
              Population <span className="req-indicator">*</span>
            </label>
            <input
              type="number"
              id="population"
              name="population"
              min="0"
              className="field-control"
              value={formData.population}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <span className="field-help-text">Estimated community population served</span>
            {clientErrors.population && (
              <span className="field-error-msg">{clientErrors.population}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="amount_tsh">
              Amount TSH <span className="req-indicator">*</span>
            </label>
            <input
              type="number"
              id="amount_tsh"
              name="amount_tsh"
              min="0"
              className="field-control"
              value={formData.amount_tsh}
              onChange={handleChange}
              disabled={isLoading}
              step="any"
              required
            />
            <span className="field-help-text">Total static head (water availability metric)</span>
            {clientErrors.amount_tsh && (
              <span className="field-error-msg">{clientErrors.amount_tsh}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="extraction_type_class">
              Extraction Type <span className="req-indicator">*</span>
            </label>
            <select
              id="extraction_type_class"
              name="extraction_type_class"
              className="field-control"
              value={formData.extraction_type_class}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.extraction_type_class || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Mechanical extraction method</span>
          </div>

          <div className="field-group">
            <label htmlFor="source_type">
              Source Type <span className="req-indicator">*</span>
            </label>
            <select
              id="source_type"
              name="source_type"
              className="field-control"
              value={formData.source_type}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.source_type || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Natural water supply source</span>
          </div>

          <div className="field-group">
            <label htmlFor="waterpoint_type_group">
              Waterpoint Type <span className="req-indicator">*</span>
            </label>
            <select
              id="waterpoint_type_group"
              name="waterpoint_type_group"
              className="field-control"
              value={formData.waterpoint_type_group}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.waterpoint_type_group || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Physical structure category</span>
          </div>

          <div className="field-group">
            <label htmlFor="quantity">
              Water Quantity <span className="req-indicator">*</span>
            </label>
            <select
              id="quantity"
              name="quantity"
              className="field-control"
              value={formData.quantity}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.quantity || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Supply adequacy observed on site</span>
          </div>

          <div className="field-group">
            <label htmlFor="quality_group">
              Water Quality <span className="req-indicator">*</span>
            </label>
            <select
              id="quality_group"
              name="quality_group"
              className="field-control"
              value={formData.quality_group}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.quality_group || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Water quality classification</span>
          </div>
        </div>
      </div>

      {/* Card 3: Governance & Operational Management */}
      <div className="form-card-panel">
        <div className="panel-header">
          <div className="panel-badge">3</div>
          <div>
            <h2 className="panel-title">Management Information</h2>
            <p className="panel-subtitle">Scheme governance, payment modalities, and community oversight</p>
          </div>
        </div>

        <div className="fields-grid grid-3">
          <div className="field-group">
            <label htmlFor="scheme_management">
              Scheme Management <span className="req-indicator">*</span>
            </label>
            <select
              id="scheme_management"
              name="scheme_management"
              className="field-control"
              value={formData.scheme_management}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.scheme_management || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Operating entity in charge</span>
          </div>

          <div className="field-group">
            <label htmlFor="management_group">
              Management Group <span className="req-indicator">*</span>
            </label>
            <select
              id="management_group"
              name="management_group"
              className="field-control"
              value={formData.management_group}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.management_group || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Governance organization tier</span>
          </div>

          <div className="field-group">
            <label htmlFor="payment_type">
              Payment Type <span className="req-indicator">*</span>
            </label>
            <select
              id="payment_type"
              name="payment_type"
              className="field-control"
              value={formData.payment_type}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.payment_type || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Tariff / fee payment schedule</span>
          </div>

          <div className="field-group">
            <label htmlFor="public_meeting">
              Public Meeting <span className="req-indicator">*</span>
            </label>
            <select
              id="public_meeting"
              name="public_meeting"
              className="field-control"
              value={formData.public_meeting}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.public_meeting || ['Yes', 'No', 'Missing']).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Community water governance meeting held</span>
          </div>

          <div className="field-group">
            <label htmlFor="permit">
              Permit <span className="req-indicator">*</span>
            </label>
            <select
              id="permit"
              name="permit"
              className="field-control"
              value={formData.permit}
              onChange={handleChange}
              disabled={isLoading}
            >
              {(categories.permit || ['Yes', 'No', 'Missing']).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Official water extraction permit status</span>
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="form-action-bar">
        <button
          type="button"
          id="btn-reset"
          className="btn-action btn-outline"
          onClick={handleReset}
          disabled={isLoading}
        >
          <span className="btn-icon">↺</span>
          <span>Reset Form</span>
        </button>

        <button
          type="submit"
          id="btn-predict"
          className="btn-action btn-submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner" />
              <span>Analyzing Waterpoint...</span>
            </>
          ) : (
            <>
              <span>Predict Status</span>
              <span className="btn-icon">→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
