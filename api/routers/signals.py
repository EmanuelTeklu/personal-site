import logging
import os
import subprocess
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter

router = APIRouter()
logger = logging.getLogger(__name__)

_dev_dir_raw = os.environ.get("DEV_DIR", str(Path.home() / "dev"))
DEV_DIR = Path(_dev_dir_raw)


def _get_commits(repo: Path) -> list[dict]:
    try:
        result = subprocess.run(
            [
                "git",
                "-C",
                str(repo),
                "log",
                "--since=7 days ago",
                "--format=%H|%s|%ai",
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            return []
        commits = []
        for line in result.stdout.strip().splitlines():
            if not line:
                continue
            parts = line.split("|", 2)
            if len(parts) != 3:
                continue
            hash_, message, date = parts
            commits.append(
                {
                    "type": "commit",
                    "repo": repo.name,
                    "hash": hash_[:8],
                    "message": message,
                    "date": date,
                    "seed": f"[{repo.name}] {message}",
                }
            )
        return commits
    except subprocess.TimeoutExpired:
        logger.warning("[signals] git log timed out for repo: %s", repo)
        return []
    except Exception as exc:
        logger.warning("[signals] git log failed for repo %s: %s", repo, exc)
        return []


@router.get("/signals")
async def get_signals():
    commits = []
    try:
        if DEV_DIR.exists():
            for entry in sorted(DEV_DIR.iterdir()):
                if entry.is_dir() and (entry / ".git").exists():
                    commits.extend(_get_commits(entry))
    except PermissionError as exc:
        logger.warning("[signals] cannot read DEV_DIR %s: %s", DEV_DIR, exc)
    # Sort by date descending
    commits.sort(key=lambda c: datetime.fromisoformat(c["date"]), reverse=True)
    return {"commits": commits[:50]}
