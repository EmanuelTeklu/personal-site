"""Overnight task queue endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.middleware.auth import verify_token
from api.services.file_reader import TASK_QUEUE_PATH, read_json, write_json

router = APIRouter(tags=["overnight"])


class TaskItem(BaseModel):
    """Schema for adding a task to the overnight queue."""
    description: str
    priority: str = "normal"


@router.get("/overnight")
def get_overnight_queue(_user: dict = Depends(verify_token)) -> list[Any]:
    """Return the current task queue."""
    data = read_json(TASK_QUEUE_PATH)
    if data is None:
        return []
    return data


@router.post("/overnight")
def add_overnight_task(
    task: TaskItem,
    _user: dict = Depends(verify_token),
) -> dict:
    """Append a task to the overnight queue."""
    queue = read_json(TASK_QUEUE_PATH) or []
    if not isinstance(queue, list):
        raise HTTPException(status_code=500, detail="Task queue is malformed")

    new_task = {
        "description": task.description,
        "priority": task.priority,
        "status": "queued",
    }
    updated_queue = [*queue, new_task]
    write_json(TASK_QUEUE_PATH, updated_queue)
    return {"ok": True, "task": new_task, "queue_length": len(updated_queue)}
