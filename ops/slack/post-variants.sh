#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") --run-dir <dir> [--channel <slack-channel-id>] [--title <text>]

Requires:
  SLACK_BOT_TOKEN
  variants metadata at <run-dir>/variants/index.json
USAGE
}

RUN_DIR=""
CHANNEL="${SLACK_CHANNEL_ID:-}"
TITLE="JaneHive Command Center Variants"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-dir) RUN_DIR="$2"; shift 2 ;;
    --channel) CHANNEL="$2"; shift 2 ;;
    --title) TITLE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

if [[ -z "$RUN_DIR" || -z "$CHANNEL" ]]; then
  usage
  exit 1
fi
if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
  echo "SLACK_BOT_TOKEN not set"
  exit 1
fi

VARIANTS_FILE="$RUN_DIR/variants/index.json"
if [[ ! -f "$VARIANTS_FILE" ]]; then
  echo "Missing variants file: $VARIANTS_FILE"
  exit 1
fi

ROOT_MSG=$(jq -n \
  --arg channel "$CHANNEL" \
  --arg text "🎨 $TITLE\nReact on variants in thread: ✅ winner, 🎯 close, 🔥 love element, 💀 drift, ❌ reject" \
  '{channel:$channel,text:$text}')

ROOT_RESP=$(curl -sS -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "$ROOT_MSG")

OK=$(echo "$ROOT_RESP" | jq -r '.ok')
if [[ "$OK" != "true" ]]; then
  echo "$ROOT_RESP"
  exit 1
fi

THREAD_TS=$(echo "$ROOT_RESP" | jq -r '.ts')

jq -c '.variants[]' "$VARIANTS_FILE" | while read -r variant; do
  ID=$(echo "$variant" | jq -r '.id')
  CHANGES=$(echo "$variant" | jq -r '.changes[]?' | sed 's/^/- /')
  BODY="Variant $ID\nChanges from baseline:\n${CHANGES:- - no changes listed}"

  MSG=$(jq -n \
    --arg channel "$CHANNEL" \
    --arg thread_ts "$THREAD_TS" \
    --arg text "$BODY" \
    '{channel:$channel,thread_ts:$thread_ts,text:$text}')

  curl -sS -X POST "https://slack.com/api/chat.postMessage" \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H "Content-Type: application/json; charset=utf-8" \
    --data "$MSG" >/dev/null
done

jq -n --arg channel "$CHANNEL" --arg thread_ts "$THREAD_TS" '{channel:$channel,thread_ts:$thread_ts}' > "$RUN_DIR/slack-thread.json"
echo "Posted variants thread: $THREAD_TS"
