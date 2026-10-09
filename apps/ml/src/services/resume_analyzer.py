import json
import re
import asyncio
from typing import List

from src.services.llm_client import generate_text
from src.schemas.resume import ResumeAnalyzeResponse

MAX_RESUME_CHARS = 12000


def analyze_resume_text(raw_text: str, job_role: str) -> ResumeAnalyzeResponse:
    return asyncio.run(_analyze_resume_text(raw_text, job_role))


def _clamp(value, lo: float, hi: float, default: float) -> float:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, v))


def _str_list(value, limit: int = 8) -> List[str]:
    if not isinstance(value, list):
        return []
    return [str(x).strip() for x in value if str(x).strip()][:limit]


def _extract_json(text: str) -> dict:
    """Parse JSON even if the model wrapped it in prose or code fences."""
    text = text.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise


async def _analyze_resume_text(raw_text: str, job_role: str) -> ResumeAnalyzeResponse:
    resume_text = (raw_text or "")[:MAX_RESUME_CHARS]

    prompt = f"""You are a strict, honest technical recruiter and ATS (applicant tracking system) analyst.
Evaluate the resume below for the target role: "{job_role}".

Base EVERYTHING on the resume text provided. Never invent content that is not in it.
Scoring guidance (be calibrated — most student resumes land between 45 and 80):
- ats_score (0-100): keyword match for the role, standard sections (Education, Skills, Projects/Experience), clean parseable structure, quantified impact.
- grammar_score (0-10): spelling, grammar, tense consistency, professional wording, formatting consistency.
- resume_rating (0-10): overall strength of the technical impact shown (project depth, ownership, measurable results).
- missing_skills: up to 6 skills/keywords important for "{job_role}" that do NOT appear in the resume.
- weak_bullets: up to 4 bullets copied VERBATIM from the resume that lack action verbs or measurable impact.
  If every bullet is genuinely strong, return an empty list.
- suggestions: 3-5 specific, actionable improvements for THIS resume.
- project_suggestions: 2 project ideas formatted as "Title: one-line description" that would close the skill gaps.

Return ONLY a JSON object with exactly these keys:
ats_score, grammar_score, resume_rating, missing_skills, weak_bullets, suggestions, project_suggestions

RESUME TEXT:
\"\"\"
{resume_text}
\"\"\"
"""

    try:
        res_text = await generate_text(prompt, temperature=0.2, json_mode=True)
        data = _extract_json(res_text)

        if data.get("ats_score") is not None:
            return ResumeAnalyzeResponse(
                ats_score=_clamp(data.get("ats_score"), 0.0, 100.0, 60.0),
                grammar_score=_clamp(data.get("grammar_score"), 0.0, 10.0, 7.0),
                resume_rating=_clamp(data.get("resume_rating"), 0.0, 10.0, 6.0),
                missing_skills=_str_list(data.get("missing_skills"), 6),
                weak_bullets=_str_list(data.get("weak_bullets"), 4),
                suggestions=_str_list(data.get("suggestions"), 6),
                project_suggestions=_str_list(data.get("project_suggestions"), 3),
            )
        print("[Resume Analyzer] LLM response had no ats_score. Falling back to heuristic analysis.")
    except Exception as e:
        print(f"[Resume Analyzer] LLM execution or JSON parsing failed: {e}. Running heuristic analysis.")

    return run_dynamic_resume_analysis(resume_text, job_role)


# ---------------------------------------------------------------------------
# Heuristic fallback (used when there is no Gemini key / the LLM call fails)
# ---------------------------------------------------------------------------

SKILLS_BY_ROLE = {
    "software engineer": ["python", "java", "javascript", "typescript", "react", "node.js", "express", "sql", "postgresql", "mongodb", "git", "docker", "aws", "system design", "rest api", "data structures", "algorithms"],
    "frontend": ["javascript", "typescript", "react", "next.js", "html", "css", "tailwind", "redux", "webpack", "jest", "git"],
    "backend": ["python", "java", "node.js", "express", "fastapi", "sql", "postgresql", "mongodb", "redis", "docker", "kubernetes", "system design", "microservices", "kafka", "aws"],
    "machine learning": ["python", "numpy", "pandas", "scikit-learn", "tensorflow", "pytorch", "deep learning", "nlp", "computer vision", "sql", "git", "data analysis"],
}

SKILL_LABELS = {
    "aws": "AWS", "sql": "SQL", "postgresql": "PostgreSQL", "mongodb": "MongoDB", "nlp": "NLP",
    "rest api": "REST API", "node.js": "Node.js", "next.js": "Next.js", "html": "HTML", "css": "CSS",
    "javascript": "JavaScript", "typescript": "TypeScript", "scikit-learn": "scikit-learn",
    "fastapi": "FastAPI", "pytorch": "PyTorch", "tensorflow": "TensorFlow",
}

WEAK_START = re.compile(
    r"^(?:[•\-\*–]\s*)?(responsible for|worked on|helped|assisted|involved in|handled|did|made|tried)\b",
    re.IGNORECASE,
)
METRIC = re.compile(r"\d+\s*(%|\+|x\b|ms\b|k\b|users|requests|seconds)|\$\s?\d|\b\d{2,}\b", re.IGNORECASE)


def _has_term(text_lower: str, term: str) -> bool:
    # Word-boundary match: "java" must not match "javascript", "sql" must not match "postgresql", "git" not "digital".
    return re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", text_lower) is not None


def _label(skill: str) -> str:
    return SKILL_LABELS.get(skill, skill.title())


def run_dynamic_resume_analysis(text: str, role: str) -> ResumeAnalyzeResponse:
    text_lower = text.lower()
    word_count = len(re.findall(r"[a-z0-9+#.]+", text_lower))

    role_key = "software engineer"
    for k in SKILLS_BY_ROLE:
        if k in role.lower():
            role_key = k
            break
    expected = SKILLS_BY_ROLE[role_key]
    found = [s for s in expected if _has_term(text_lower, s)]
    missing = [s for s in expected if not _has_term(text_lower, s)]

    section_hits = sum(
        1
        for names in (
            ("experience", "internship", "work history"),
            ("education",),
            ("skills", "technical skills"),
            ("projects", "project"),
        )
        if any(_has_term(text_lower, n) for n in names)
    )

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    bullets = [
        l for l in lines
        if re.match(r"^[•\-\*–]", l) or (len(l.split()) >= 9 and len(l) < 260 and not re.search(r"[|@]", l))
    ]
    quantified = [b for b in bullets if METRIC.search(b)]
    metric_ratio = (len(quantified) / len(bullets)) if bullets else 0.0

    weak_bullets = [b for b in bullets if WEAK_START.match(b) or b not in quantified][:4]
    weak_bullets = [b if len(b) <= 140 else b[:137] + "..." for b in weak_bullets]

    ats = 30.0
    ats += min(30.0, (len(found) / max(1, len(expected))) * 30.0 * 1.5)
    ats += section_hits * 5.0
    ats += min(10.0, metric_ratio * 20.0)
    ats += 10.0 if word_count >= 250 else 5.0 if word_count >= 120 else 0.0
    if word_count < 150:
        ats = min(ats, 70.0)  # a very short resume cannot be 'ATS-strong'
    ats_score = round(min(95.0, max(20.0, ats)))

    grammar = 9.0
    if re.search(r" {3,}", text):
        grammar -= 0.5
    grammar -= min(2.0, sum(1 for l in lines if re.match(r"^[a-z]", l) and len(l) > 40) * 0.3)
    if section_hits < 3:
        grammar -= 1.0
    grammar_score = round(max(4.0, grammar), 1)

    resume_rating = round(min(10.0, max(1.0, (ats_score / 10.0) * 0.8 + grammar_score * 0.2)), 1)

    suggestions = []
    if missing:
        suggestions.append(
            f"Add relevant keywords for {role} where you genuinely have the experience: {', '.join(_label(s) for s in missing[:4])}."
        )
    if metric_ratio < 0.4:
        suggestions.append("Quantify more bullets (e.g. 'Reduced API latency by 35%', 'served 2,000+ users').")
    if section_hits < 4:
        suggestions.append("Use standard section headings ATS parsers recognise: Education, Skills, Projects, Experience.")
    if word_count < 150:
        suggestions.append("Your resume is very short — expand project bullets with the problem, your approach and the result.")
    suggestions.append("Keep a single-column layout without tables, text boxes or images.")

    missing_set = set(missing)
    projects = []
    if {"docker", "kubernetes"} & missing_set:
        projects.append("Containerized Microservices: Docker + Nginx + PostgreSQL with a one-command compose setup")
    if {"redis", "system design"} & missing_set:
        projects.append("Rate-limited API Gateway: Redis caching, token-bucket limiter and load tests")
    if {"react", "next.js"} & missing_set:
        projects.append("Real-time Collaborative App: WebSockets + React with deployed live demo")
    for filler in (
        "Production REST API: auth, database, tests, CI and a deployed live demo",
        "AI-powered Document Classifier: FastAPI microservice with a simple web UI",
    ):
        if len(projects) >= 2:
            break
        projects.append(filler)

    return ResumeAnalyzeResponse(
        ats_score=float(ats_score),
        grammar_score=grammar_score,
        resume_rating=resume_rating,
        missing_skills=[_label(s) for s in missing[:6]],
        weak_bullets=weak_bullets,
        suggestions=suggestions,
        project_suggestions=projects[:2],
    )
