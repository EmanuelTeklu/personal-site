from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid

# Import our services
from api.services.fire_crawl import FireCrawlService, ScrapeResult
from api.services.imagen_service import ImagenService, DesignOption, TasteProfile

router = APIRouter(prefix="/api/taste", tags=["Taste Tuner"])

# Singletons for services
fire_crawl = FireCrawlService()
imagen = ImagenService()

# --- Models ---

class StartSessionRequest(BaseModel):
    user_id: Optional[str] = "anon"
    initial_prompt: Optional[str] = "Personal website inspiration"

class SessionResponse(BaseModel):
    session_id: str
    message: str

class GenerateRoundRequest(BaseModel):
    session_id: str
    prompt: str
    round_number: int

class SelectionRequest(BaseModel):
    session_id: str
    selected_option_id: str
    round_number: int
    history: List[str]  # Added history for vector refinement

# --- Endpoints ---

@router.post("/start", response_model=SessionResponse)
async def start_session(req: StartSessionRequest):
    """
    Initializes a new Taste Tuning session.
    """
    session_id = str(uuid.uuid4())
    print(f"🚀 API: Starting session {session_id} for user {req.user_id}")
    return SessionResponse(
        session_id=session_id,
        message="Session initialized. Agent loop engaged."
    )

@router.post("/round")
async def generate_round(req: GenerateRoundRequest):
    """
    Generates 4 design options based on the prompt + current session taste.
    """
    print(f"🎨 API: Generating round {req.round_number} for session {req.session_id}")
    
    # In a real app, retrieve taste_profile weights from DB using session_id
    # For now, we'll start fresh or simulate based on round advancement
    current_taste = TasteProfile() 
    
    try:
        options = await imagen.generate_round(req.prompt, current_taste)
        return {"options": options, "round": req.round_number}
    except Exception as e:
        print(f"Error in round generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/select")
async def select_option(req: SelectionRequest):
    """
    Records the user's selection and updates the taste profile.
    """
    print(f"✅ API: User selected {req.selected_option_id}. Total history: {len(req.history)} items.")
    
    # Refine the taste profile based on the historical selections
    new_profile = await imagen.refine_taste(req.selected_option_id, req.history)
    
    return {
        "message": "Aesthetic DNA refined",
        "next_round": req.round_number + 1,
        "chaos_level": new_profile.chaos_level,
        "preferred_styles": new_profile.preferred_styles
    }

@router.post("/crawl")
async def crawl_url(url: str):
    """
    Analyze a URL's design DNA.
    """
    try:
        result = await fire_crawl.analyze_url(url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
