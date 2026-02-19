# Feedback Format

## Phase 1 (Current): 15-Minute Checkpoint Format
At each checkpoint, report exactly:
1. What changed.
2. What improved visually.
3. Drift observed.
4. One rating request in 5D rubric.

## 5D Rating Rubric
- Typography
- Palette fidelity
- Layout hierarchy
- Operational tone
- Distinctiveness

Scoring suggestion: 1-5 per dimension + one freeform note.

## Suggested Checkpoint Message Template
```text
Checkpoint T+15
- Changed: [files + structure]
- Improved: [visual outcomes]
- Drift observed: [issue, if any]
- Rate this pass (1-5):
  - Typography:
  - Palette fidelity:
  - Layout hierarchy:
  - Operational tone:
  - Distinctiveness:
- One sentence: [what to keep / what to kill]
```

## Phase 2: Slack-Based Taste Extraction (Adopted)
Your addendum is accepted as the default Phase 2 feedback system.

### Emoji Vocabulary and Weights
- ✅ winner: +3
- 🎯 close to target: +2
- 🔥 strong positive element: +2
- 👍 good direction: +1
- 😐 neutral: 0
- 👎 wrong direction: -1
- 💀 generic drift: -2
- ❌ hard reject: -3
- 💬 qualitative comment marker

### Output Artifacts
- `/.aesthetic/ratings/cycle-N-slack.json`
- `/.aesthetic/ratings/preference-profile.json`

### PM Brief Ingestion Rule
Each new PM brief must include:
1. `APPLY` signals from positive reactions/comments.
2. `AVOID` signals from negative reactions/comments.
3. Winner pattern summary with explicit variant IDs.
