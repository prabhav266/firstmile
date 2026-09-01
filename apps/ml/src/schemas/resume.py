from pydantic import BaseModel
from typing import List, Optional

class ResumeAnalyzeRequest(BaseModel):
    raw_text: str
    job_role: Optional[str] = "Software Engineer"

class ResumeAnalyzeResponse(BaseModel):
    ats_score: float
    grammar_score: float
    resume_rating: float
    missing_skills: List[str]
    weak_bullets: List[str]
    suggestions: List[str]
    project_suggestions: List[str]
