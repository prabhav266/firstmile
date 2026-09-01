import json
import asyncio
from src.services.llm_client import generate_text
from src.schemas.projects import ProjectRecommendRequest, ProjectRecommendResponse, ProjectIdea

def recommend_portfolio_projects(req: ProjectRecommendRequest) -> ProjectRecommendResponse:
    return asyncio.run(_recommend_portfolio_projects(req))

async def _recommend_portfolio_projects(req: ProjectRecommendRequest) -> ProjectRecommendResponse:
    prompt = f"""
    You are a Principal Software Architect and Placement Mentor.
    Recommend 3 high-impact, production-grade portfolio projects for a student aiming for top engineering roles.
    Candidate Known Skills: {', '.join(req.skills)}
    Career Goal / Target Role: {req.career_goal}
    Experience Level: {req.experience_level}

    Provide the output STRICTLY as a single valid JSON object containing a "projects" array. Do NOT include markdown code block syntax.
    Required fields per project:
    - title: string
    - description: string
    - difficulty: string (EASY, MEDIUM, or HARD)
    - tech_stack: list of strings
    - architecture: string (e.g. Event-Driven Microservices, CQRS, Layered MVC, Serverless)
    - learning_outcome: string
    - estimated_days: int
    - resume_impact: int (70 to 98)
    """

    try:
        res_text = await generate_text(prompt)
        res_text = res_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(res_text)
        
        projects = []
        for p in data.get("projects", []):
            projects.append(ProjectIdea(
                title=str(p.get("title")),
                description=str(p.get("description")),
                difficulty=str(p.get("difficulty", "HARD")),
                tech_stack=list(p.get("tech_stack", [])),
                architecture=str(p.get("architecture", "Event-Driven Microservice")),
                learning_outcome=str(p.get("learning_outcome", "Master distributed systems and high-throughput API design")),
                estimated_days=int(p.get("estimated_days", 14)),
                resume_impact=int(p.get("resume_impact", 90))
            ))
        if projects:
            return ProjectRecommendResponse(projects=projects)
    except Exception as e:
        print(f"[Project Recommender Service] LLM execution or JSON parsing failed: {e}. Running dynamic recommendation engine.")

    # Dynamic Custom Project Generator based on candidate skills & career goals
    return recommend_dynamic_projects(req)


def recommend_dynamic_projects(req: ProjectRecommendRequest) -> ProjectRecommendResponse:
    skills = [s.lower() for s in req.skills]
    goal = req.career_goal.lower() if req.career_goal else "software engineer"
    
    projects = []

    # Project 1: Specialized based on tech stack
    if "python" in skills or "fastapi" in skills or "machine learning" in goal or "ai" in goal:
        projects.append(ProjectIdea(
            title="Real-Time Event-Driven Vector RAG Search Engine",
            description="Production-grade Retrieval-Augmented Generation pipeline parsing documentation PDFs into FAISS vector embeddings for semantic query retrieval.",
            difficulty="HARD",
            tech_stack=["Python", "FastAPI", "FAISS", "LangChain", "Docker", "PostgreSQL"],
            architecture="Event-Driven Microservice Architecture",
            learning_outcome="Master vector embeddings, similarity search algorithms, and async API stream processing.",
            estimated_days=14,
            resume_impact=95
        ))
    elif "react" in skills or "next.js" in skills or "frontend" in goal:
        projects.append(ProjectIdea(
            title="Real-Time Collaborative Code Workspace & Virtual Canvas",
            description="Multi-user interactive IDE supporting synchronized cursor tracking, CRDT state resolution, and dynamic WebGL canvas renders.",
            difficulty="HARD",
            tech_stack=["Next.js 15", "TypeScript", "Tailwind CSS", "WebSockets", "Redis", "Yjs"],
            architecture="Client-Server WebSocket Broadcast Architecture",
            learning_outcome="Master real-time state synchronization, WebSockets heartbeat handlers, and high-performance canvas renders.",
            estimated_days=12,
            resume_impact=92
        ))
    else:
        projects.append(ProjectIdea(
            title="High-Throughput Distributed Rate-Limiting API Gateway",
            description="Custom API gateway enforcing token bucket and sliding window log algorithms for 50,000+ concurrent requests.",
            difficulty="HARD",
            tech_stack=["Node.js", "TypeScript", "Redis", "Docker", "Nginx", "Prometheus"],
            architecture="Reverse Proxy & Middleware Layer",
            learning_outcome="Master distributed locking, Redis data structures, and memory-efficient concurrency control.",
            estimated_days=10,
            resume_impact=94
        ))

    # Project 2: Cloud / Systems / Backend
    projects.append(ProjectIdea(
        title="Distributed Microservice Job Queue Engine with Dead-Letter Handling",
        description="Asynchronous background task processing queue supporting priority scheduling, exponential backoff retries, and failure alerts.",
        difficulty="MEDIUM",
        tech_stack=["Python" if "python" in skills else "Node.js", "RabbitMQ", "Redis", "Docker", "PostgreSQL"],
        architecture="Publisher-Subscriber Queue Architecture",
        learning_outcome="Master message queues, worker thread pooling, and idempotent database transactions.",
        estimated_days=10,
        resume_impact=88
    ))

    # Project 3: Fullstack Platform
    projects.append(ProjectIdea(
        title="Telemetry & Error Performance Monitoring Dashboard",
        description="Centralized APM tool capturing client stack traces, network latency percentiles (p95/p99), and real-time alert webhooks.",
        difficulty="MEDIUM",
        tech_stack=["React", "TypeScript", "Recharts", "Express", "PostgreSQL", "Tailwind CSS"],
        architecture="Layered MVC SPA Architecture",
        learning_outcome="Master time-series aggregation queries, SQL database indexing, and interactive data visualization dashboards.",
        estimated_days=8,
        resume_impact=85
    ))

    return ProjectRecommendResponse(projects=projects)
