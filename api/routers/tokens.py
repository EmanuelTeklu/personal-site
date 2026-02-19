"""Token spend endpoints — reads from token-usage.json."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from api.middleware.auth import verify_token
from api.services.file_reader import TOKEN_USAGE_PATH, read_json

router = APIRouter(tags=["tokens"])


@router.get("/tokens")
def get_tokens(_user: dict = Depends(verify_token)) -> dict:
    """Return current token usage data."""
    data = read_json(TOKEN_USAGE_PATH)
    if data is None:
        raise HTTPException(status_code=404, detail="Token usage file not found")
    return data
