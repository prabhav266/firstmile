from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from src.schemas.roadmap import RoadmapGenerateRequest, RoadmapGenerateResponse
from src.services.roadmap_generator import generate_career_roadmap

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

@router.post("/generate", response_model=RoadmapGenerateResponse)
async def generate_roadmap_endpoint(request: RoadmapGenerateRequest):
    try:
        result = await run_in_threadpool(generate_career_roadmap, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
