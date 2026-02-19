#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# AESTHETIC OVERNIGHT — tmux session launcher
# ═══════════════════════════════════════════════════════════════
# Starts 4 agent windows + monitor + vite preview
# Each agent is a Claude Code session with a role-specific prompt
# ═══════════════════════════════════════════════════════════════

SESSION="et-aesthetic"
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
AESTHETIC_DIR="$PROJECT_DIR/.aesthetic"
AGENTS_DIR="$PROJECT_DIR/ops/agents"

# Guard: require campaign initialized
if [[ ! -f "$AESTHETIC_DIR/state/campaign.json" ]]; then
  echo "ERROR: No campaign initialized."
  echo "Run: ./ops/aesthetic/campaign-init.sh --target FILE --name NAME --goal GOAL"
  exit 1
fi

# Kill existing session
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Killing existing session: $SESSION"
  tmux kill-session -t "$SESSION"
fi

# Set phase to brief-ready to kick off the first cycle
python3 -c "
import json, datetime
state_file = '$AESTHETIC_DIR/state/current-cycle.json'
with open(state_file) as f:
    state = json.load(f)
state['phase'] = 'brief-ready'
state['updated_at'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
with open(state_file, 'w') as f:
    json.dump(state, f, indent=2)
"

echo "Starting $SESSION overnight aesthetic session..."

CAMPAIGN_NAME=$(python3 -c "import json; print(json.load(open('$AESTHETIC_DIR/state/campaign.json'))['name'])")
echo "Campaign: $CAMPAIGN_NAME"

# Window 0: PM Agent
tmux new-session -d -s "$SESSION" -n "pm" -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION:0" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  AESTHETIC  |  PM AGENT                  ║' && echo '║  Campaign: $CAMPAIGN_NAME' && echo '╚══════════════════════════════════════════╝' && echo '' && echo 'Starting PM agent...' && claude --system-prompt $AGENTS_DIR/aesthetic-pm-prompt.txt -p 'Begin the aesthetic cycle loop. Read .aesthetic/state/current-cycle.json and .aesthetic/state/campaign.json to understand the campaign. Write the first brief and drive the cycle.'" Enter

# Window 1: Scout Agent
tmux new-window -t "$SESSION" -n "scout" -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION:1" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  AESTHETIC  |  SCOUT AGENT               ║' && echo '╚══════════════════════════════════════════╝' && echo '' && echo 'Starting Scout agent...' && claude --system-prompt $AGENTS_DIR/aesthetic-scout-prompt.txt -p 'You are the Aesthetic Scout. Watch .aesthetic/state/current-cycle.json for phase=brief-ready. When it arrives, read the brief and write a direction document. Poll every 60 seconds.'" Enter

# Window 2: Builder Agent
tmux new-window -t "$SESSION" -n "builder" -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION:2" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  AESTHETIC  |  BUILDER AGENT             ║' && echo '╚══════════════════════════════════════════╝' && echo '' && echo 'Starting Builder agent...' && claude --system-prompt $AGENTS_DIR/aesthetic-builder-prompt.txt -p 'You are the Builder Agent. Watch .aesthetic/state/current-cycle.json for phase=brief-ready. Read the brief and direction document, then generate variant TSX files. Verify each with tsc --noEmit. Poll every 60 seconds.'" Enter

# Window 3: Critic Agent
tmux new-window -t "$SESSION" -n "critic" -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION:3" "cd $PROJECT_DIR && echo '╔══════════════════════════════════════════╗' && echo '║  AESTHETIC  |  META-CRITIC               ║' && echo '╚══════════════════════════════════════════╝' && echo '' && echo 'Starting Meta-Critic agent...' && claude --system-prompt $AGENTS_DIR/aesthetic-critic-prompt.txt -p 'You are the Meta-Critic. Watch .aesthetic/state/current-cycle.json for phase=critic-ready. Score all variants and write a verdict. Poll every 60 seconds.'" Enter

# Window 4: Monitor
tmux new-window -t "$SESSION" -n "monitor" -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION:4" "echo '╔══════════════════════════════════════════╗' && echo '║  AESTHETIC  |  MONITOR                   ║' && echo '╚══════════════════════════════════════════╝' && tail -f $AESTHETIC_DIR/iteration-log.md" Enter
tmux split-window -t "$SESSION:4" -v -c "$PROJECT_DIR"
tmux send-keys -t "$SESSION:4.1" "watch -n 10 'echo \"=== CYCLE STATE ===\"; cat $AESTHETIC_DIR/state/current-cycle.json 2>/dev/null; echo \"\"; echo \"=== VARIANTS ===\"; ls -la $AESTHETIC_DIR/variants/*/ 2>/dev/null || echo \"none yet\"'" Enter

# Select PM window
tmux select-window -t "$SESSION:0"

echo ""
echo "═══════════════════════════════════════════"
echo "Session $SESSION started."
echo "Attach: tmux attach -t $SESSION"
echo ""
echo "Windows:"
echo "  0: pm       — Orchestrator driving cycles"
echo "  1: scout    — Aesthetic direction research"
echo "  2: builder  — TSX variant generation"
echo "  3: critic   — Scoring and selection"
echo "  4: monitor  — Live state + iteration log"
echo "═══════════════════════════════════════════"
