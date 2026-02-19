"""Safe file reader — restricted to known ClawdBot data paths."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

# Allowed base directories for reads
CLAWDBOT_DIR = Path.home() / "clawdbot"
OPS_DIR = Path.home() / "Desktop" / "Manny" / "ops"

ALLOWED_BASES = frozenset({CLAWDBOT_DIR, OPS_DIR})

TOKEN_USAGE_PATH = OPS_DIR / "token-usage.json"
TASK_QUEUE_PATH = CLAWDBOT_DIR / "data" / "task-queue.json"
OVERNIGHT_DIR = CLAWDBOT_DIR / "overnight"


def _validate_path(path: Path) -> Path:
    """Ensure the resolved path falls under an allowed base directory."""
    resolved = path.resolve()
    for base in ALLOWED_BASES:
        try:
            resolved.relative_to(base.resolve())
            return resolved
        except ValueError:
            continue
    msg = f"Path not allowed: {resolved}"
    raise PermissionError(msg)


def read_json(path: Path) -> Any:
    """Read and parse a JSON file from an allowed path."""
    safe_path = _validate_path(path)
    if not safe_path.exists():
        return None
    with safe_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data: Any) -> None:
    """Write JSON to an allowed path."""
    safe_path = _validate_path(path)
    safe_path.parent.mkdir(parents=True, exist_ok=True)
    with safe_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


def read_text(path: Path) -> str | None:
    """Read a text file from an allowed path."""
    safe_path = _validate_path(path)
    if not safe_path.exists():
        return None
    return safe_path.read_text(encoding="utf-8")


def list_markdown_files(directory: Path) -> list[dict[str, str]]:
    """List .md files in an allowed directory, returning name + slug."""
    safe_dir = _validate_path(directory)
    if not safe_dir.is_dir():
        return []
    files = sorted(safe_dir.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    return [
        {
            "slug": f.stem,
            "name": f.stem.replace("-", " ").title(),
            "modified": f.stat().st_mtime,
        }
        for f in files
    ]
