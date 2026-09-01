from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from src.schemas.projects import ProjectRecommendRequest, ProjectRecommendResponse
from src.services.project_recommender import recommend_portfolio_projects

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/recommend", response_model=ProjectRecommendResponse)
async def recommend_projects_endpoint(request: ProjectRecommendRequest):
    try:
        result = await run_in_threadpool(recommend_portfolio_projects, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
