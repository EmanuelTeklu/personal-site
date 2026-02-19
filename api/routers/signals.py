import subprocess
from pathlib import Path
from fastapi import APIRouter

router = APIRouter()

DEV_DIR = Path.home() / "dev"


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
    except Exception:
        return []


@router.get("/signals")
async def get_signals():
    commits = []
    if DEV_DIR.exists():
        for entry in sorted(DEV_DIR.iterdir()):
            if entry.is_dir() and (entry / ".git").exists():
                commits.extend(_get_commits(entry))
    # Sort by date descending
    commits.sort(key=lambda c: c["date"], reverse=True)
    return {"commits": commits[:50]}
