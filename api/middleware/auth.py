"""JWT auth middleware — validates Supabase access tokens."""

from __future__ import annotations

import os
from typing import Any

import httpx
import jwt
from fastapi import HTTPException, Request

# Supabase project URL and expected admin user ID
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
ADMIN_USER_ID = os.environ.get("ADMIN_USER_ID", "")

# Cache the JWKS (Supabase public keys)
_jwks_cache: dict[str, Any] = {}


def _extract_token(request: Request) -> str:
    """Extract Bearer token from Authorization header."""
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    return auth[7:]


def verify_token(request: Request) -> dict[str, Any]:
    """Verify JWT and check it belongs to the admin user.

    For local development without Supabase, accepts all requests
    when SUPABASE_JWT_SECRET is not set.
    """
    if not SUPABASE_JWT_SECRET:
        # Dev mode — no auth enforcement
        return {"sub": "dev-user", "dev_mode": True}

    token = _extract_token(request)
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    # Enforce admin-only access
    if ADMIN_USER_ID and payload.get("sub") != ADMIN_USER_ID:
        raise HTTPException(status_code=403, detail="Not authorized")

    return payload
