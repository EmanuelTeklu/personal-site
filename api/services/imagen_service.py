import random
from pydantic import BaseModel
from typing import List, Dict, Any

class DesignOption(BaseModel):
    id: str
    prompt: str
    image_url: str
    style_category: str
    confidence_score: float
    metadata: Dict[str, Any] = {}

class TasteProfile(BaseModel):
    preferred_styles: List[str] = []
    style_weights: Dict[str, float] = {}
    chaos_level: float = 0.5

class ImagenService:
    """
    Advanced Generative Designer.
    Uses a taste vector to steer generation outcomes.
    """

    ARCHETYPES = {
        "The Architect": "Swiss typography, minimal grids, monochrome, architectural layout",
        "The Signal": "Neon accents, high contrast, bold sans-serif, energetic movements",
        "The Manuscript": "Serif dominance, antique palettes, cream backgrounds, editorial focus",
        "The Terminal": "Monospace, data-dense, dark background, technical blueprints",
        "The Glass": "Backdrop blur, soft gradients, translucent layers, modern depth"
    }

    async def generate_round(self, prompt: str, taste_profile: TasteProfile) -> List[DesignOption]:
        """
        Generates 4 variants. The generation is steered by the 'Taste Profile' vector.
        """
        print(f"🎨 Imagen: Refining design universe for '{prompt}'...")
        
        # Select 4 distinct directions. If we have taste preferences, lean into them.
        selections = []
        if taste_profile.preferred_styles:
            # High probability of picking preferred styles, low probability of 'mutation' (chaos)
            selections.append(random.choice(taste_profile.preferred_styles))
        
        remaining_slots = 4 - len(selections)
        other_styles = [s for s in self.ARCHETYPES.keys() if s not in selections]
        selections.extend(random.sample(other_styles, remaining_slots))
        
        random.shuffle(selections)

        options = []
        for i, style_name in enumerate(selections):
            style_desc = self.ARCHETYPES[style_name]
            # Use real search query terms to influence the mock image for now
            # In production, this calls 'generate_image' internally
            options.append(DesignOption(
                id=f"design_{style_name.lower().replace(' ', '_')}_{i}",
                prompt=f"{prompt}, {style_desc}",
                image_url=f"https://source.unsplash.com/featured/800x600?{style_name.lower().replace(' ', ',')},design",
                style_category=style_name,
                confidence_score=round(random.uniform(0.8, 0.98), 2),
                metadata={"style_description": style_desc}
            ))
            
        return options

    async def refine_taste(self, selection_id: str, selections_history: List[str]) -> TasteProfile:
        """
        Mathematical refinement of the taste vector.
        """
        # Count frequency of style categories to build the vector
        profile = TasteProfile()
        for s in selections_history:
            profile.style_weights[s] = profile.style_weights.get(s, 0) + 1.0
        
        # Set primary styles as those with highest weights
        sorted_styles = sorted(profile.style_weights.items(), key=lambda x: x[1], reverse=True)
        profile.preferred_styles = [s[0] for s in sorted_styles[:2]]
        
        # Decrease chaos as history builds
        profile.chaos_level = max(0.1, 0.5 - (len(selections_history) * 0.05))
        
        return profile
