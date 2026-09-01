from pydantic import BaseModel
from typing import List, Dict

class ReadinessScoreRequest(BaseModel):
    dsa_problems_solved: int
    ml_hours: int
    project_count: int
    resume_score: float
    coding_streak: int
    skill_levels: Dict[str, float]

class ReadinessScoreResponse(BaseModel):
    overall_score: float
    dsa_score: float
    dev_score: float
    ml_score: float
    project_score: float
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
