"""Health check endpoint."""

from __future__ import annotations

import subprocess

from fastapi import APIRouter, Depends

from api.middleware.auth import verify_token

router = APIRouter(tags=["health"])


def _run_cmd(cmd: list[str]) -> str:
    """Run a command and return stdout, or error string."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError) as e:
        return f"error: {e}"


@router.get("/health")
def get_health(_user: dict = Depends(verify_token)) -> dict:
    """Return system health: PM2 processes and project git status."""
    pm2_output = _run_cmd(["pm2", "jlist"])
    git_status = _run_cmd(
        ["git", "-C", "/Users/manny/dev/emanuelteklu", "log", "--oneline", "-5"]
    )

    return {
        "status": "ok",
        "pm2": pm2_output,
        "git_recent": git_status,
    }
