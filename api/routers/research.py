"""Research endpoints — lists and reads overnight markdown briefs."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from api.middleware.auth import verify_token
from api.services.file_reader import OVERNIGHT_DIR, list_markdown_files, read_text

router = APIRouter(tags=["research"])


@router.get("/research")
def list_research(_user: dict = Depends(verify_token)) -> list[dict]:
    """List all overnight research briefs."""
    return list_markdown_files(OVERNIGHT_DIR)


@router.get("/research/{slug}")
def get_research(slug: str, _user: dict = Depends(verify_token)) -> dict:
    """Read a specific research brief by slug."""
    # Sanitize slug — only allow alphanumeric, hyphens, underscores
    safe_slug = "".join(c for c in slug if c.isalnum() or c in "-_")
    if safe_slug != slug:
        raise HTTPException(status_code=400, detail="Invalid slug")

    path = OVERNIGHT_DIR / f"{safe_slug}.md"
    content = read_text(path)
    if content is None:
        raise HTTPException(status_code=404, detail="Research brief not found")

    return {
        "slug": safe_slug,
        "name": safe_slug.replace("-", " ").title(),
        "content": content,
    }
