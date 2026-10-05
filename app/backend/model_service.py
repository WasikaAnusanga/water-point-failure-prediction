import logging
from pathlib import Path
from typing import Dict, List, Any
import joblib
import numpy as np
import pandas as pd
try:
    from app.backend.schemas import WaterPointInput, PredictionResponse, MetadataResponse
except ImportError:
    from schemas import WaterPointInput, PredictionResponse, MetadataResponse

logger = logging.getLogger("waterpoint_service")
logging.basicConfig(level=logging.INFO)

# 18 exact features in the order expected by the trained pipeline
ORDERED_MODEL_FEATURES: List[str] = [
    "amount_tsh",
    "gps_height",
    "longitude",
    "latitude",
    "population",
    "waterpoint_age",
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
]

NUMERICAL_FEATURES: List[str] = [
    "amount_tsh",
    "gps_height",
    "longitude",
    "latitude",
    "population",
    "waterpoint_age"
]

CATEGORICAL_FEATURES: List[str] = [
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
]


class ModelService:
    def __init__(self) -> None:
        self.model = None
        self.label_encoder = None
        self.target_classes: List[str] = []
        self.categorical_values: Dict[str, List[str]] = {}
        self._load_artifacts()

    def _resolve_models_dir(self) -> Path:
        # Resolve path relative to this file: app/backend/model_service.py -> root -> models
        current_file = Path(__file__).resolve()
        project_root = current_file.parents[2]
        models_dir = project_root / "models"
        
        if not models_dir.exists():
            # Fallback check relative to cwd
            cwd_models_dir = Path.cwd() / "models"
            if cwd_models_dir.exists():
                return cwd_models_dir
            raise FileNotFoundError(f"Models directory not found at {models_dir} or {cwd_models_dir}")
        
        return models_dir

    def _load_artifacts(self) -> None:
        models_dir = self._resolve_models_dir()
        model_path = models_dir / "final_xgboost_model.joblib"
        le_path = models_dir / "label_encoder.joblib"

        if not model_path.exists():
            raise FileNotFoundError(f"Model artifact not found at {model_path}")
        if not le_path.exists():
            raise FileNotFoundError(f"Label encoder artifact not found at {le_path}")

        logger.info(f"Loading final model from {model_path}...")
        self.model = joblib.load(model_path)
        logger.info("Model loaded successfully.")

        logger.info(f"Loading label encoder from {le_path}...")
        self.label_encoder = joblib.load(le_path)
        self.target_classes = [str(c) for c in self.label_encoder.classes_]
        logger.info(f"Label encoder loaded. Target classes: {self.target_classes}")

        # Extract categories directly from fitted OneHotEncoder inside pipeline
        self._extract_categories()

    def _extract_categories(self) -> None:
        try:
            preprocessor = self.model.named_steps["preprocessor"]
            cat_transformer = preprocessor.named_transformers_["cat"]
            encoder = cat_transformer.named_steps["encoder"]
            cat_cols = preprocessor.transformers_[1][2]
            
            for col_name, cats in zip(cat_cols, encoder.categories_):
                self.categorical_values[col_name] = [str(c) for c in cats]
        except Exception as e:
            logger.warning(f"Could not dynamically extract categories from pipeline: {e}")

    def predict(self, input_data: WaterPointInput) -> PredictionResponse:
        if self.model is None or self.label_encoder is None:
            raise RuntimeError("Model or LabelEncoder is not loaded.")

        # Convert validated Pydantic model into a dictionary
        input_dict = input_data.model_dump()
        
        # Enforce exact column list and ordering
        ordered_data = {col: [input_dict[col]] for col in ORDERED_MODEL_FEATURES}
        input_df = pd.DataFrame(ordered_data)

        # Run prediction through full sklearn Pipeline (preprocessor + XGBoost)
        pred_indices = self.model.predict(input_df)
        pred_label = self.label_encoder.inverse_transform(pred_indices)[0]

        # Calculate class probabilities
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(input_df)[0]
            prob_dict = {
                str(cls_name): round(float(prob), 4)
                for cls_name, prob in zip(self.label_encoder.classes_, probs)
            }
            confidence = round(float(np.max(probs)), 4)
        else:
            confidence = 1.0
            prob_dict = {str(cls_name): (1.0 if cls_name == pred_label else 0.0) for cls_name in self.label_encoder.classes_}

        return PredictionResponse(
            prediction=str(pred_label),
            confidence=confidence,
            probabilities=prob_dict
        )

    def get_metadata(self) -> MetadataResponse:
        return MetadataResponse(
            target_classes=self.target_classes,
            numerical_features=NUMERICAL_FEATURES,
            categorical_features=CATEGORICAL_FEATURES,
            ordered_feature_names=ORDERED_MODEL_FEATURES,
            categorical_values=self.categorical_values
        )


# Global singleton instance loaded once at startup
model_service = ModelService()
