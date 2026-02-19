# Slack Runtime

Scripts:
- `post-variants.sh` posts variant threads to Slack.
- `capture-feedback.sh` ingests thread reactions/comments into `.aesthetic/ratings/`.

Required env vars:
- `SLACK_BOT_TOKEN`
- `SLACK_CHANNEL_ID` (or pass `--channel`)
