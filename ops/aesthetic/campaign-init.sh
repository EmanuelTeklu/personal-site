#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# AESTHETIC CAMPAIGN INIT
# ═══════════════════════════════════════════════════════════════
# Usage: ./ops/aesthetic/campaign-init.sh \
#   --target "src/pages/public/Home.tsx" \
#   --name "home-redesign" \
#   --goal "Your aesthetic goal description" \
#   --max-cycles 12
# ═══════════════════════════════════════════════════════════════

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
AESTHETIC_DIR="$PROJECT_DIR/.aesthetic"

# Parse args
TARGET=""
NAME=""
GOAL=""
MAX_CYCLES=12

while [[ $# -gt 0 ]]; do
  case $1 in
    --target) TARGET="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --goal) GOAL="$2"; shift 2 ;;
    --max-cycles) MAX_CYCLES="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$TARGET" || -z "$NAME" || -z "$GOAL" ]]; then
  echo "ERROR: --target, --name, and --goal are required"
  echo "Usage: ./ops/aesthetic/campaign-init.sh --target FILE --name NAME --goal GOAL [--max-cycles N]"
  exit 1
fi

# Verify target exists
if [[ ! -f "$PROJECT_DIR/$TARGET" ]]; then
  echo "ERROR: Target file not found: $PROJECT_DIR/$TARGET"
  exit 1
fi

# Create directory structure
mkdir -p "$AESTHETIC_DIR"/{state,briefs,references,variants,verdicts}

# Extract required behaviors by reading the target component
echo "Analyzing target component: $TARGET"

# Extract export function name
EXPORT_NAME=$(grep -o 'export function [A-Za-z_][A-Za-z0-9_]*' "$PROJECT_DIR/$TARGET" | head -1 | sed 's/export function //')
if [[ -z "$EXPORT_NAME" ]]; then
  echo "WARNING: Could not detect export function name from $TARGET"
  EXPORT_NAME="Unknown"
fi

# Detect style mechanism
if grep -q 'className=' "$PROJECT_DIR/$TARGET" && ! grep -q 'style={{' "$PROJECT_DIR/$TARGET"; then
  STYLE_MECHANISM="tailwind"
elif grep -q 'style={{' "$PROJECT_DIR/$TARGET" && ! grep -q 'className=' "$PROJECT_DIR/$TARGET"; then
  STYLE_MECHANISM="inline-only"
else
  STYLE_MECHANISM="mixed"
fi

# Read CSS vars from index.css
CSS_VARS=$(grep -o 'var(--[^)]*)' "$PROJECT_DIR/src/index.css" | sort -u | sed 's/var(//;s/)//' | python3 -c "import sys,json; print(json.dumps([l.strip() for l in sys.stdin]))")

echo "Detected: export=$EXPORT_NAME, style=$STYLE_MECHANISM"

# Write campaign.json
cat > "$AESTHETIC_DIR/state/campaign.json" << CAMPAIGN_EOF
{
  "name": "$NAME",
  "target_files": ["$TARGET"],
  "export_name": "$EXPORT_NAME",
  "goal": "$GOAL",
  "max_cycles": $MAX_CYCLES,
  "style_mechanism": "$STYLE_MECHANISM",
  "required_behaviors": [],
  "aesthetic_rubric": {
    "css_vars": $CSS_VARS,
    "typography_tokens": ["--serif", "--sans", "--mono"],
    "color_tokens": ["--bg", "--fg", "--fg-dim", "--fg-muted", "--accent", "--accent-dim"],
    "forbidden_patterns": [],
    "easing_standard": "cubic-bezier(0.22, 1, 0.36, 1)"
  },
  "scoring_weights": {
    "aesthetic_coherence": 25,
    "motion_quality": 20,
    "typescript_integrity": 20,
    "layout_sophistication": 20,
    "distinctiveness": 10,
    "functional_preservation": 5
  },
  "zoom_level_rules": {
    "1": {"variants": 3, "advance_threshold": 5},
    "2": {"variants": 2, "advance_threshold": 3},
    "3": {"variants": 2, "advance_threshold": 8},
    "4": {"variants": 1, "advance_threshold": 0}
  },
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
CAMPAIGN_EOF

# Write initial cycle state
cat > "$AESTHETIC_DIR/state/current-cycle.json" << STATE_EOF
{
  "cycle": 1,
  "zoom_level": 1,
  "phase": "idle",
  "target_component": "$TARGET",
  "winner_from_last_cycle": null,
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
STATE_EOF

# Initialize iteration log
cat > "$AESTHETIC_DIR/iteration-log.md" << LOG_EOF
# Aesthetic Iteration Log — $NAME

Campaign target: \`$TARGET\`
Goal: $GOAL
Max cycles: $MAX_CYCLES
Initialized: $(date -u +%Y-%m-%dT%H:%M:%SZ)

---

LOG_EOF

echo ""
echo "═══════════════════════════════════════════"
echo "Campaign initialized: $NAME"
echo "Target: $TARGET (export: $EXPORT_NAME)"
echo "Style: $STYLE_MECHANISM"
echo "Max cycles: $MAX_CYCLES"
echo "State: $AESTHETIC_DIR/state/"
echo ""
echo "Next: run ./ops/aesthetic/aesthetic-start.sh"
echo "═══════════════════════════════════════════"
