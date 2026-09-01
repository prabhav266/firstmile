from pydantic import BaseModel
from typing import List, Dict, Any

class RoadmapGenerateRequest(BaseModel):
    target_company: str
    target_package: float
    current_year: int
    branch: str
    known_skills: List[str]

class RoadmapGenerateResponse(BaseModel):
    daily_plan: List[Dict[str, Any]]
    weekly_plan: List[Dict[str, Any]]
    monthly_plan: List[Dict[str, Any]]
    timeline: str
    topics: List[str]
