# Phase 2 Spec — Slack-Based Taste Extraction

## Goal
Replace standalone rating UI with a low-friction Slack-native feedback loop that captures reactions/comments and feeds preference memory into the next cycle brief.

## Workflow
1. Builder generates 3-6 variants with IDs (`cycle-N-variant-X`).
2. Publisher posts cycle summary + variant screenshots/preview links to Slack thread.
3. Human reacts/comments naturally in Slack.
4. Feedback collector ingests reactions/replies and writes structured files.
5. PM agent reads cycle feedback and preference profile before writing next brief.

## Required Artifacts
- `/.aesthetic/ratings/cycle-N-slack.json`
- `/.aesthetic/ratings/preference-profile.json`
- `/.aesthetic/state/slack-thread-map.json` (variant ID to message/thread IDs)

## Slack App Scope
- `chat:write`
- `reactions:read`
- `channels:history`
- `channels:read`

## Services
1. Variant posting script
- Input: cycle ID, variant metadata, image paths/preview URLs.
- Output: root post + per-variant thread replies; persists message IDs.

2. Feedback capture script
- Poll or event-driven capture within 5 minutes.
- Aggregates emoji and thread comments by variant ID.

3. Preference extraction script
- Converts reactions/comments into weighted preferences.
- Updates cumulative profile with confidence values.

## JSON Shape
```json
{
  "cycle": 3,
  "captured_at": "2026-02-19T14:32:00Z",
  "variants": {
    "A": {
      "variant_id": "cycle-3-variant-A",
      "reactions": ["✅", "🔥"],
      "comments": ["The typography weight on the stats is perfect here"],
      "score": 5
    }
  },
  "winner": "A",
  "extracted_preferences": [
    { "polarity": "positive", "element": "typography weight", "context": "stats", "weight": 2 },
    { "polarity": "negative", "element": "blue accents", "context": "global", "weight": -3 }
  ]
}
```

## PM Prompt Contract
Each cycle brief must include a `Feedback Carryover` block:
- `APPLY:` prioritized positive preferences with evidence.
- `AVOID:` hard negatives with evidence.
- `WINNER PATTERN:` what repeated in winning variants.

## Acceptance Criteria
1. Slack reactions/comments captured within 5 minutes.
2. Captured data is written to cycle JSON.
3. PM brief cites at least 2 explicit signals from latest cycle.
4. Preference profile trends stabilize after 3+ cycles.
