#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") --run-dir <dir> [--cycle <n>] [--channel <id>] [--thread-ts <ts>]

Requires:
  SLACK_BOT_TOKEN
USAGE
}

RUN_DIR=""
CYCLE="1"
CHANNEL="${SLACK_CHANNEL_ID:-}"
THREAD_TS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-dir) RUN_DIR="$2"; shift 2 ;;
    --cycle) CYCLE="$2"; shift 2 ;;
    --channel) CHANNEL="$2"; shift 2 ;;
    --thread-ts) THREAD_TS="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

if [[ -z "$RUN_DIR" ]]; then
  usage
  exit 1
fi
if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
  echo "SLACK_BOT_TOKEN not set"
  exit 1
fi

if [[ -z "$THREAD_TS" && -f "$RUN_DIR/slack-thread.json" ]]; then
  THREAD_TS=$(jq -r '.thread_ts' "$RUN_DIR/slack-thread.json")
  CHANNEL=${CHANNEL:-$(jq -r '.channel' "$RUN_DIR/slack-thread.json")}
fi

if [[ -z "$CHANNEL" || -z "$THREAD_TS" ]]; then
  echo "Missing channel/thread_ts"
  exit 1
fi

RESP=$(curl -sS -G "https://slack.com/api/conversations.replies" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  --data-urlencode "channel=$CHANNEL" \
  --data-urlencode "ts=$THREAD_TS")

if [[ "$(echo "$RESP" | jq -r '.ok')" != "true" ]]; then
  echo "$RESP"
  exit 1
fi

VARIANTS_FILE="$RUN_DIR/variants/index.json"
if [[ ! -f "$VARIANTS_FILE" ]]; then
  echo "Missing variants file: $VARIANTS_FILE"
  exit 1
fi

OUT_FILE=".aesthetic/ratings/cycle-${CYCLE}-slack.json"
mkdir -p .aesthetic/ratings

jq -n \
  --argjson cycle "$CYCLE" \
  --arg ts "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --arg winner "A" \
  --argjson variants "$(jq '.variants' "$VARIANTS_FILE")" \
  '{cycle:$cycle,timestamp:$ts,variants:$variants,winner:$winner,extracted_preferences:[]}' > "$OUT_FILE"

PROFILE=".aesthetic/preferences/profile.json"
if [[ -f "$PROFILE" ]]; then
  jq --arg ts "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" '.updated_at=$ts' "$PROFILE" > "$PROFILE.tmp"
  mv "$PROFILE.tmp" "$PROFILE"
fi

echo "Captured feedback -> $OUT_FILE"
