import json
import re
import asyncio
from src.services.llm_client import generate_text
from src.schemas.resume import ResumeAnalyzeResponse

def analyze_resume_text(raw_text: str, job_role: str) -> ResumeAnalyzeResponse:
    return asyncio.run(_analyze_resume_text(raw_text, job_role))

async def _analyze_resume_text(raw_text: str, job_role: str) -> ResumeAnalyzeResponse:
    prompt = f"""
    You are an expert technical recruiter and ATS software analyzer.
    Analyze the following resume text details for the target job role: '{job_role}'.
    Provide your output STRICTLY as a single valid JSON object containing the fields below. Do not include markdown code block syntax. Just the raw JSON string.

    Required JSON fields:
    - ats_score: float (0.0 to 100.0)
    - grammar_score: float (0.0 to 10.0)
    - resume_rating: float (0.0 to 10.0)
    - missing_skills: list of strings
    - weak_bullets: list of strings
    - suggestions: list of strings
    - project_suggestions: list of strings

    Resume Text:
    {raw_text}
    """

    try:
        res_text = await generate_text(prompt)
        res_text = res_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(res_text)
        
        # If LLM returned valid non-empty data, check if it's the static mock or dynamic
        if data.get("ats_score") and data.get("missing_skills"):
            return ResumeAnalyzeResponse(
                ats_score=float(data.get("ats_score", 70.0)),
                grammar_score=float(data.get("grammar_score", 7.5)),
                resume_rating=float(data.get("resume_rating", 7.0)),
                missing_skills=list(data.get("missing_skills", [])),
                weak_bullets=list(data.get("weak_bullets", [])),
                suggestions=list(data.get("suggestions", [])),
                project_suggestions=list(data.get("project_suggestions", []))
            )
    except Exception as e:
        print(f"[Resume Analyzer] LLM execution or JSON parsing failed: {e}. Running dynamic heuristic analysis.")

    # Dynamic Heuristic Resume Parser (Ensures unique output per resume even without LLM key)
    return run_dynamic_resume_analysis(raw_text, job_role)


def run_dynamic_resume_analysis(text: str, role: str) -> ResumeAnalyzeResponse:
    text_lower = text.lower()
    words = re.findall(r'\w+', text_lower)
    word_count = len(words)
    
    # 1. Tech Skills Matrix Analysis
    all_tech_skills = {
        "software engineer": ["python", "java", "javascript", "typescript", "react", "node.js", "express", "sql", "postgresql", "mongodb", "git", "docker", "aws", "system design", "rest api", "data structures", "algorithms"],
        "frontend": ["javascript", "typescript", "react", "next.js", "html", "css", "tailwind", "redux", "web performance", "webpack", "jest", "git"],
        "backend": ["python", "java", "node.js", "express", "fastapi", "sql", "postgresql", "mongodb", "redis", "docker", "kubernetes", "system design", "microservices", "kafka", "aws"],
        "machine learning": ["python", "numpy", "pandas", "scikit-learn", "tensorflow", "pytorch", "deep learning", "nlp", "computer vision", "sql", "git", "data analysis"]
    }
    
    target_role_key = "software engineer"
    for k in all_tech_skills:
        if k in role.lower():
            target_role_key = k
            break
            
    expected_skills = all_tech_skills[target_role_key]
    
    found_skills = [s for s in expected_skills if s in text_lower]
    missing_skills = [s.title() for s in expected_skills if s not in text_lower]
    
    # 2. ATS Score Calculation
    base_score = 40.0
    
    # Keyword coverage score (up to 40 pts)
    keyword_coverage = (len(found_skills) / max(1, len(expected_skills))) * 40.0
    base_score += keyword_coverage
    
    # Length & Structure score (up to 10 pts)
    if word_count > 200:
        base_score += 10.0
    elif word_count > 100:
        base_score += 5.0
        
    # Metrics / Quantifiable Achievements check (up to 10 pts)
    has_metrics = bool(re.search(r'\d+%|\d+\+|ms|seconds|users|traffic|dollars|\$', text_lower))
    if has_metrics:
        base_score += 10.0

    ats_score = round(min(98.0, max(35.0, base_score)), 1)
    
    # 3. Grammar & Bullet Analysis
    weak_bullets = []
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    passive_words = ["responsible for", "worked on", "helped with", "assisted in", "involved in", "handled", "did"]
    for line in lines:
        for pw in passive_words:
            if pw in line.lower() and len(line) < 120:
                weak_bullets.append(line[:90] + ("..." if len(line) > 90 else ""))
                break
        if len(weak_bullets) >= 3:
            break
            
    if not weak_bullets:
        weak_bullets = ["Used generic responsibility bullet descriptions instead of action-oriented phrases."]
        
    # Grammar Score
    grammar_score = 9.0 if len(words) > 50 else 6.5
    resume_rating = round((ats_score / 10.0) * 0.85 + (grammar_score * 0.15), 1)

    # 4. Suggestions Tailored to Found Gaps
    suggestions = []
    if missing_skills:
        suggestions.append(f"Add relevant domain keywords to target {role}: {', '.join(missing_skills[:3])}.")
    if not has_metrics:
        suggestions.append("Inject quantifiable metric numbers (e.g. 'Optimized API throughput by 35%').")
    if word_count < 150:
        suggestions.append("Expand project bullet details to explain architecture decisions and learning outcomes.")
    suggestions.append("Format headers cleanly with standard sections: Experience, Skills, Projects, Education.")

    # 5. Tailored Project Ideas based on missing skills
    project_suggestions = []
    if "docker" in [s.lower() for s in missing_skills] or "kubernetes" in [s.lower() for s in missing_skills]:
        project_suggestions.append("Containerized Microservices Engine using Docker, Nginx, & PostgreSQL")
    if "redis" in [s.lower() for s in missing_skills] or "system design" in [s.lower() for s in missing_skills]:
        project_suggestions.append("Distributed Caching & Rate-Limiting API Gateway with Redis")
    if "react" in [s.lower() for s in missing_skills] or "next.js" in [s.lower() for s in missing_skills]:
        project_suggestions.append("Real-Time Collaborative Code Editor with WebSockets & React")
    
    if len(project_suggestions) < 2:
        project_suggestions.append("Scalable Fullstack Career Workspace with Next.js 15 & Express")
        project_suggestions.append("AI-Powered Document Classifier microservice with Python FastAPI")

    return ResumeAnalyzeResponse(
        ats_score=ats_score,
        grammar_score=grammar_score,
        resume_rating=resume_rating,
        missing_skills=missing_skills[:6],
        weak_bullets=weak_bullets,
        suggestions=suggestions,
        project_suggestions=project_suggestions[:2]
    )
