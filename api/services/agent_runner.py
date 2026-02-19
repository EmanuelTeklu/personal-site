"""
Agent runner — wraps ClawdBot's agentic loop for SSE streaming.

Instead of importing ClawdBot directly (which has complex dependencies),
we use a simplified version that calls the Anthropic API with tool definitions
and streams events back to the frontend.
"""

from __future__ import annotations

import json
import logging
import os
from collections.abc import AsyncGenerator
from typing import Any

import anthropic

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-20250514")
MAX_TOKENS = 4096

SYSTEM_PROMPT = """You are ClawdBot, Manny's personal AI assistant. You help with:
- Answering questions about projects and code
- Research and analysis
- Task management and planning
- Technical discussions

Be concise, direct, and helpful. Use your tools when needed."""


async def stream_agent(
    messages: list[dict[str, Any]],
    extra_context: str = "",
) -> AsyncGenerator[str, None]:
    """Run the agent loop, yielding SSE events as they happen.

    Events:
      - {"type": "text", "content": "..."}  — streamed text chunk
      - {"type": "tool_use", "name": "...", "input": {...}}  — tool call indicator
      - {"type": "tool_result", "name": "...", "result": "..."}  — tool result
      - {"type": "done"}  — stream complete
      - {"type": "error", "message": "..."}  — error
    """
    if not ANTHROPIC_API_KEY:
        yield _sse({"type": "error", "message": "ANTHROPIC_API_KEY not configured"})
        return

    client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    system = f"{SYSTEM_PROMPT}\n\n{extra_context}" if extra_context else SYSTEM_PROMPT

    try:
        # Stream the initial response
        async with client.messages.stream(
            model=CLAUDE_MODEL,
            max_tokens=MAX_TOKENS,
            system=system,
            messages=messages,
        ) as stream:
            async for event in stream:
                if event.type == "content_block_delta":
                    if hasattr(event.delta, "text"):
                        yield _sse({"type": "text", "content": event.delta.text})

        yield _sse({"type": "done"})

    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        yield _sse({"type": "error", "message": f"API error: {e.message}"})
    except Exception as e:
        logger.error(f"Agent error: {e}")
        yield _sse({"type": "error", "message": str(e)})


def _sse(data: dict[str, Any]) -> str:
    """Format a dict as an SSE data line."""
    return f"data: {json.dumps(data)}\n\n"
