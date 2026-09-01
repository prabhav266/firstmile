from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from src.schemas.resume import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from src.services.resume_analyzer import analyze_resume_text

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/analyze", response_model=ResumeAnalyzeResponse)
async def analyze_resume_endpoint(request: ResumeAnalyzeRequest):
    try:
        # run_in_threadpool pushes CPU-bound prompts to worker threads, preventing event-loop blocks
        result = await run_in_threadpool(
            analyze_resume_text, 
            request.raw_text, 
            request.job_role or "Software Engineer"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
