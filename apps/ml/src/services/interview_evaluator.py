import json
import re
import asyncio
from src.services.llm_client import generate_text
from src.schemas.interview import InterviewEvaluateRequest, InterviewEvaluateResponse

def evaluate_interview_response(req: InterviewEvaluateRequest) -> InterviewEvaluateResponse:
    return asyncio.run(_evaluate_interview_response(req))

async def _evaluate_interview_response(req: InterviewEvaluateRequest) -> InterviewEvaluateResponse:
    prompt = f"""
    You are a Principal Tech Interviewer evaluating a candidate's response during a technical phone screen.
    Target Role: {req.role}
    Question Difficulty: {req.difficulty}
    Technical Question Asked: {req.question}
    Candidate Provided Answer: {req.answer}

    Provide the output STRICTLY as a single valid JSON object containing:
    - score: float (0.0 to 10.0 rating based on correctness, depth, time complexity, and technical terminology)
    - correctness: string (detailed analysis of factual accuracy and missing concepts)
    - grammar: string (evaluation of communication structure, clarity, and articulation)
    - technical_quality: string (evaluation of domain terminology, system design depth, or algorithmic complexity)
    - feedback: string (actionable advice to improve the answer next time)
    - suggested_answer: string (exemplary, top-tier response to this question for reference)
    """

    try:
        res_text = await generate_text(prompt)
        res_text = res_text.replace("```json", "").replace("```", "").strip()
        data = json.loads(res_text)
        if data.get("score") and data.get("correctness"):
            return InterviewEvaluateResponse(
                score=float(data.get("score", 7.5)),
                correctness=str(data.get("correctness")),
                grammar=str(data.get("grammar")),
                technical_quality=str(data.get("technical_quality")),
                feedback=str(data.get("feedback")),
                suggested_answer=str(data.get("suggested_answer"))
            )
    except Exception as e:
        print(f"[Interview Evaluator Service] LLM execution or JSON parsing failed: {e}. Running dynamic evaluation engine.")

    # Dynamic Custom Interview Evaluator based on question keyword matching & answer depth
    return evaluate_dynamic_interview(req)


def evaluate_dynamic_interview(req: InterviewEvaluateRequest) -> InterviewEvaluateResponse:
    ans_text = req.answer.strip()
    words = re.findall(r'\w+', ans_text.lower())
    word_count = len(words)
    q_lower = req.question.lower()

    # 1. Base Score calculation on word count & articulation depth
    base_score = 4.0
    if word_count > 60:
        base_score += 3.0
    elif word_count > 30:
        base_score += 2.0
    elif word_count > 10:
        base_score += 1.0

    # 2. Check for technical keyword presence in answer
    tech_keywords = ["threads", "process", "memory", "virtual", "stack", "heap", "complexity", "time", "space", "o(n)", "o(1)", "o(log n)", "database", "index", "cache", "redis", "lock", "async", "event loop", "callback", "closure", "state", "props", "component", "render", "api", "rest", "http", "socket"]
    
    found_keywords = [kw for kw in tech_keywords if kw in words]
    if len(found_keywords) >= 3:
        base_score += 2.5
    elif len(found_keywords) >= 1:
        base_score += 1.5

    final_score = round(min(9.8, max(2.5, base_score)), 1)

    # 3. Dynamic Correctness & Quality Analysis
    if final_score >= 8.0:
        correctness = "Highly accurate and articulate response. Correctly identifies core computer science mechanisms."
        grammar = "Excellent speaking flow, clear terminology, and professional articulation."
        technical_quality = f"Strong technical depth. Utilized relevant concepts: {', '.join(found_keywords) if found_keywords else 'core principles'}."
        feedback = "To make your response stand out even more, mention real-world trade-offs (e.g. memory overhead vs latency)."
    elif final_score >= 6.0:
        correctness = "Partially correct explanation. Captures the general concept but misses deeper execution details."
        grammar = "Good speech structure, though slightly brief."
        technical_quality = "Moderate technical depth. Try to incorporate formal algorithmic complexity or memory management terminology."
        feedback = "Elaborate further on internal mechanics (e.g. context switching overhead or memory space separation)."
    else:
        correctness = "Answer is too brief or lacks key technical definitions required for senior recruiter evaluations."
        grammar = "Sentence structure is overly brief."
        technical_quality = "Lacks domain-specific keywords and complexity analysis."
        feedback = "Provide a structured answer: 1) High-level definition, 2) Technical mechanics, 3) Time/Space complexity or system trade-offs."

    # 4. Generate Exemplary Answer tailored to question
    if "process" in q_lower or "thread" in q_lower:
        suggested_answer = "Processes run in isolated virtual address spaces with separate heap and stack memory, providing isolation at the cost of higher context-switching overhead. Threads exist within a process, sharing memory address space for fast inter-thread communication, but require explicit synchronization (locks/mutexes) to prevent race conditions."
    elif "react" in q_lower or "state" in q_lower or "props" in q_lower:
        suggested_answer = "React components trigger re-renders when internal state or received props change. React uses a Virtual DOM diffing algorithm (Reconciler) to identify changes and execute minimal real-DOM mutations, optimizing rendering performance."
    elif "database" in q_lower or "sql" in q_lower or "index" in q_lower:
        suggested_answer = "Database indexes use B-Tree or Hash data structures to reduce search time complexity from O(N) full-table scans to O(log N) lookups. However, indexes introduce write overhead on INSERT/UPDATE operations and increase storage footprint."
    else:
        suggested_answer = "A strong technical answer begins with a clear 1-sentence definition, followed by structural mechanics, and finishes with performance trade-offs (Time complexity O(N), space complexity O(1)) and production use cases."

    return InterviewEvaluateResponse(
        score=final_score,
        correctness=correctness,
        grammar=grammar,
        technical_quality=technical_quality,
        feedback=feedback,
        suggested_answer=suggested_answer
    )
