import google.generativeai as genai
from src.core.config import settings

# Initialize Gemini
if settings.GEMINI_API_KEY and "YOUR_GEMINI_API_KEY" not in settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    print("[WARNING] GEMINI_API_KEY is not set. Gemini services will mock output.")

async def generate_text(prompt: str, temperature: float = 0.3) -> str:
    """Generate content from Gemini LLM with dynamic heuristic fallback in services if key is absent"""
    if not settings.GEMINI_API_KEY or "YOUR_GEMINI_API_KEY" in settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set. Delegate to dynamic heuristic analyzer.")
        
    try:
        model_names = [settings.GEMINI_MODEL, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']
        model = None
        for m_name in model_names:
            try:
                model = genai.GenerativeModel(m_name)
                break
            except Exception:
                continue

        if not model:
            model = genai.GenerativeModel('gemini-1.5-flash')

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=8192,
            )
        )
        return response.text
    except Exception as e:
        print(f"[Gemini Client Error] LLM generation failed: {e}")
        raise e

def get_mock_response(prompt: str) -> str:
    """Fallback mock generator matching expected JSON shapes in prompts"""
    prompt_lower = prompt.lower()
    
    # 1. Resume Analysis Mock Response
    if "resume" in prompt_lower or "ats" in prompt_lower:
        return """
        {
          "ats_score": 85.0,
          "grammar_score": 9.0,
          "resume_rating": 8.5,
          "missing_skills": ["System Design", "Cloud Deployment", "Docker", "DevOps"],
          "weak_bullets": [
            "Responsible for writing clean Javascript code",
            "Worked closely with other students to build a website"
          ],
          "suggestions": [
            "Inject quantitative impact stats (e.g. Optimized queries by 40%)",
            "Add a clear summary section outlining target positions",
            "Define cloud infrastructure services utilized in projects"
          ],
          "project_suggestions": [
            "Build a cloud scalable microservices engine using Docker & Kubernetes",
            "Create a real-time data streaming pipeline with Redis & WebSocket"
          ]
        }
        """
        
    # 2. Roadmap Generation Mock Response
    if "roadmap" in prompt_lower:
        return """
        {
          "daily_plan": [
            {"day": 1, "task": "Learn dynamic programming complexity analysis", "resource": "Striver A2Z"},
            {"day": 2, "task": "Solve DP knapsack variations on Leetcode", "resource": "Leetcode Medium"}
          ],
          "weekly_plan": [
            {"week": 1, "topic": "DSA Recursion & Backtracking trees", "outcome": "Master backtrack patterns"},
            {"week": 2, "topic": "Next.js App Router API design & cookies", "outcome": "Full stack authorization integration"}
          ],
          "monthly_plan": [
            {"month": 1, "milestone": "Master core DSA, complete 50 Leetcode problems", "timeline": "Month 1"},
            {"month": 2, "milestone": "Launch backend portfolio microservice with authentication", "timeline": "Month 2"}
          ],
          "timeline": "6 Months",
          "topics": ["Algorithms", "Next.js", "Docker", "PostgreSQL"]
        }
        """
        
    # 3. Project Recommendations Mock Response
    if "project" in prompt_lower or "recommendation" in prompt_lower:
        return """
        {
          "projects": [
            {
              "title": "PathForge AI Backend Microservice",
              "description": "An AI-powered recruiter screening pipeline for student career growth.",
              "difficulty": "HARD",
              "tech_stack": ["FastAPI", "Python", "Docker", "PostgreSQL", "Gemini API"],
              "architecture": "Layered MVC Microservice with RabbitMQ queue routing",
              "learning_outcome": "Master AI APIs integration, system architecture design, and database relationships",
              "estimated_days": 14,
              "resume_impact": 95
            },
            {
              "title": "Real-time Coding Dashboard",
              "description": "Visualizing user statistics and Leetcode contribution heatmaps in real-time.",
              "difficulty": "MEDIUM",
              "tech_stack": ["Next.js 15", "TypeScript", "Tailwind CSS", "Recharts"],
              "architecture": "SPA client with server action queries",
              "learning_outcome": "Build responsive interactive dashboards and custom canvas renders",
              "estimated_days": 7,
              "resume_impact": 80
            }
          ]
        }
        """
        
    # 4. Interview Evaluation Mock Response
    if "interview" in prompt_lower or "evaluate" in prompt_lower:
        return """
        {
          "score": 8.0,
          "correctness": "Highly correct definition of processes vs threads. Missing virtual memory allocations details.",
          "grammar": "Clean speech, no grammatical errors detected.",
          "technical_quality": "Good, mentions virtual spacing and context-switching overhead.",
          "feedback": "Explain process virtual layout tables next time for deep impact.",
          "suggested_answer": "Processes run in isolated address spaces; threads share memory bounds. Context switching threads is cheaper."
        }
        """
        
    return '{"status": "success"}'
