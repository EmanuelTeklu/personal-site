#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="${PROJECT_REF:-oqqrrdavcqgjungmjxsk}"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

cd "$ROOT_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

require_cmd supabase

if ! supabase projects list >/dev/null 2>&1; then
  echo "Supabase CLI is not authenticated."
  echo "Run: supabase login"
  exit 1
fi

echo "Linking Supabase project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo "Applying migrations"
supabase db push

if [[ -n "${ANTHROPIC_API_KEY:-}" && -n "${GEMINI_API_KEY:-}" ]]; then
  echo "Setting edge secrets"
  if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    supabase secrets set \
      ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
      GEMINI_API_KEY="$GEMINI_API_KEY" \
      SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"
  else
    supabase secrets set \
      ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
      GEMINI_API_KEY="$GEMINI_API_KEY"
  fi
else
  echo "Skipping secrets set because ANTHROPIC_API_KEY and GEMINI_API_KEY are not both exported in this shell."
fi

echo "Deploying run-campaign edge function"
supabase functions deploy run-campaign

echo "Done. Open /cc and launch tonight's campaign template."
