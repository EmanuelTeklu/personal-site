"""AI agent endpoint — SSE streaming chat."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from api.middleware.auth import verify_token
from api.services.agent_runner import stream_agent

router = APIRouter(tags=["agent"])


class ChatRequest(BaseModel):
    """Incoming chat request."""
    messages: list[dict[str, Any]]
    extra_context: str = ""


@router.post("/agent/run")
async def run_agent(
    request: ChatRequest,
    _user: dict = Depends(verify_token),
) -> EventSourceResponse:
    """Stream an AI agent response via SSE."""
    return EventSourceResponse(
        stream_agent(
            messages=request.messages,
            extra_context=request.extra_context,
        ),
        media_type="text/event-stream",
    )
