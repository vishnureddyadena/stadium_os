from datetime import datetime, timedelta
from typing import Any, Union
from passlib.context import CryptContext
from app.core.config import settings

# jose is imported as jwt, but in requirements let's make sure we list python-jose or pyjwt. 
# We'll use PyJWT for simplicity, which is widely used, or python-jose. Let's write with PyJWT, which is 'jwt' in Python.
import jwt as pyjwt

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

ROLE_PERMISSIONS = {
    "SUPER_ADMIN": ["*"],
    "ADMIN": ["users:read", "users:write", "incidents:read", "incidents:write", "incidents:assign", "sustainability:read", "sustainability:write", "transport:read", "transport:write", "assets:read", "assets:write", "tickets:read", "tickets:write", "vip:read", "vip:write", "audit:read"],
    "ORGANIZER": ["incidents:read", "incidents:write", "incidents:assign", "sustainability:read", "transport:read", "transport:write", "assets:read", "tickets:read", "vip:read"],
    "SECURITY": ["incidents:read", "incidents:write", "incidents:assign", "assets:read", "tickets:read"],
    "MEDICAL": ["incidents:read", "incidents:write", "incidents:assign", "assets:read"],
    "VOLUNTEER": ["incidents:read", "incidents:write"],
    "VIP": ["transport:read", "vip:read"],
    "VENDOR": ["sustainability:read"],
    "FAN": ["tickets:read", "transport:read"]
}

def create_access_token(subject: Union[str, Any], role: str, expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    permissions = ROLE_PERMISSIONS.get(role, [])
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "scopes": permissions,
        "type": "access"
    }
    encoded_jwt = pyjwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    import uuid
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh",
        "jti": str(uuid.uuid4())
    }
    encoded_jwt = pyjwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
