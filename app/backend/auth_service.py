import os
import re
import datetime
from typing import Optional, Dict, Any
import bcrypt
import jwt
from bson import ObjectId

try:
    from app.backend.db import get_users_collection
    from app.backend.schemas import UserSignUp, UserLogin, UserProfile, AuthResponse
except ImportError:
    from db import get_users_collection
    from schemas import UserSignUp, UserLogin, UserProfile, AuthResponse

JWT_SECRET = os.getenv("JWT_SECRET", "waterpoint-ai-secret-key-decision-support-2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_EXPIRE_DAYS = 7

EMAIL_REGEX = re.compile(r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$")


def hash_password(password: str) -> str:
    """Hash plain-text password using bcrypt with random salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain-text password against bcrypt hashed password."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generate signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None


def register_new_user(user_in: UserSignUp) -> AuthResponse:
    """Register a new user in MongoDB Atlas and return auth response with JWT."""
    email_clean = user_in.email.strip().lower()
    name_clean = user_in.name.strip()
    org_clean = user_in.organization.strip()

    if not EMAIL_REGEX.match(email_clean):
        raise ValueError("Please provide a valid email address.")

    if len(user_in.password) < 8:
        raise ValueError("Password must be at least 8 characters in length.")

    users_col = get_users_collection()

    # Check existing user
    existing = users_col.find_one({"email": email_clean})
    if existing:
        raise ValueError("An account with this email address already exists.")

    hashed_pw = hash_password(user_in.password)
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    doc = {
        "name": name_clean,
        "organization": org_clean,
        "email": email_clean,
        "hashed_password": hashed_pw,
        "created_at": now_iso
    }

    result = users_col.insert_one(doc)
    user_id = str(result.inserted_id)

    token_payload = {
        "sub": user_id,
        "email": email_clean,
        "name": name_clean
    }
    token = create_access_token(token_payload)

    user_profile = UserProfile(
        id=user_id,
        name=name_clean,
        organization=org_clean,
        email=email_clean,
        created_at=now_iso
    )

    return AuthResponse(access_token=token, token_type="bearer", user=user_profile)


def authenticate_user(user_in: UserLogin) -> AuthResponse:
    """Authenticate existing user against MongoDB and return JWT token."""
    email_clean = user_in.email.strip().lower()
    users_col = get_users_collection()

    user_doc = users_col.find_one({"email": email_clean})
    if not user_doc:
        raise ValueError("Invalid email or password.")

    if not verify_password(user_in.password, user_doc.get("hashed_password", "")):
        raise ValueError("Invalid email or password.")

    user_id = str(user_doc["_id"])
    now_iso = user_doc.get("created_at") or datetime.datetime.now(datetime.timezone.utc).isoformat()

    token_payload = {
        "sub": user_id,
        "email": email_clean,
        "name": user_doc.get("name", "")
    }
    token = create_access_token(token_payload)

    user_profile = UserProfile(
        id=user_id,
        name=user_doc.get("name", "User"),
        organization=user_doc.get("organization", ""),
        email=email_clean,
        created_at=now_iso
    )

    return AuthResponse(access_token=token, token_type="bearer", user=user_profile)


def get_current_user_profile(token: str) -> UserProfile:
    """Retrieve user profile from MongoDB by decoded JWT token."""
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise ValueError("Invalid or expired session token.")

    user_id = payload["sub"]
    users_col = get_users_collection()

    try:
        user_doc = users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user_doc = users_col.find_one({"email": payload.get("email")})

    if not user_doc:
        raise ValueError("User not found.")

    return UserProfile(
        id=str(user_doc["_id"]),
        name=user_doc.get("name", ""),
        organization=user_doc.get("organization", ""),
        email=user_doc.get("email", ""),
        created_at=user_doc.get("created_at", "")
    )
