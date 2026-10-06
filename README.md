# Tanzania Waterpoint Status Prediction and Maintenance Prioritization

An end-to-end Machine Learning and Decision-Support System developed for the **IT3051 Fundamentals of Data Mining** Mini Project to predict the operational condition of water points across Tanzania.

> **Operational Notice:** This system is an academic decision-support prototype intended to assist planning teams in prioritizing field maintenance. It does **not** guarantee pump failure or maintenance requirements and should **never replace** physical field inspection and professional engineering assessment.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Stakeholders](#3-stakeholders)
4. [Dataset](#4-dataset)
5. [Target Classes](#5-target-classes)
6. [EDA Overview](#6-eda-overview)
7. [Preprocessing and Feature Engineering](#7-preprocessing-and-feature-engineering)
8. [Final Input Features](#8-final-input-features)
9. [Models Evaluated](#9-models-evaluated)
10. [Model Optimization](#10-model-optimization)
11. [Final Model Performance](#11-final-model-performance)
12. [Application Architecture](#12-application-architecture)
13. [Project Structure](#13-project-structure)
14. [Backend Setup](#14-backend-setup)
15. [Frontend Setup](#15-frontend-setup)
16. [Running the Full Application](#16-running-the-full-application)
17. [API Endpoints](#17-api-endpoints)
18. [Example Prediction Request](#18-example-prediction-request)
19. [Testing](#19-testing)
20. [Limitations](#20-limitations)
21. [Ethical/Operational Considerations](#21-ethicaloperational-considerations)
22. [Future Improvements](#22-future-improvements)

---

## 1. Project Overview

Access to potable water remains a critical challenge across developing nations. In Tanzania, thousands of rural and semi-urban water points fall out of service due to mechanical failure, infrastructure ageing, resource depletion, or lack of maintenance governance. 

This project develops an end-to-end machine learning solution that leverages historical geographic, demographic, technical, and administrative data from water points across Tanzania. The system provides a web-based decision-support tool that allows technical officers, regional planners, and NGOs to assess water point operational vulnerability and allocate inspection resources effectively.

---

## 2. Problem Statement

Manual physical inspection across widely dispersed geographic terrain in Tanzania is cost-prohibitive and reactive, often leaving communities without water for prolonged intervals after breakdowns occur. 

The machine learning objective is to solve a **multiclass classification problem**: accurately predicting whether a given waterpoint is:
- **`functional`** (operating normally),
- **`functional needs repair`** (operating with defects or constrained yield), or
- **`non functional`** (completely broken down or dry).

Accurately distinguishing the minority class (**`functional needs repair`**) is particularly vital to enable **preventative maintenance** before catastrophic failure occurs.

---

## 3. Stakeholders

- **Ministry of Water & Irrigation (Tanzania):** Regional water boards and basin water offices planning preventative maintenance budgets and technician deployment.
- **Local Government Authorities & Community Water Committees (COWSOs / VWCs):** Village-level operators monitoring local extraction points and tracking scheme sustainability.
- **NGOs and International Development Agencies:** Aid organizations prioritizing capital investment and rehabilitation funding for vulnerable communities.
- **Field Inspection Technicians:** Maintenance crews receiving prioritized target lists rather than conducting unguided manual surveys.

---

## 4. Dataset

The project utilizes data from the **Taarifa water table platform** and the **Tanzanian Ministry of Water**, popularized by DrivenData's *Pump it Up: Data Mining the Water Table* challenge:

- **Total Observations:** 59,400 water points
- **Raw Features:** 40 recorded variables covering geographic coordinates, extraction technology, water source, management, payment modalities, and installation dates
- **Dataset Partitioning:** 80:20 stratified split
  - **Training Set:** 47,520 observations (`data/processed/train_model_data.csv`)
  - **Independent Test Set:** 11,880 observations (`data/processed/test_model_data.csv`)

---

## 5. Target Classes

The target variable `status_group` consists of three classes with pronounced class imbalance:

| Target Class | Training Support | Test Support | Total Observations | Class Distribution |
| :--- | :---: | :---: | :---: | :---: |
| **`functional`** | 25,807 | 6,452 | 32,259 | 54.3% |
| **`non functional`** | 18,259 | 4,565 | 22,824 | 38.4% |
| **`functional needs repair`** | 3,454 | 863 | 4,317 | 7.3% |
| **Total** | **47,520** | **11,880** | **59,400** | **100.0%** |

The minority status of `functional needs repair` (only 7.3% of the dataset) creates a substantial class imbalance challenge, requiring specialized evaluation metrics (Macro F1, Macro Recall) and class weighting during optimization.

---

## 6. EDA Overview

Key findings from exploratory data analysis (`notebooks/01_EDA_Water_Point_Status.ipynb`):

1. **Water Quantity is the Strongest Predictor:** Waterpoints where water quantity is recorded as `'dry'` are overwhelmingly `'non functional'` (>95% failure rate).
2. **Infrastructure Age Correlates with Breakdown:** Older water points (installed in the 1970s–1990s) exhibit significantly higher failure probabilities than recently constructed schemes.
3. **Extraction Mechanism Impact:** Gravity schemes and communal standpipes demonstrate higher operational reliability, whereas motorized pumps and unprotected submersibles experience elevated failure rates.
4. **Payment Model Correlation:** Schemes operating on `'never pay'` models exhibit higher non-functional rates compared to waterpoints with `'monthly'` or `'per bucket'` cost recovery mechanisms.
5. **Data Quality Issues:** 
   - Over 20,000 records contained `construction_year = 0` (missing data placeholder).
   - Coordinate records contained invalid `0.0` latitude and longitude coordinates outside Tanzania's boundaries.

---

## 7. Preprocessing and Feature Engineering

Data preparation was established in `notebooks/02_Preprocessing_Feature_Engineering.ipynb` with strict leakage prevention:

1. **Identifier and Redundancy Removal:** Removed unique ID (`id`), redundant hierarchical groupings (`scheme_name`, `subvillage`, `ward`, `lga`), and duplicate feature representations (`extraction_type_group`, `source_class`, `water_quality`).
2. **Invalid Value Handling:**
   - Invalid `construction_year = 0` was converted to `NaN` instead of dropping observations.
   - Erroneous coordinates (`latitude = 0.0`, `longitude = 0.0`) were replaced with `NaN`.
3. **Feature Engineering (`waterpoint_age`):** Derived the infrastructure age using observation date and construction year:
   $$\text{waterpoint\_age} = \text{record\_year} - \text{construction\_year}$$
4. **Data Leakage Controls:**
   - Numerical missing values imputed via **median imputation** learned strictly from training data.
   - Categorical missing values explicitly encoded as **`"Missing"`** to preserve missingness information.
   - Numerical standardization via **`StandardScaler`**.
   - Categorical encoding via **`OneHotEncoder(drop='first', handle_unknown='ignore')`**, yielding 85 post-transformation features.
   - Preprocessing pipeline serialized into `models/preprocessor.joblib`.

---

## 8. Final Input Features

The trained pipeline expects exactly **18 raw input features**:

### Numerical Features (6)
1. `amount_tsh`: Total static head / water available metric (float)
2. `gps_height`: Altitude of the well in meters above sea level (float/int)
3. `longitude`: GPS longitude coordinate in decimal degrees (float)
4. `latitude`: GPS latitude coordinate in decimal degrees (float)
5. `population`: Community population surrounding the waterpoint (float/int)
6. `waterpoint_age`: Operational age in years (float/int)

### Categorical Features (12)
7. `basin`: Geographic hydrological basin (9 categories)
8. `region`: Administrative region in Tanzania (21 categories)
9. `public_meeting`: Whether community water meetings are convened (`Yes`, `No`, `Missing`)
10. `scheme_management`: Entity operating the water scheme (12 categories)
11. `permit`: Water extraction permit status (`Yes`, `No`, `Missing`)
12. `management_group`: High-level management category (5 categories)
13. `payment_type`: Cost recovery and fee schedule (7 categories)
14. `extraction_type_class`: Extraction mechanical class (7 categories)
15. `quality_group`: Water quality assessment (6 categories)
16. `quantity`: Water adequacy at inspection (5 categories)
17. `source_type`: Raw water source (7 categories)
18. `waterpoint_type_group`: Physical structure of the waterpoint (6 categories)

---

## 9. Models Evaluated

Four baseline algorithms were trained and evaluated using 5-fold stratified cross-validation on the training dataset (`notebooks/03_Model_Development.ipynb`):

| Model | CV Accuracy | CV Macro F1 | CV Weighted F1 | CV Macro Recall | Train Macro F1 | Mean Fit Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Baseline)** | **0.7957** | **0.6696** | 0.7863 | 0.6436 | 0.8008 | 1.83s |
| **Random Forest (Baseline)** | 0.7938 | 0.6751 | **0.7878** | **0.6568** | 0.9884 (Overfit) | 17.05s |
| **Decision Tree** | 0.7459 | 0.6344 | 0.7460 | 0.6347 | 0.9885 | 4.13s |
| **Logistic Regression** | 0.7295 | 0.5140 | 0.7013 | 0.5173 | 0.5158 | 1.82s |

---

## 10. Model Optimization

Optimization focused on resolving class imbalance and improving the detection of `functional needs repair` (`notebooks/04_Model_Optimization.ipynb`):

1. **Class Weighting Strategy:** Investigated standard inverse class weighting vs. moderate square-root class weighting:
   $$w_c = \sqrt{\frac{N}{3 \cdot N_c}}$$
   Standard inverse weighting caused excessive precision degradation; square-root weighting provided a balanced recall/precision trade-off.
2. **Subsampling and Regularization:** Applied row subsampling (`subsample=0.8`) and feature subsampling (`colsample_bytree=0.8`) with histogram tree method (`tree_method='hist'`) to curb tree overfitting.
3. **Selected Final Algorithm:** **Tuned XGBoost** (`n_estimators=200`, `subsample=0.8`, `colsample_bytree=0.8`, moderate sample weights).

---

## 11. Final Model Performance

The final selected model was verified against the **held-out independent test set** of 11,880 observations (`results/final_model_test_metrics.csv`):

### Overall Independent Test Metrics
| Metric | Score |
| :--- | :---: |
| **Test Accuracy** | **0.7863 (78.63%)** |
| **Macro F1-Score** | **0.6926 (69.26%)** |
| **Weighted F1-Score** | **0.7888 (78.88%)** |
| **Macro Recall** | **0.7023 (70.23%)** |

### Per-Class Performance Breakdown
| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **`functional`** | 0.8175 | 0.8379 | 0.8276 | 6,452 |
| **`functional needs repair`** | **0.4124** | **0.5017** | **0.4527** | 863 |
| **`non functional`** | 0.8304 | 0.7671 | 0.7975 | 4,565 |
| **Macro Average** | **0.6868** | **0.7023** | **0.6926** | 11,880 |
| **Weighted Average** | **0.7930** | **0.7863** | **0.7888** | 11,880 |

The repair-class recall reached **50.17%** (over half of all degrading waterpoints correctly flagged for preventative maintenance) with 78.63% overall system accuracy.

---

## 12. Application Architecture

The deployed solution is structured into a lightweight decoupled architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite UI                      │
│   (Plus Jakarta Sans, Grouped Cards, Preset Buttons)   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /predict
                           ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Service                      │
│        (Pydantic v2 Validation, CORS, Routing)         │
└──────────────────────────┬─────────────────────────────┘
                           │ 18-Feature DataFrame
                           ▼
┌────────────────────────────────────────────────────────┐
│         models/final_xgboost_model.joblib              │
│  ┌───────────────────────┬──────────────────────────┐  │
│  │ ColumnTransformer     │ XGBClassifier            │  │
│  │ (Median Imputation,   │ (200 Trees, Histogram,   │  │
│  │  StandardScaler,      │  Multi:softprob)         │  │
│  │  OneHotEncoder)       │                          │  │
│  └───────────────────────┴──────────────────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │ Raw integer prediction
                           ▼
┌────────────────────────────────────────────────────────┐
│             models/label_encoder.joblib                │
│     (Decodes class 0, 1, 2 -> Human readable status)   │
└────────────────────────────────────────────────────────┘
```

---

## 13. Project Structure

```
water-point-failure/
├── README.md                           # Master project documentation
├── requirements.txt                    # Project-level dependencies
├── data/
│   ├── raw/                            # Original challenge data
│   └── processed/                      # Model-ready train/test splits
│       ├── train_model_data.csv        # 47,520 training records
│       └── test_model_data.csv         # 11,880 test records
├── models/
│   ├── final_xgboost_model.joblib      # Tuned full pipeline (preprocessor + XGBoost)
│   ├── label_encoder.joblib            # Target class string decoder
│   ├── preprocessor.joblib             # Standalone fitted transformer
│   ├── processed_feature_names.csv     # 85 post-encoding feature names
│   └── best_baseline_model.joblib      # Random Forest reference model
├── notebooks/
│   ├── 01_EDA_Water_Point_Status.ipynb
│   ├── 02_Preprocessing_Feature_Engineering.ipynb
│   ├── 03_Model_Development.ipynb
│   └── 04_Model_Optimization.ipynb
├── results/
│   ├── baseline_model_results.csv
│   ├── best_baseline_classification_report.csv
│   ├── final_model_classification_report.csv
│   └── final_model_test_metrics.csv
└── app/
    ├── backend/
    │   ├── __init__.py
    │   ├── main.py                     # FastAPI application & endpoints
    │   ├── schemas.py                  # Pydantic validation models
    │   ├── model_service.py            # Artifact loader & prediction service
    │   └── requirements.txt            # Backend dependencies
    └── frontend/
        ├── .env                        # Environment variables
        ├── .env.example
        ├── index.html                  # HTML entry with Plus Jakarta Sans
        ├── package.json
        ├── vite.config.js
        ├── test-e2e.js                 # Automated headless E2E verification
        └── src/
            ├── App.jsx                 # Coordinator component
            ├── index.css               # Clean academic design system
            ├── api.js                  # Frontend API client
            └── components/
                ├── Header.jsx          # Title and service status pill
                ├── PredictionForm.jsx  # 3-section grouped form with presets
                └── ResultCard.jsx      # Status badge, confidence & probabilities
```

---

## 14. Backend Setup

### Prerequisites
- Python 3.11+ or 3.12+ (Anaconda recommended)

### Installation
From the project root:

```bash
# Activate existing conda environment or virtual environment
conda activate mlom-en
# OR:
# python -m venv venv
# venv\Scripts\activate   (Windows)
# source venv/bin/activate (Linux/macOS)

# Install backend dependencies
pip install -r app/backend/requirements.txt
```

---

## 15. Frontend Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
From the project root:

```bash
cd app/frontend
npm install
```

---

## 16. Running the Full Application

### Step 1: Start the FastAPI Backend
Open a terminal in the project root:

```bash
uvicorn app.backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health Check: `http://127.0.0.1:8000/health`
- Interactive OpenAPI Swagger Docs: `http://127.0.0.1:8000/docs`

### Step 2: Start the React Frontend
Open a second terminal:

```bash
cd app/frontend
npm run dev
```
- Frontend UI: `http://127.0.0.1:5173/`

---

## 17. API Endpoints

### 1. `GET /health`
Verifies API status and confirms model artifacts are loaded in memory.
- **Response (200 OK):**
  ```json
  { "status": "ok" }
  ```

### 2. `GET /metadata`
Returns target class definitions, feature groupings, and all valid category options extracted from the fitted encoder.
- **Response (200 OK):**
  ```json
  {
    "target_classes": ["functional", "functional needs repair", "non functional"],
    "numerical_features": ["amount_tsh", "gps_height", "longitude", "latitude", "population", "waterpoint_age"],
    "categorical_features": ["basin", "region", "public_meeting", "scheme_management", "permit", "management_group", "payment_type", "extraction_type_class", "quality_group", "quantity", "source_type", "waterpoint_type_group"],
    "ordered_feature_names": ["... 18 ordered features ..."],
    "categorical_values": { ... }
  }
  ```

### 3. `POST /predict`
Validates 18 input features and executes inference through the serialized XGBoost pipeline.
- **Status Codes:** `200 OK`, `422 Unprocessable Content` (Validation Error), `500 Internal Error`.

---

## 18. Example Prediction Request

### Endpoint: `POST http://127.0.0.1:8000/predict`

#### Request Payload:
```json
{
  "amount_tsh": 50.0,
  "gps_height": 1390.0,
  "longitude": 34.938093,
  "latitude": -9.856322,
  "population": 109.0,
  "waterpoint_age": 12.0,
  "basin": "Lake Nyasa",
  "region": "Iringa",
  "public_meeting": "Yes",
  "scheme_management": "VWC",
  "permit": "No",
  "management_group": "user-group",
  "payment_type": "never pay",
  "extraction_type_class": "gravity",
  "quality_group": "good",
  "quantity": "enough",
  "source_type": "spring",
  "waterpoint_type_group": "communal standpipe"
}
```

#### Response Body:
```json
{
  "prediction": "functional",
  "confidence": 0.8864,
  "probabilities": {
    "functional": 0.8864,
    "functional needs repair": 0.0679,
    "non functional": 0.0457
  }
}
```

---

## 19. Testing

The repository incorporates automated test suites covering unit constraints, API endpoints, model parity, and end-to-end browser workflows:

### Backend Test Suite
Executes 10 validation tests verifying health checks, metadata synchronization, negative numerical rejections, unsupported category handling, and exact 18-column DataFrame reconstruction:
```bash
python -c "import httpx; print(httpx.get('http://127.0.0.1:8000/health').json())"
```

### End-to-End Headless Verification
Runs 12 automated headless browser tests via Edge/Puppeteer verifying form rendering, preset population, button loading guards, responsive layout adaptation, and offline error banners:
```bash
cd app/frontend
node test-e2e.js
```

---

## 20. Limitations

1. **Static Historical Snapshot:** The model reflects waterpoint conditions at the time of survey recording and does not dynamically account for real-time weather shocks or sudden seasonal flooding.
2. **Missing Construction Data:** Substantial records originally had unknown construction years requiring median imputation, which can attenuate age-based predictive power for certain remote districts.
3. **Repair Class Precision Trade-off:** While repair recall is 50.17%, repair precision is 41.24%. Some functional waterpoints may be flagged for inspection that require only minor servicing rather than major repairs.
4. **Geographic Coverage Heterogeneity:** Some remote border regions have fewer survey observations, leading to slightly lower localized model confidence compared to heavily surveyed regions like Iringa or Kilimanjaro.

---

## 21. Ethical/Operational Considerations

- **Decision-Support Guardrail:** Machine learning scores must serve as advisory triage tools to schedule technician routes, not as autonomous justifications to disconnect or de-prioritize water infrastructure.
- **Equity in Resource Allocation:** Predictive models trained on historical data risk perpetuating past reporting biases (e.g., wealthier or more accessible regions having more frequent survey updates). Technicians should combine predictions with equitable geographical rotation.
- **Transparency for Non-Technical Users:** The application deliberately avoids opaque raw feature encodings or misleading probability rounding, presenting human-understandable guidance with explicit disclaimers.

---

## 22. Future Improvements

1. **Spatial Geospatial Modeling:** Integrating spatial autocorrelation (Moran's I) and regional distance-to-fault features to capture localized aquifer depletion patterns.
2. **Batch CSV Uploading:** Expanding the backend and frontend to support bulk uploads for district-wide survey files with automated Excel export.
3. **Mobile Field PWA:** Converting the frontend to a Progressive Web App (PWA) with offline caching and SQLite storage for field officers operating without cellular coverage.
4. **Sensor Telemetry Integration:** Incorporating continuous IoT pressure and flow sensor data where smart water metering pilot programs exist in Tanzania.

---

*Decision-support prototype developed for the IT3051 Fundamentals of Data Mining Mini Project.*  
*Predictions should support, not replace, field inspection and professional engineering assessment.*
