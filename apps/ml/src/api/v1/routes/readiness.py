from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from src.schemas.readiness import ReadinessScoreRequest, ReadinessScoreResponse
from src.services.readiness_scorer import calculate_placement_readiness

router = APIRouter(prefix="/readiness", tags=["Readiness"])

@router.post("/score", response_model=ReadinessScoreResponse)
async def score_endpoint(request: ReadinessScoreRequest):
    try:
        result = await run_in_threadpool(calculate_placement_readiness, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
