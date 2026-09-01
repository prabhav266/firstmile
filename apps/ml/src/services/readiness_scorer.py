import json
import asyncio
from src.services.llm_client import generate_text
from src.schemas.readiness import ReadinessScoreRequest, ReadinessScoreResponse

def calculate_placement_readiness(req: ReadinessScoreRequest) -> ReadinessScoreResponse:
    return asyncio.run(_calculate_placement_readiness(req))

async def _calculate_placement_readiness(req: ReadinessScoreRequest) -> ReadinessScoreResponse:
    prompt = f"""
    You are an AI placement analytics director evaluating a candidate's overall hiring readiness index.
    Data metrics:
    - Coding Problems Solved: {req.dsa_problems_solved}
    - ML Hours Logged: {req.ml_hours}
    - Portfolio Projects Count: {req.project_count}
    - Resume ATS Score: {req.resume_score}
    - Streak Consistency: {req.coding_streak} days

    Provide the output STRICTLY as a single valid JSON object containing:
    - overall_score: float (0.0 to 100.0)
    - dsa_score: float (0.0 to 100.0)
    - dev_score: float (0.0 to 100.0)
    - ml_score: float (0.0 to 100.0)
    - project_score: float (0.0 to 100.0)
    - strengths: list of strings
    - weaknesses: list of strings
    - suggestions: list of strings
    """

    try:
        res_text = await generate_text(prompt)
        res_text = res_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(res_text)
        if data.get("overall_score"):
            return ReadinessScoreResponse(
                overall_score=float(data.get("overall_score", 65.0)),
                dsa_score=float(data.get("dsa_score", 60.0)),
                dev_score=float(data.get("dev_score", 70.0)),
                ml_score=float(data.get("ml_score", 50.0)),
                project_score=float(data.get("project_score", 65.0)),
                strengths=list(data.get("strengths", [])),
                weaknesses=list(data.get("weaknesses", [])),
                suggestions=list(data.get("suggestions", []))
            )
    except Exception as e:
        print(f"[Readiness Scorer Service] LLM execution or JSON parsing failed: {e}. Running dynamic mathematical scoring engine.")

    # Dynamic Weighted Placement Readiness Algorithm
    return calculate_dynamic_readiness(req)


def calculate_dynamic_readiness(req: ReadinessScoreRequest) -> ReadinessScoreResponse:
    solved = req.dsa_problems_solved or 0
    ml_hours = req.ml_hours or 0.0
    projects = req.project_count or 0
    ats = req.resume_score if req.resume_score is not None else 0.0
    streak = req.coding_streak or 0

    # 1. Component Sub-scores (0 - 100)
    dsa_score = min(100.0, round((solved / 150.0) * 100.0, 1))
    project_score = min(100.0, round((projects / 4.0) * 100.0, 1))
    ml_score = min(100.0, round((ml_hours / 40.0) * 100.0, 1))
    dev_score = round((project_score * 0.6) + (ats * 0.4), 1)

    # 2. Weighted Overall Index Formula:
    # 35% DSA + 25% Dev Projects + 15% ML Study + 15% Resume ATS + 10% Consistency Streak Bonus
    streak_bonus = min(10.0, streak * 1.5)
    overall_score = round(
        min(99.0, (0.35 * dsa_score) + (0.25 * project_score) + (0.15 * ml_score) + (0.15 * ats) + streak_bonus),
        1
    )

    if solved == 0 and ml_hours == 0 and projects == 0 and ats == 0:
        overall_score = 0.0
        dsa_score = 0.0
        project_score = 0.0
        ml_score = 0.0
        dev_score = 0.0

    # 3. Strengths, Weaknesses, and Suggestions Breakdown
    strengths = []
    weaknesses = []
    suggestions = []

    if solved >= 50:
        strengths.append(f"Solid DSA problem-solving baseline ({solved} problems solved).")
    else:
        weaknesses.append(f"Low DSA problem count ({solved} problems). Top tech roles require 100+ solved.")
        suggestions.append("Solve 2 Leetcode medium problems daily focusing on Arrays, Hashing, & Dynamic Programming.")

    if projects >= 2:
        strengths.append(f"Strong portfolio representation ({projects} active projects).")
    else:
        weaknesses.append("Insufficient portfolio project coverage. Need at least 2 fullstack/AI microservice projects.")
        suggestions.append("Build a production-grade portfolio project using Docker, Redis, and Next.js.")

    if ats >= 75:
        strengths.append(f"High resume ATS compatibility rating ({ats}%).")
    else:
        weaknesses.append(f"Resume ATS rating is below tier-1 benchmark ({ats}%).")
        suggestions.append("Run the AI Resume Analyzer to fix weak bullet points and inject missing domain keywords.")

    if streak >= 5:
        strengths.append(f"Excellent practice consistency streak ({streak} active days).")
    else:
        suggestions.append("Maintain a 7-day active practice streak to boost your Placement Readiness Index.")

    return ReadinessScoreResponse(
        overall_score=overall_score,
        dsa_score=dsa_score,
        dev_score=dev_score,
        ml_score=ml_score,
        project_score=project_score,
        strengths=strengths,
        weaknesses=weaknesses,
        suggestions=suggestions
    )
