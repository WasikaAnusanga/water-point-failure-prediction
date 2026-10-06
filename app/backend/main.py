import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Request, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

try:
    from app.backend.schemas import (
        WaterPointInput,
        PredictionResponse,
        HealthResponse,
        MetadataResponse,
        UserSignUp,
        UserLogin,
        UserProfile,
        AuthResponse
    )
    from app.backend.model_service import model_service
    from app.backend.auth_service import (
        register_new_user,
        authenticate_user,
        get_current_user_profile
    )
except ImportError:
    from schemas import (
        WaterPointInput,
        PredictionResponse,
        HealthResponse,
        MetadataResponse,
        UserSignUp,
        UserLogin,
        UserProfile,
        AuthResponse
    )
    from model_service import model_service
    from auth_service import (
        register_new_user,
        authenticate_user,
        get_current_user_profile
    )

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


def get_token_from_request(request: Request, authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract token from HttpOnly cookie or Authorization header."""
    cookie_token = request.cookies.get("access_token")
    if cookie_token and cookie_token.strip():
        return cookie_token.strip()
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.split("Bearer ")[1].strip()
        if token_str:
            return token_str
    return None


@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict operational status of a water point (Authenticated users only)",
    tags=["Prediction"]
)
def predict_water_point_status(
    input_data: WaterPointInput,
    request: Request,
    authorization: Optional[str] = Header(None)
) -> PredictionResponse:
    token = get_token_from_request(request, authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Only logged-in users can access the prediction system."
        )
    try:
        get_current_user_profile(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please sign in to access the prediction system."
        )

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


@app.post(
    "/auth/signup",
    response_model=AuthResponse,
    summary="Register a new user in MongoDB Atlas",
    tags=["Authentication"]
)
def signup(user_in: UserSignUp, response: Response) -> AuthResponse:
    try:
        auth_res = register_new_user(user_in)
        response.set_cookie(
            key="access_token",
            value=auth_res.access_token,
            httponly=True,
            samesite="lax",
            max_age=7 * 24 * 3600,
            path="/"
        )
        return auth_res
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Signup error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user account."
        )


@app.post(
    "/auth/login",
    response_model=AuthResponse,
    summary="Sign in an existing user using MongoDB Atlas",
    tags=["Authentication"]
)
def login(user_in: UserLogin, response: Response) -> AuthResponse:
    try:
        auth_res = authenticate_user(user_in)
        response.set_cookie(
            key="access_token",
            value=auth_res.access_token,
            httponly=True,
            samesite="lax",
            max_age=7 * 24 * 3600,
            path="/"
        )
        return auth_res
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed. Please verify credentials."
        )


@app.post(
    "/auth/logout",
    summary="Sign out user and clear HttpOnly session cookie",
    tags=["Authentication"]
)
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out successfully"}


@app.get(
    "/auth/me",
    response_model=UserProfile,
    summary="Get current user profile using HttpOnly cookie or Bearer token",
    tags=["Authentication"]
)
def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None)
) -> UserProfile:
    token = get_token_from_request(request, authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication credentials."
        )
    try:
        return get_current_user_profile(token)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.backend.main:app", host="127.0.0.1", port=8000, reload=True)
