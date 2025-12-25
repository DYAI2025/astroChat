"""FastAPI Dependencies"""

from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from supabase import create_client, Client
from app.config import settings
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


# Supabase client (singleton)
_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get Supabase client instance"""
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )

    return _supabase_client


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase)
) -> User:
    """
    Validate JWT token and return current user.

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials

    try:
        # Decode JWT using Supabase secret
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject"
            )

        # Get user email from payload
        email = payload.get("email")

        return User(id=user_id, email=email)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_client_info(request: Request) -> dict:
    """Extract client information from request"""
    return {
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent")
    }
