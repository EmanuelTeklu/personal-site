#!/usr/bin/env bash
set -euo pipefail

SESSION="et-team"
PROJECT_DIR=~/dev/emanuelteklu

# Kill existing session if it exists
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Killing existing session: $SESSION"
  tmux kill-session -t "$SESSION"
fi

echo "Starting $SESSION tmux agent team..."

# Create session with window 0: orchestrator
tmux new-session -d -s "$SESSION" -n "orchestrator"
tmux send-keys -t "$SESSION:0" "cd $PROJECT_DIR && echo '' && echo '╔══════════════════════════════════════════╗' && echo '║  ET-TEAM  |  ORCHESTRATOR AGENT          ║' && echo '╚══════════════════════════════════════════╝' && echo '' && claude" Enter

# Window 1: frontend
tmux new-window -t "$SESSION" -n "frontend"
tmux send-keys -t "$SESSION:1" "cd $PROJECT_DIR && echo '' && echo '╔══════════════════════════════════════════╗' && echo '║  ET-TEAM  |  FRONTEND AGENT              ║' && echo '╚══════════════════════════════════════════╝' && echo '' && claude" Enter

# Window 2: backend
tmux new-window -t "$SESSION" -n "backend"
tmux send-keys -t "$SESSION:2" "cd $PROJECT_DIR && echo '' && echo '╔══════════════════════════════════════════╗' && echo '║  ET-TEAM  |  BACKEND AGENT               ║' && echo '╚══════════════════════════════════════════╝' && echo '' && claude" Enter

# Window 3: servers (split horizontally — left: vite, right: uvicorn)
tmux new-window -t "$SESSION" -n "servers"
tmux send-keys -t "$SESSION:3" "cd $PROJECT_DIR && npx vite --port 5180" Enter
tmux split-window -t "$SESSION:3" -h
tmux send-keys -t "$SESSION:3.1" "cd $PROJECT_DIR && python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload" Enter

# Window 4: watchdog
tmux new-window -t "$SESSION" -n "watchdog"
tmux send-keys -t "$SESSION:4" "$PROJECT_DIR/ops/watchdog.sh" Enter

# Select window 0 and attach
tmux select-window -t "$SESSION:0"
tmux attach-session -t "$SESSION"
