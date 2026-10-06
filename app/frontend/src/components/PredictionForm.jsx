import React, { useState } from 'react';
import logoImage from '../assets/logo.png';

const INITIAL_FORM_STATE = {
  // 1. Location
  region: '',
  basin: '',
  latitude: '',
  longitude: '',
  gps_height: '',

  // 2. Waterpoint Information
  waterpoint_age: '',
  population: '',
  amount_tsh: '',
  extraction_type_class: '',
  source_type: '',
  waterpoint_type_group: '',
  quantity: '',
  quality_group: '',

  // 3. Management Information
  scheme_management: '',
  management_group: '',
  payment_type: '',
  public_meeting: '',
  permit: ''
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

    // 1. Location
    if (!formData.region) {
      errors.region = 'Region is required';
    }
    if (!formData.basin) {
      errors.basin = 'Basin is required';
    }
    if (formData.gps_height === '' || formData.gps_height === null || isNaN(formData.gps_height)) {
      errors.gps_height = 'GPS Height is required';
    }
    if (formData.latitude === '' || formData.latitude === null || isNaN(formData.latitude)) {
      errors.latitude = 'Latitude is required';
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
    if (formData.longitude === '' || formData.longitude === null || isNaN(formData.longitude)) {
      errors.longitude = 'Longitude is required';
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }

    // 2. Waterpoint Information
    if (formData.waterpoint_age === '' || formData.waterpoint_age === null || isNaN(formData.waterpoint_age)) {
      errors.waterpoint_age = 'Age is required';
    } else if (formData.waterpoint_age < 0) {
      errors.waterpoint_age = 'Age must be 0 or greater';
    }
    if (formData.population === '' || formData.population === null || isNaN(formData.population)) {
      errors.population = 'Population is required';
    } else if (formData.population < 0) {
      errors.population = 'Population must be 0 or greater';
    }
    if (formData.amount_tsh === '' || formData.amount_tsh === null || isNaN(formData.amount_tsh)) {
      errors.amount_tsh = 'Amount TSH is required';
    } else if (formData.amount_tsh < 0) {
      errors.amount_tsh = 'Amount TSH must be 0 or greater';
    }
    if (!formData.extraction_type_class) {
      errors.extraction_type_class = 'Extraction type is required';
    }
    if (!formData.source_type) {
      errors.source_type = 'Source type is required';
    }
    if (!formData.waterpoint_type_group) {
      errors.waterpoint_type_group = 'Waterpoint type is required';
    }
    if (!formData.quantity) {
      errors.quantity = 'Water quantity is required';
    }
    if (!formData.quality_group) {
      errors.quality_group = 'Water quality is required';
    }

    // 3. Management Information
    if (!formData.scheme_management) {
      errors.scheme_management = 'Scheme management is required';
    }
    if (!formData.management_group) {
      errors.management_group = 'Management group is required';
    }
    if (!formData.payment_type) {
      errors.payment_type = 'Payment type is required';
    }
    if (!formData.public_meeting) {
      errors.public_meeting = 'Public meeting status is required';
    }
    if (!formData.permit) {
      errors.permit = 'Permit status is required';
    }

    setClientErrors(errors);
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      // Find the first erroneous field according to the DOM order
      const fieldOrder = [
        'region',
        'basin',
        'gps_height',
        'latitude',
        'longitude',
        'waterpoint_age',
        'population',
        'amount_tsh',
        'extraction_type_class',
        'source_type',
        'waterpoint_type_group',
        'quantity',
        'quality_group',
        'scheme_management',
        'management_group',
        'payment_type',
        'public_meeting',
        'permit'
      ];

      const firstErrorField = fieldOrder.find(field => errors[field]) || errorKeys[0];

      // Automatically scroll smoothly to the invalid input field and focus on it
      setTimeout(() => {
        const targetElement = document.getElementById(firstErrorField) || document.querySelector(`[name="${firstErrorField}"]`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetElement.focus({ preventScroll: true });
        }
      }, 50);
      return;
    }

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
              className={`field-control ${clientErrors.region ? 'has-error' : ''}`}
              value={formData.region}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Region</option>
              {(categories.region || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Administrative region in Tanzania</span>
            {clientErrors.region && (
              <span className="field-error-msg">{clientErrors.region}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="basin">
              Basin <span className="req-indicator">*</span>
            </label>
            <select
              id="basin"
              name="basin"
              className={`field-control ${clientErrors.basin ? 'has-error' : ''}`}
              value={formData.basin}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Basin</option>
              {(categories.basin || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Hydrographic water management basin</span>
            {clientErrors.basin && (
              <span className="field-error-msg">{clientErrors.basin}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="gps_height">
              GPS Height <span className="req-indicator">*</span>
            </label>
            <input
              type="number"
              id="gps_height"
              name="gps_height"
              placeholder="e.g. 1390"
              className={`field-control ${clientErrors.gps_height ? 'has-error' : ''}`}
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
              placeholder="e.g. -9.856"
              className={`field-control ${clientErrors.latitude ? 'has-error' : ''}`}
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
              placeholder="e.g. 34.938"
              className={`field-control ${clientErrors.longitude ? 'has-error' : ''}`}
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
              placeholder="e.g. 12"
              min="0"
              className={`field-control ${clientErrors.waterpoint_age ? 'has-error' : ''}`}
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
              placeholder="e.g. 109"
              min="0"
              className={`field-control ${clientErrors.population ? 'has-error' : ''}`}
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
              placeholder="e.g. 50"
              min="0"
              className={`field-control ${clientErrors.amount_tsh ? 'has-error' : ''}`}
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
              className={`field-control ${clientErrors.extraction_type_class ? 'has-error' : ''}`}
              value={formData.extraction_type_class}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Extraction Type</option>
              {(categories.extraction_type_class || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Mechanical extraction method</span>
            {clientErrors.extraction_type_class && (
              <span className="field-error-msg">{clientErrors.extraction_type_class}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="source_type">
              Source Type <span className="req-indicator">*</span>
            </label>
            <select
              id="source_type"
              name="source_type"
              className={`field-control ${clientErrors.source_type ? 'has-error' : ''}`}
              value={formData.source_type}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Source Type</option>
              {(categories.source_type || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Natural water supply source</span>
            {clientErrors.source_type && (
              <span className="field-error-msg">{clientErrors.source_type}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="waterpoint_type_group">
              Waterpoint Type <span className="req-indicator">*</span>
            </label>
            <select
              id="waterpoint_type_group"
              name="waterpoint_type_group"
              className={`field-control ${clientErrors.waterpoint_type_group ? 'has-error' : ''}`}
              value={formData.waterpoint_type_group}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Waterpoint Type</option>
              {(categories.waterpoint_type_group || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Physical structure category</span>
            {clientErrors.waterpoint_type_group && (
              <span className="field-error-msg">{clientErrors.waterpoint_type_group}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="quantity">
              Water Quantity <span className="req-indicator">*</span>
            </label>
            <select
              id="quantity"
              name="quantity"
              className={`field-control ${clientErrors.quantity ? 'has-error' : ''}`}
              value={formData.quantity}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Water Quantity</option>
              {(categories.quantity || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Supply adequacy observed on site</span>
            {clientErrors.quantity && (
              <span className="field-error-msg">{clientErrors.quantity}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="quality_group">
              Water Quality <span className="req-indicator">*</span>
            </label>
            <select
              id="quality_group"
              name="quality_group"
              className={`field-control ${clientErrors.quality_group ? 'has-error' : ''}`}
              value={formData.quality_group}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Water Quality</option>
              {(categories.quality_group || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Water quality classification</span>
            {clientErrors.quality_group && (
              <span className="field-error-msg">{clientErrors.quality_group}</span>
            )}
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
              className={`field-control ${clientErrors.scheme_management ? 'has-error' : ''}`}
              value={formData.scheme_management}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Scheme Management</option>
              {(categories.scheme_management || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Operating entity in charge</span>
            {clientErrors.scheme_management && (
              <span className="field-error-msg">{clientErrors.scheme_management}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="management_group">
              Management Group <span className="req-indicator">*</span>
            </label>
            <select
              id="management_group"
              name="management_group"
              className={`field-control ${clientErrors.management_group ? 'has-error' : ''}`}
              value={formData.management_group}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Management Group</option>
              {(categories.management_group || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Governance organization tier</span>
            {clientErrors.management_group && (
              <span className="field-error-msg">{clientErrors.management_group}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="payment_type">
              Payment Type <span className="req-indicator">*</span>
            </label>
            <select
              id="payment_type"
              name="payment_type"
              className={`field-control ${clientErrors.payment_type ? 'has-error' : ''}`}
              value={formData.payment_type}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Payment Type</option>
              {(categories.payment_type || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Tariff / fee payment schedule</span>
            {clientErrors.payment_type && (
              <span className="field-error-msg">{clientErrors.payment_type}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="public_meeting">
              Public Meeting <span className="req-indicator">*</span>
            </label>
            <select
              id="public_meeting"
              name="public_meeting"
              className={`field-control ${clientErrors.public_meeting ? 'has-error' : ''}`}
              value={formData.public_meeting}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Option</option>
              {(categories.public_meeting || ['Yes', 'No', 'Missing']).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Community water governance meeting held</span>
            {clientErrors.public_meeting && (
              <span className="field-error-msg">{clientErrors.public_meeting}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="permit">
              Permit <span className="req-indicator">*</span>
            </label>
            <select
              id="permit"
              name="permit"
              className={`field-control ${clientErrors.permit ? 'has-error' : ''}`}
              value={formData.permit}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select Option</option>
              {(categories.permit || ['Yes', 'No', 'Missing']).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="field-help-text">Official water extraction permit status</span>
            {clientErrors.permit && (
              <span className="field-error-msg">{clientErrors.permit}</span>
            )}
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
