const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

export const FALLBACK_METADATA = {
  target_classes: ["functional", "functional needs repair", "non functional"],
  numerical_features: [
    "amount_tsh",
    "gps_height",
    "longitude",
    "latitude",
    "population",
    "waterpoint_age"
  ],
  categorical_features: [
    "basin",
    "region",
    "public_meeting",
    "scheme_management",
    "permit",
    "management_group",
    "payment_type",
    "extraction_type_class",
    "quality_group",
    "quantity",
    "source_type",
    "waterpoint_type_group"
  ],
  categorical_values: {
    basin: [
      "Internal",
      "Lake Nyasa",
      "Lake Rukwa",
      "Lake Tanganyika",
      "Lake Victoria",
      "Pangani",
      "Rufiji",
      "Ruvuma / Southern Coast",
      "Wami / Ruvu"
    ],
    region: [
      "Arusha",
      "Dar es Salaam",
      "Dodoma",
      "Iringa",
      "Kagera",
      "Kigoma",
      "Kilimanjaro",
      "Lindi",
      "Manyara",
      "Mara",
      "Mbeya",
      "Morogoro",
      "Mtwara",
      "Mwanza",
      "Pwani",
      "Rukwa",
      "Ruvuma",
      "Shinyanga",
      "Singida",
      "Tabora",
      "Tanga"
    ],
    public_meeting: ["Yes", "No", "Missing"],
    scheme_management: [
      "Company",
      "Missing",
      "Other",
      "Parastatal",
      "Private operator",
      "SWC",
      "Trust",
      "VWC",
      "WUA",
      "WUG",
      "Water Board",
      "Water authority"
    ],
    permit: ["Yes", "No", "Missing"],
    management_group: [
      "commercial",
      "other",
      "parastatal",
      "unknown",
      "user-group"
    ],
    payment_type: [
      "annually",
      "monthly",
      "never pay",
      "on failure",
      "other",
      "per bucket",
      "unknown"
    ],
    extraction_type_class: [
      "gravity",
      "handpump",
      "motorpump",
      "other",
      "rope pump",
      "submersible",
      "wind-powered"
    ],
    quality_group: [
      "colored",
      "fluoride",
      "good",
      "milky",
      "salty",
      "unknown"
    ],
    quantity: [
      "dry",
      "enough",
      "insufficient",
      "seasonal",
      "unknown"
    ],
    source_type: [
      "borehole",
      "dam",
      "other",
      "rainwater harvesting",
      "river/lake",
      "shallow well",
      "spring"
    ],
    waterpoint_type_group: [
      "cattle trough",
      "communal standpipe",
      "dam",
      "hand pump",
      "improved spring",
      "other"
    ]
  }
};

/**
 * Fetch model metadata and valid category values
 */
export async function getMetadata() {
  try {
    const res = await fetch(`${API_BASE_URL}/metadata`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`Failed to load metadata: HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Using fallback metadata due to fetch error:', err);
    return FALLBACK_METADATA;
  }
}

/**
 * Check backend health status
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch (err) {
    return false;
  }
}

/**
 * Send water point record for prediction
 */
export async function predictWaterPoint(payload) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (netErr) {
    throw new Error(`Backend service is unavailable at ${API_BASE_URL}. Please ensure the prediction server is running.`);
  }

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 422 && data.errors) {
      const msgs = data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation Error: ${msgs}`);
    }
    throw new Error(data.detail || `Server returned error (${res.status})`);
  }

  return data;
}

/**
 * Register a new user in MongoDB Atlas
 */
export async function signUpUser({ name, organization, email, password }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, organization, email, password })
    });
  } catch (err) {
    throw new Error(`Connection error: Could not reach backend server at ${API_BASE_URL}.`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Sign up failed.');
  }

  return data;
}

/**
 * Sign in existing user with MongoDB Atlas credentials
 */
export async function signInUser({ email, password }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
  } catch (err) {
    throw new Error(`Connection error: Could not reach backend server at ${API_BASE_URL}.`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Sign in failed.');
  }

  return data;
}

/**
 * Fetch current user profile using JWT token
 */
export async function fetchCurrentUser(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export { API_BASE_URL };

