#!/usr/bin/env bash
set -euo pipefail

SESSION="et-team"
PROJECT_DIR=~/dev/emanuelteklu

echo "Watchdog started. Monitoring $SESSION every 30 seconds..."

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$TIMESTAMP] Watchdog heartbeat"

  # Check Vite (window 3, left pane 0)
  if ! pgrep -f "vite --port 5180" > /dev/null 2>&1; then
    echo "[$TIMESTAMP] WARNING: Vite not running. Restarting..."
    tmux send-keys -t "$SESSION:3.0" "" Enter
    tmux send-keys -t "$SESSION:3.0" "cd $PROJECT_DIR && npx vite --port 5180" Enter
  fi

  # Check uvicorn (window 3, right pane 1)
  if ! pgrep -f "uvicorn api.main:app" > /dev/null 2>&1; then
    echo "[$TIMESTAMP] WARNING: uvicorn not running. Restarting..."
    tmux send-keys -t "$SESSION:3.1" "" Enter
    tmux send-keys -t "$SESSION:3.1" "cd $PROJECT_DIR && python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload" Enter
  fi

  sleep 30
done
