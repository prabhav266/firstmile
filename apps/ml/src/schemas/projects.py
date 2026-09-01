from pydantic import BaseModel
from typing import List

class ProjectIdea(BaseModel):
    title: str
    description: str
    difficulty: str
    tech_stack: List[str]
    architecture: str
    learning_outcome: str
    estimated_days: int
    resume_impact: int

class ProjectRecommendRequest(BaseModel):
    skills: List[str]
    career_goal: str
    experience_level: str

class ProjectRecommendResponse(BaseModel):
    projects: List[ProjectIdea]
