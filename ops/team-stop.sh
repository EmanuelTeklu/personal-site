#!/usr/bin/env bash
set -euo pipefail

SESSION="et-team"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux kill-session -t "$SESSION"
  echo "Session '$SESSION' killed."
else
  echo "No session named '$SESSION' found."
fi
