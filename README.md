# Water Point Status Prediction System

An end-to-end Machine Learning and Data Mining system designed to predict the operational status of water points (Tanzania Water Table Challenge: *Functional*, *Non-Functional*, or *Functional Needs Repair*).

## Project Overview
Access to clean water is a crucial global challenge. This project leverages historical operational, geographical, and demographic data of water points across Tanzania to predict infrastructure failures before they disrupt local communities.

## Repository Architecture
```
waterpoint-status-prediction/
│
├── README.md
├── requirements.txt
├── .gitignore
│
├── data/
│   ├── raw/                  # Original immutable data dumps
│   ├── interim/              # Transformed & merged data
│   └── processed/            # Final model-ready train/test splits
│
├── notebooks/                # Jupyter notebooks for each project stage
│   ├── 01_data_understanding_eda.ipynb
│   ├── 02_preprocessing_feature_engineering.ipynb
│   ├── 03_model_development.ipynb
│   ├── 04_model_optimization.ipynb
│   └── 05_final_model_evaluation.ipynb
│
├── src/                      # Source code modules
│   ├── data/                 # Loading and dataset partitioning
│   ├── preprocessing/        # Data cleaning, encoding, feature engineering pipelines
│   ├── models/               # Model training scripts (4+ algorithms)
│   ├── evaluation/           # Metrics, comparative analysis, visualization
│   └── utils/                # Configuration and constant definitions
│
├── models/                   # Serialized pipeline & trained model artifacts (.pkl)
├── experiments/              # Benchmark tables and experiment result records
├── app/
│   ├── backend/              # FastAPI prediction service
│   └── frontend/             # Streamlit interactive UI application
├── tests/                    # Pytest test cases
├── reports/                  # Generated figures, tables, and technical report
├── presentation/             # Presentation slides and demo assets
└── docs/                     # Detailed domain & technical documentation
```

## Getting Started
1. Clone this repository.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Place the raw data files (`training_set_values.csv` and `training_set_labels.csv`) into `data/raw/`.
5. Run the frontend application:
   ```bash
   streamlit run app/frontend/app.py
   ```
