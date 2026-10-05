import logging
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

try:
    from app.backend.schemas import (
        WaterPointInput,
        PredictionResponse,
        HealthResponse,
        MetadataResponse
    )
    from app.backend.model_service import model_service
except ImportError:
    from schemas import (
        WaterPointInput,
        PredictionResponse,
        HealthResponse,
        MetadataResponse
    )
    from model_service import model_service

logger = logging.getLogger("waterpoint_api")

app = FastAPI(
    title="Tanzania Water Point Status Prediction API",
    description="Machine Learning prediction service for classifying water point operational status.",
    version="1.0.0"
)

# Allowed origins for frontend clients (Vite, React, local dev)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8501",
    "http://127.0.0.1:8501"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid value")
        error_details.append({
            "field": field,
            "message": msg,
            "type": err.get("type", "validation_error")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation error. Please check the provided feature values.",
            "errors": error_details
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error during request processing: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal error occurred during prediction. Please verify input data and try again."
        }
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Check API health and model readiness",
    tags=["System"]
)
def get_health() -> HealthResponse:
    if model_service.model is None or model_service.label_encoder is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model service is not fully initialized."
        )
    return HealthResponse(status="ok")


@app.get(
    "/metadata",
    response_model=MetadataResponse,
    summary="Get model metadata, feature definitions, and valid categorical options",
    tags=["Metadata"]
)
def get_metadata() -> MetadataResponse:
    try:
        return model_service.get_metadata()
    except Exception as e:
        logger.error(f"Error fetching metadata: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve model metadata."
        )


@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict operational status of a water point",
    tags=["Prediction"]
)
def predict_water_point_status(input_data: WaterPointInput) -> PredictionResponse:
    try:
        return model_service.predict(input_data)
    except ValueError as ve:
        logger.warning(f"Value error during prediction: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute model prediction pipeline."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.backend.main:app", host="127.0.0.1", port=8000, reload=True)
