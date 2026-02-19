#!/usr/bin/env bash
set -euo pipefail

SESSION="cc"
PROJECT_DIR=~/dev/emanuelteklu

# Kill existing session if it exists
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Killing existing session: $SESSION"
  tmux kill-session -t "$SESSION"
fi

echo "Starting $SESSION tmux campaign session..."

# Window 0: main — frontend dev, backend dev, log tail
tmux new-session -d -s "$SESSION" -n "main"
tmux send-keys -t "$SESSION:0" "cd $PROJECT_DIR && npx vite --port 5180" Enter
tmux split-window -t "$SESSION:0" -h
tmux send-keys -t "$SESSION:0.1" "cd $PROJECT_DIR && python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload" Enter
tmux split-window -t "$SESSION:0.1" -v
tmux send-keys -t "$SESSION:0.2" "cd $PROJECT_DIR && tail -f /tmp/cc-campaign.log 2>/dev/null || echo 'No log yet. Watching...'" Enter

# Window 1: agents — primary agent, secondary agent, monitor
tmux new-window -t "$SESSION" -n "agents"
tmux send-keys -t "$SESSION:1" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  CC  |  PRIMARY AGENT                    ║' && echo '╚══════════════════════════════════════════╝'" Enter
tmux split-window -t "$SESSION:1" -h
tmux send-keys -t "$SESSION:1.1" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  CC  |  SECONDARY AGENT                  ║' && echo '╚══════════════════════════════════════════╝'" Enter
tmux split-window -t "$SESSION:1.1" -v
tmux send-keys -t "$SESSION:1.2" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  CC  |  MONITOR                          ║' && echo '╚══════════════════════════════════════════╝'" Enter

# Window 2: campaigns — executor, output capture
tmux new-window -t "$SESSION" -n "campaigns"
tmux send-keys -t "$SESSION:2" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  CC  |  CAMPAIGN EXECUTOR                ║' && echo '╚══════════════════════════════════════════╝'" Enter
tmux split-window -t "$SESSION:2" -h
tmux send-keys -t "$SESSION:2.1" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  CC  |  OUTPUT CAPTURE                   ║' && echo '╚══════════════════════════════════════════╝'" Enter

# Select window 0 and attach
tmux select-window -t "$SESSION:0"
tmux attach-session -t "$SESSION"
