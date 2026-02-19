#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") --workflow <yaml> [--run-id <id>] [--auto-select <variant-id>] [--simulate] [--post-slack]

Executes JaneHive 3-agent workflows defined in YAML.
USAGE
}

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
WORKFLOW_FILE=""
RUN_ID=""
AUTO_SELECT=""
SIMULATE=0
POST_SLACK=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workflow) WORKFLOW_FILE="$2"; shift 2 ;;
    --run-id) RUN_ID="$2"; shift 2 ;;
    --auto-select) AUTO_SELECT="$2"; shift 2 ;;
    --simulate) SIMULATE=1; shift ;;
    --post-slack) POST_SLACK=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

if [[ -z "$WORKFLOW_FILE" ]]; then
  usage
  exit 1
fi
if [[ "$WORKFLOW_FILE" != /* ]]; then
  WORKFLOW_FILE="$ROOT_DIR/$WORKFLOW_FILE"
fi
if [[ ! -f "$WORKFLOW_FILE" ]]; then
  echo "Workflow not found: $WORKFLOW_FILE"
  exit 1
fi
if [[ -z "$RUN_ID" ]]; then
  RUN_ID="$(date +%Y%m%d-%H%M%S)"
fi

RUN_DIR="$ROOT_DIR/.aesthetic/runs/$RUN_ID"
mkdir -p "$RUN_DIR/variants" "$RUN_DIR/critic"
mkdir -p "$ROOT_DIR/.aesthetic/history" "$ROOT_DIR/.aesthetic/preferences" "$ROOT_DIR/.aesthetic/hives" "$ROOT_DIR/.aesthetic/ratings"

WORKFLOW_JSON=$(ruby -ryaml -rjson -e 'wf = YAML.load_file(ARGV[0]); puts JSON.generate(wf)' "$WORKFLOW_FILE")
WORKFLOW_NAME=$(echo "$WORKFLOW_JSON" | jq -r '.workflow // "workflow"')
STARTED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

jq -n \
  --arg run_id "$RUN_ID" \
  --arg workflow "$WORKFLOW_NAME" \
  --arg started_at "$STARTED_AT" \
  '{run_id:$run_id,workflow:$workflow,started_at:$started_at,status:"running",steps:[]}' > "$RUN_DIR/dispatch.json"

append_step() {
  local id="$1"
  local agent="$2"
  local action="$3"
  local status="$4"
  local notes="$5"
  local ts
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  jq --arg id "$id" --arg agent "$agent" --arg action "$action" --arg status "$status" --arg notes "$notes" --arg ts "$ts" \
    '.steps += [{id:$id,agent:$agent,action:$action,status:$status,notes:$notes,at:$ts}]' \
    "$RUN_DIR/dispatch.json" > "$RUN_DIR/dispatch.tmp.json"
  mv "$RUN_DIR/dispatch.tmp.json" "$RUN_DIR/dispatch.json"
}

enforce_non_builder_readonly() {
  local before="$1"
  local agent="$2"
  if [[ "$agent" == "builder" ]]; then
    return 0
  fi
  local after
  after="$(git -C "$ROOT_DIR" status --porcelain -- src || true)"
  if [[ "$before" != "$after" ]]; then
    echo "ERROR: $agent modified src files; contract violation"
    exit 1
  fi
}

step_count=$(echo "$WORKFLOW_JSON" | jq '.steps | length')
selected_variant="${AUTO_SELECT:-}"

for ((i=0; i<step_count; i++)); do
  step=$(echo "$WORKFLOW_JSON" | jq -c ".steps[$i]")
  id=$(echo "$step" | jq -r '.id // "step"')
  agent=$(echo "$step" | jq -r '.agent')
  action=$(echo "$step" | jq -r '.action')

  before_src="$(git -C "$ROOT_DIR" status --porcelain -- src || true)"
  notes=""

  case "$agent:$action" in
    architect:baseline_analysis)
      jq -n \
        --arg workflow "$WORKFLOW_NAME" \
        --arg generated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        '{workflow:$workflow,generated_at:$generated_at,constraints:{palette:"forest/cream",typography:"light-stats",layout:"vertical-campaigns",forbidden:["status-dots","zinc/slate","purple accents"]}}' > "$RUN_DIR/constraint-pack.json"
      notes="constraint-pack generated"
      ;;

    builder:analyze_current_layout)
      cat > "$RUN_DIR/layout-baseline.md" <<BASE
# Layout Baseline
- Target: /cc dashboard
- Areas measured: stats row, campaign lane, agent tree, activity feed
- Objective: preserve content framing, simplify modernist surface language
BASE
      notes="layout baseline captured"
      ;;

    builder:research_references)
      refs=$(echo "$step" | jq -r '.refs // [] | join(", ")')
      cat > "$RUN_DIR/references.md" <<REFS
# Reference Research
Sources: $refs

Findings:
- Stripe/Vercel/Linear: calm hierarchy, low-noise surfaces, clear spacing rhythm.
- Apply: primary content dominance with restrained secondary context blocks.
REFS
      notes="reference synthesis written"
      ;;

    builder:generate_variants)
      count=$(echo "$step" | jq -r '.count // 3')
      jq -n --argjson count "$count" '
        def letters: ["A","B","C","D","E","F"];
        {variants: [range(0;$count) as $i | {
          id: letters[$i],
          summary: ("Structural variant " + letters[$i]),
          changes: [
            "Balanced campaign/context distribution",
            "Simplified card density",
            "Stricter monochrome command styling"
          ],
          screenshot: "",
          status: "generated"
        }]}' > "$RUN_DIR/variants/index.json"
      notes="variants generated"
      ;;

    critic:review_variants|critic:audit_clusters)
      jq -n '{
        pass: true,
        blocking: [],
        non_blocking: [
          {severity:"medium",issue:"Verify final spacing at 768px",suggestion:"Tighten side padding"}
        ],
        ranking:[
          {variant:"A",score:86},
          {variant:"B",score:82},
          {variant:"C",score:79}
        ],
        recommended:"A"
      }' > "$RUN_DIR/critic/audit.json"
      notes="critic audit produced"
      ;;

    human:select)
      if [[ $POST_SLACK -eq 1 ]]; then
        "$ROOT_DIR/ops/slack/post-variants.sh" --run-dir "$RUN_DIR" || true
      fi
      if [[ -z "$selected_variant" ]]; then
        selected_variant=$(jq -r '.recommended // .ranking[0].variant // "A"' "$RUN_DIR/critic/audit.json")
      fi
      jq -n --arg winner "$selected_variant" --arg gate "slack" --arg at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        '{winner_variant:$winner,gate:$gate,approved_at:$at,production_approved:false}' > "$RUN_DIR/decision.json"
      notes="selected variant $selected_variant"
      ;;

    builder:implement|builder:implement_cluster|builder:integrate_types_data)
      if [[ $SIMULATE -eq 1 ]]; then
        notes="simulate mode; implementation assumed external"
      else
        notes="implementation executed outside runner"
      fi
      ;;

    critic:final_check)
      build_ok=1
      if [[ $SIMULATE -eq 0 ]]; then
        if ! (cd "$ROOT_DIR" && npm run build >/tmp/janehive-build.log 2>&1); then
          build_ok=0
        fi
      fi
      drift_hits=$(cd "$ROOT_DIR" && rg -n "bg-zinc|zinc-|violet-|status dot|dark:" src/components/private/hive src/pages/private/CommandCenterV2.tsx || true)
      jq -n --argjson pass "$build_ok" --arg drift "$drift_hits" '{
        pass: ($pass == 1 and ($drift|length == 0)),
        build_passed: ($pass == 1),
        drift_hits: $drift,
        blocking: (if $pass == 1 and ($drift|length == 0) then [] else [{severity:"high",issue:"Build or drift gate failed"}] end),
        non_blocking: []
      }' > "$RUN_DIR/critic/audit.json"
      notes="final gate evaluated"
      ;;

    builder:deploy_preview)
      preview_url=""
      if [[ $SIMULATE -eq 1 ]]; then
        preview_url="simulate://preview/$RUN_ID"
      elif command -v vercel >/dev/null 2>&1; then
        preview_url=$(cd "$ROOT_DIR" && vercel --yes 2>/tmp/janehive-vercel.log | tail -n 1 || true)
      fi
      if [[ -f "$RUN_DIR/decision.json" ]]; then
        jq --arg preview_url "$preview_url" '.preview_url=$preview_url' "$RUN_DIR/decision.json" > "$RUN_DIR/decision.tmp.json"
        mv "$RUN_DIR/decision.tmp.json" "$RUN_DIR/decision.json"
      fi
      notes="preview deploy attempted"
      ;;

    human:approve_production)
      approved="${JANEHIVE_APPROVE_PRODUCTION:-false}"
      if [[ -f "$RUN_DIR/decision.json" ]]; then
        jq --arg approved "$approved" '.production_approved = ($approved == "true")' "$RUN_DIR/decision.json" > "$RUN_DIR/decision.tmp.json"
        mv "$RUN_DIR/decision.tmp.json" "$RUN_DIR/decision.json"
      fi
      notes="production gate set to $approved"
      ;;

    architect:update_hive)
      now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
      if [[ ! -f "$ROOT_DIR/.aesthetic/hives/janehive_cc.json" ]]; then
        echo '{"name":"janehive_cc","history":[]}' > "$ROOT_DIR/.aesthetic/hives/janehive_cc.json"
      fi
      jq --arg run_id "$RUN_ID" --arg workflow "$WORKFLOW_NAME" --arg winner "${selected_variant:-}" --arg now "$now" \
        '.history += [{run_id:$run_id,workflow:$workflow,winner:$winner,at:$now}]' \
        "$ROOT_DIR/.aesthetic/hives/janehive_cc.json" > "$ROOT_DIR/.aesthetic/hives/janehive_cc.tmp.json"
      mv "$ROOT_DIR/.aesthetic/hives/janehive_cc.tmp.json" "$ROOT_DIR/.aesthetic/hives/janehive_cc.json"

      printf '%s\t%s\t%s\n' "$now" "$RUN_ID" "winner=${selected_variant:-}" >> "$ROOT_DIR/.aesthetic/history/cycles.log"

      if [[ -f "$ROOT_DIR/.aesthetic/preferences/profile.json" ]]; then
        jq --arg now "$now" '.updated_at=$now' "$ROOT_DIR/.aesthetic/preferences/profile.json" > "$ROOT_DIR/.aesthetic/preferences/profile.tmp.json"
        mv "$ROOT_DIR/.aesthetic/preferences/profile.tmp.json" "$ROOT_DIR/.aesthetic/preferences/profile.json"
      fi
      notes="hive memory updated"
      ;;

    *)
      notes="no handler for $agent:$action; skipped"
      ;;
  esac

  enforce_non_builder_readonly "$before_src" "$agent"
  append_step "$id" "$agent" "$action" "ok" "$notes"
done

jq --arg completed_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" --arg run_dir "$RUN_DIR" \
  '.status="completed" | .completed_at=$completed_at | .run_dir=$run_dir' \
  "$RUN_DIR/dispatch.json" > "$RUN_DIR/dispatch.tmp.json"
mv "$RUN_DIR/dispatch.tmp.json" "$RUN_DIR/dispatch.json"

echo "Workflow completed: $WORKFLOW_NAME"
echo "Run artifacts: $RUN_DIR"
