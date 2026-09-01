from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1.router import api_router
from src.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print("[FASTAPI ML SERVICE] Initializing Scikit-learn placement models & NLP resume parser...")
    # Load model binaries if any
    yield
    # Shutdown actions
    print("[FASTAPI ML SERVICE] Shutting down and clearing CPU model caches...")

app = FastAPI(
    title="PathForge AI — Machine Learning Service",
    description="Python microservice serving recommendation engines, resume keywords extraction, and placement readiness predictions.",
    version="1.0.0",
    lifespan=lifespan,
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
