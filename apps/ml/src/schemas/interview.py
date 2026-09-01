from pydantic import BaseModel

class InterviewEvaluateRequest(BaseModel):
    question: str
    answer: str
    role: str
    difficulty: str

class InterviewEvaluateResponse(BaseModel):
    score: float
    correctness: str
    grammar: str
    technical_quality: str
    feedback: str
    suggested_answer: str
