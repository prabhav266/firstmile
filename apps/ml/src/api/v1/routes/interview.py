from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from src.schemas.interview import InterviewEvaluateRequest, InterviewEvaluateResponse
from src.services.interview_evaluator import evaluate_interview_response

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/evaluate", response_model=InterviewEvaluateResponse)
async def evaluate_endpoint(request: InterviewEvaluateRequest):
    try:
        result = await run_in_threadpool(evaluate_interview_response, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
