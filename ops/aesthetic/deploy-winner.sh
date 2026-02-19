#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# AESTHETIC DEPLOY — Promotes winning variant to src/ and pushes
# ═══════════════════════════════════════════════════════════════
# Three safety gates: tsc, vite build, git diff log
# On any failure: restores original from git and exits non-zero
# ═══════════════════════════════════════════════════════════════

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
AESTHETIC_DIR="$PROJECT_DIR/.aesthetic"
DEPLOY_FILE="$AESTHETIC_DIR/state/deploy-ready.json"

if [[ ! -f "$DEPLOY_FILE" ]]; then
  echo "ERROR: No deploy-ready.json found. Campaign hasn't completed."
  exit 1
fi

# Read winner info
WINNER_CYCLE=$(python3 -c "import json; d=json.load(open('$DEPLOY_FILE')); print(d['cycle'])")
WINNER_ID=$(python3 -c "import json; d=json.load(open('$DEPLOY_FILE')); print(d['winner_variant'])")
TARGET_COMPONENT=$(python3 -c "import json; d=json.load(open('$DEPLOY_FILE')); print(d['target_component'])")
CAMPAIGN_NAME=$(python3 -c "import json; d=json.load(open('$AESTHETIC_DIR/state/campaign.json')); print(d['name'])")

WINNER_FILE="$AESTHETIC_DIR/variants/cycle-${WINNER_CYCLE}/${WINNER_ID}.tsx"
TARGET_FILE="$PROJECT_DIR/$TARGET_COMPONENT"

echo "═══════════════════════════════════════════"
echo "AESTHETIC DEPLOY"
echo "Winner: cycle-${WINNER_CYCLE}/${WINNER_ID}"
echo "Target: $TARGET_COMPONENT"
echo "═══════════════════════════════════════════"

if [[ ! -f "$WINNER_FILE" ]]; then
  echo "ERROR: Winner file not found: $WINNER_FILE"
  exit 1
fi

# SAFETY GATE 1: TypeScript
echo ""
echo "Gate 1: TypeScript verification..."
cp "$WINNER_FILE" "$TARGET_FILE"
if ! npx tsc --noEmit -p "$PROJECT_DIR/tsconfig.app.json" 2>&1; then
  echo "FATAL: Winner fails tsc --noEmit. Restoring original."
  git -C "$PROJECT_DIR" checkout -- "$TARGET_COMPONENT"
  exit 1
fi
echo "  ✓ TypeScript passes"

# SAFETY GATE 2: Vite build
echo ""
echo "Gate 2: Vite build verification..."
if ! npm run build --prefix "$PROJECT_DIR" 2>&1; then
  echo "FATAL: Winner fails vite build. Restoring original."
  git -C "$PROJECT_DIR" checkout -- "$TARGET_COMPONENT"
  exit 2
fi
echo "  ✓ Vite build passes"

# SAFETY GATE 3: Diff log
echo ""
echo "Gate 3: Recording diff..."
git -C "$PROJECT_DIR" diff "$TARGET_COMPONENT" > "$AESTHETIC_DIR/verdicts/deploy-diff.patch"
echo "  ✓ Diff saved to verdicts/deploy-diff.patch"

# Commit and push
echo ""
echo "Committing and pushing..."
COMMIT_MSG="feat: aesthetic refinement — ${CAMPAIGN_NAME} cycle-${WINNER_CYCLE} ${WINNER_ID}"

git -C "$PROJECT_DIR" add "$TARGET_COMPONENT"
git -C "$PROJECT_DIR" commit -m "$COMMIT_MSG"
git -C "$PROJECT_DIR" push origin main

echo ""
echo "═══════════════════════════════════════════"
echo "DEPLOYED — Vercel will auto-deploy from push"
echo "Live at: https://emanuelteklu.com"
echo "═══════════════════════════════════════════"
