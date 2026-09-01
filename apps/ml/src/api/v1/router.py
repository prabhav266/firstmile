from fastapi import APIRouter
from src.api.v1.routes import health, resume, roadmap, projects, readiness, interview

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(resume.router)
api_router.include_router(roadmap.router)
api_router.include_router(projects.router)
api_router.include_router(readiness.router)
api_router.include_router(interview.router)
