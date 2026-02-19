#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-once}"
MESSAGE="${2:-}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-10}"
DEBOUNCE_SECONDS="${DEBOUNCE_SECONDS:-20}"
AUTO_PUSH="${AUTO_PUSH:-1}"

is_dirty() {
  cd "$PROJECT_DIR"
  if [[ -n "$(git status --porcelain)" ]]; then
    return 0
  fi
  return 1
}

ship_once() {
  cd "$PROJECT_DIR"

  if ! is_dirty; then
    echo "[auto-ship] No changes detected."
    return 0
  fi

  local commit_message
  if [[ -n "$MESSAGE" ]]; then
    commit_message="$MESSAGE"
  else
    commit_message="chore: auto-ship $(date +'%Y-%m-%d %H:%M:%S')"
  fi

  echo "[auto-ship] Committing changes..."
  git add -A
  git commit -m "$commit_message"

  local branch
  branch="$(git branch --show-current)"

  if [[ "$AUTO_PUSH" == "1" ]]; then
    echo "[auto-ship] Pushing to origin/${branch}..."
    if ! git push origin "$branch"; then
      echo "[auto-ship] WARNING: push failed; continuing to deploy from local state." >&2
    fi
  fi

  echo "[auto-ship] Deploying to Vercel production..."
  vercel deploy "$PROJECT_DIR" --prod -y
}

watch_mode() {
  echo "[auto-ship] Watch mode enabled (interval=${INTERVAL_SECONDS}s, debounce=${DEBOUNCE_SECONDS}s)."
  local dirty_since=""

  while true; do
    if is_dirty; then
      local now
      now="$(date +%s)"
      if [[ -z "$dirty_since" ]]; then
        dirty_since="$now"
      fi

      if (( now - dirty_since >= DEBOUNCE_SECONDS )); then
        ship_once
        dirty_since=""
      fi
    else
      dirty_since=""
    fi

    sleep "$INTERVAL_SECONDS"
  done
}

case "$MODE" in
  once)
    ship_once
    ;;
  watch)
    watch_mode
    ;;
  *)
    echo "Usage: $0 [once|watch] [commit-message]"
    exit 1
    ;;
esac
