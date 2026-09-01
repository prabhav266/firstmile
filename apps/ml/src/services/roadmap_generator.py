import json
import asyncio
from src.services.llm_client import generate_text
from src.schemas.roadmap import RoadmapGenerateRequest, RoadmapGenerateResponse

def generate_career_roadmap(req: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    return asyncio.run(_generate_career_roadmap(req))

async def _generate_career_roadmap(req: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    prompt = f"""
    You are a professional software engineering career coach.
    Create a highly personalized placement preparation roadmap for a student.
    Target Company: {req.target_company}
    Target Package: {req.target_package} LPA
    Current College Year: {req.current_year}
    Academic Branch: {req.branch}
    Known Skills: {', '.join(req.known_skills)}

    Generate the response STRICTLY as a single valid JSON object containing the fields below. Do not include markdown code block syntax. Just raw JSON.

    Required JSON fields:
    - daily_plan: list of dicts, each dict having "day" (int), "task" (string), "resource" (string)
    - weekly_plan: list of dicts, each dict having "week" (int), "topic" (string), "outcome" (string)
    - monthly_plan: list of dicts, each dict having "month" (int), "milestone" (string), "timeline" (string)
    - timeline: string
    - topics: list of strings
    """

    try:
        res_text = await generate_text(prompt)
        res_text = res_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(res_text)
        if data.get("daily_plan") and data.get("weekly_plan"):
            return RoadmapGenerateResponse(
                daily_plan=list(data.get("daily_plan", [])),
                weekly_plan=list(data.get("weekly_plan", [])),
                monthly_plan=list(data.get("monthly_plan", [])),
                timeline=str(data.get("timeline", "6 Months")),
                topics=list(data.get("topics", []))
            )
    except Exception as e:
        print(f"[Roadmap Generator Service] LLM execution or JSON parsing failed: {e}. Running dynamic customized roadmap algorithm.")

    # Dynamic Custom Roadmap Generator based on company, package LPA, year & known skills
    return generate_dynamic_roadmap(req)


def generate_dynamic_roadmap(req: RoadmapGenerateRequest) -> RoadmapGenerateResponse:
    company = req.target_company or "Target Tech Company"
    lpa = req.target_package or 12.0
    year = req.current_year or 3
    skills_str = ", ".join(req.known_skills) if req.known_skills else "General Programming"
    
    # Customize difficulty based on target package LPA
    is_high_tier = lpa >= 20.0
    is_mid_tier = lpa >= 10.0 and lpa < 20.0
    
    daily_plan = [
        {"day": 1, "task": f"Baseline evaluation for {company} OA format ({'Hard DSA' if is_high_tier else 'Medium DSA'})", "resource": "Striver A2Z / LeetCode"},
        {"day": 2, "task": f"Practice Dynamic Programming knapsack & grid variations", "resource": "LeetCode Mediums"},
        {"day": 3, "task": f"Review System Design concepts tailored for {company} tech stack", "resource": "ByteByteGo / Primer"},
        {"day": 4, "task": f"Solve Graph BFS/DFS & Shortest Path algorithmic problems", "resource": "NeetCode 150"},
        {"day": 5, "task": f"Build/Refine portfolio project using {skills_str}", "resource": "PathForge Projects Module"}
    ]

    weekly_plan = [
        {"week": 1, "topic": "DSA Fundamentals, Arrays, Hashing, & Sliding Window", "outcome": f"Solve 25+ problems targeted for {company}"},
        {"week": 2, "topic": "Trees, Graphs, Backtracking, & Disjoint Set Union", "outcome": "Master graph traversal patterns"},
        {"week": 3, "topic": f"High-Level System Design & Database Sharding", "outcome": "Design scalable REST microservices"},
        {"week": 4, "topic": "Full Mock OA & Behavioral STAR Technique Prep", "outcome": "Achieve 85%+ in timed mock assessment"}
    ]

    monthly_plan = [
        {"month": 1, "milestone": f"Complete 80+ Leetcode Medium/Hard questions for {company}", "timeline": "Month 1"},
        {"month": 2, "milestone": f"Deploy Production Microservice Project with CI/CD & Docker", "timeline": "Month 2"},
        {"month": 3, "milestone": f"Conduct 5 AI Mock Interviews & Final ATS Resume Audit", "timeline": "Month 3"}
    ]

    timeline_str = "4 Months" if year >= 4 else "6 Months"
    topics = ["Advanced DSA", "System Design", "Microservices", company + " Previous OA Questions"]

    return RoadmapGenerateResponse(
        daily_plan=daily_plan,
        weekly_plan=weekly_plan,
        monthly_plan=monthly_plan,
        timeline=timeline_str,
        topics=topics
    )
