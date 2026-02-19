"""FastAPI sidecar — serves ClawdBot data to the emanuelteklu frontend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import health, tokens, overnight, research, agent, signals

app = FastAPI(title="emanuelteklu-api", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5180",
        "https://emanuelteklu.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(tokens.router, prefix="/api")
app.include_router(overnight.router, prefix="/api")
app.include_router(research.router, prefix="/api")
app.include_router(agent.router, prefix="/api")
app.include_router(signals.router, prefix="/api")
