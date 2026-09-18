"""Adaptive AI interview endpoint backed by Groq."""

from __future__ import annotations

import json
import os
from typing import TYPE_CHECKING, Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

if TYPE_CHECKING:
    from groq import Groq


MOCK_CANDIDATE = {
    "name": "Amaka Okafor",
    "summary": "Product designer with three years of fintech experience.",
    "experience": [
        "Redesigned merchant onboarding at Paystack and reduced drop-off by 28%.",
        "Facilitated a 40-person design sprint for a healthcare product.",
    ],
}

MOCK_ROLE = {
    "company": "GTCO",
    "title": "Product Designer, Digital Channels",
    "description": "Design simple, useful financial products for millions of customers across Africa.",
    "competencies": [
        "product_thinking",
        "customer_empathy",
        "business_sense",
        "execution",
        "influence",
    ],
}

SYSTEM_PROMPT = """You are a professional interviewer conducting an adaptive interview.

Be concise, curious, challenging but fair, and natural when spoken aloud. Do not flatter the candidate or provide coaching during the interview. Do not reveal what a strong answer should contain before the candidate answers.

Use only competencies relevant to the supplied role. Treat a self-description as a CLAIM, not evidence. Evidence must describe a concrete situation, the candidate's personal action, reasoning or trade-off, and an outcome. If the answer is vague, ask for a specific example. If there is a strong claim, probe it. If evidence is strong enough, move to the most important unassessed competency. Every question must depend on the candidate's latest answer or the remaining role requirements.

After every answer, evaluate relevance, correctness, depth, specificity, reasoning, ownership, communication, evidence, and role relevance. Do not invent facts. A question must be short enough for voice playback.

Return valid JSON only with this shape:
{
  "question": "short spoken question",
  "competency": "role competency being assessed",
  "question_type": "opening|follow_up|clarification|new_competency|completion",
  "evaluation": {
    "relevance": "brief assessment",
    "correctness": "brief assessment",
    "depth": "brief assessment",
    "specificity": "brief assessment",
    "reasoning": "brief assessment",
    "ownership": "brief assessment",
    "communication": "brief assessment",
    "role_relevance": "brief assessment",
    "evidence_found": ["concrete evidence only"],
    "strength": "weak|moderate|strong",
    "missing_evidence": ["what is still unproven"],
    "claims_needing_follow_up": ["claims that need proof"]
  },
  "session_state": {
    "competencies_assessed": ["..."],
    "evidence_discovered": [{"competency": "...", "evidence": "..."}],
    "weak_areas": ["..."],
    "claims_needing_follow_up": ["..."],
    "current_competency": "...",
    "remaining_competencies": ["..."],
    "progress": 0.0,
    "interview_complete": false
  },
  "debrief": null
}

When enough evidence has been collected across the important competencies, set question_type to completion, interview_complete to true, and question to an empty string. Then include a debrief with: overall_summary, strengths, weaknesses, evidence_discovered, competency_assessments, specific_coaching, and practice_next.
"""


def _as_dict(value: Any, fallback: dict[str, Any]) -> dict[str, Any]:
    return value if isinstance(value, dict) else fallback


def _as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _clean_history(history: Any) -> list[dict[str, str]]:
    cleaned: list[dict[str, str]] = []
    for item in _as_list(history):
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "")).strip().lower()
        content = item.get("content", item.get("text", item.get("answer", "")))
        if role in {"user", "assistant"} and str(content).strip():
            cleaned.append({"role": role, "content": str(content).strip()})
        elif "answer" in item and str(content).strip():
            cleaned.append({"role": "user", "content": str(content).strip()})
    return cleaned


class InterviewEngine:
    """Generate the next adaptive interview turn from caller-owned history."""

    def __init__(self, client: Any = None) -> None:
        if client is not None:
            self.client = client
        elif os.environ.get("GROQ_API_KEY"):
            from groq import Groq

            self.client = Groq(api_key=os.environ["GROQ_API_KEY"])
        else:
            self.client = None
        self.model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

    def next_turn(self, payload: dict[str, Any]) -> dict[str, Any]:
        candidate = _as_dict(payload.get("candidate"), MOCK_CANDIDATE)
        role = _as_dict(payload.get("role"), MOCK_ROLE)
        history = _clean_history(payload.get("history"))
        if self.client is None:
            if os.environ.get("INTERVIEW_MOCK_MODE", "").lower() == "true":
                return self._mock_turn(candidate, role, history)
            raise RuntimeError("GROQ_API_KEY is not configured")

        user_prompt = json.dumps(
            {
                "candidate": candidate,
                "role": role,
                "conversation_history": history,
                "instruction": "Generate the opening question." if not history else "Evaluate the latest candidate answer and generate the next question.",
            },
            ensure_ascii=True,
        )
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.35,
            max_tokens=1800,
            response_format={"type": "json_object"},
        )
        raw_content = completion.choices[0].message.content or "{}"
        result = json.loads(raw_content)
        return self._normalize_result(result, role, history)

    def _normalize_result(self, result: dict[str, Any], role: dict[str, Any], history: list[dict[str, str]]) -> dict[str, Any]:
        state = _as_dict(result.get("session_state"), {})
        state["questions_asked"] = [item["content"] for item in history if item["role"] == "assistant"]
        state["candidate_answers"] = [item["content"] for item in history if item["role"] == "user"]
        state["competencies_assessed"] = _as_list(state.get("competencies_assessed"))
        state["evidence_discovered"] = _as_list(state.get("evidence_discovered"))
        state["weak_areas"] = _as_list(state.get("weak_areas"))
        state["claims_needing_follow_up"] = _as_list(state.get("claims_needing_follow_up"))
        state["remaining_competencies"] = _as_list(state.get("remaining_competencies"))
        state["interview_complete"] = bool(state.get("interview_complete", False))
        state["progress"] = max(0.0, min(1.0, float(state.get("progress", 0.0))))
        return {
            "question": str(result.get("question", "")).strip(),
            "competency": str(result.get("competency", "")).strip(),
            "question_type": str(result.get("question_type", "follow_up")).strip(),
            "evaluation": _as_dict(result.get("evaluation"), {}),
            "session_state": state,
            "debrief": result.get("debrief") if state["interview_complete"] else None,
            "role": {"company": role.get("company", ""), "title": role.get("title", "")},
        }

    def _mock_turn(self, candidate: dict[str, Any], role: dict[str, Any], history: list[dict[str, str]]) -> dict[str, Any]:
        del candidate
        answers = [item["content"] for item in history if item["role"] == "user"]
        if not answers:
            question = f"Tell me about a product decision you made in your work at {role.get('company', 'your last company')} and why you made it."
            question_type = "opening"
            competency = "product_thinking"
        else:
            question = "What was the specific outcome of that decision, and what would you change now?"
            question_type = "follow_up"
            competency = "product_thinking"
        state = {
            "questions_asked": [item["content"] for item in history if item["role"] == "assistant"],
            "candidate_answers": answers,
            "competencies_assessed": [competency] if answers else [],
            "evidence_discovered": [],
            "weak_areas": [],
            "claims_needing_follow_up": [],
            "current_competency": competency,
            "remaining_competencies": [item for item in _as_list(role.get("competencies")) if item != competency],
            "progress": 0.2 if answers else 0.0,
            "interview_complete": False,
        }
        return {"question": question, "competency": competency, "question_type": question_type, "evaluation": {}, "session_state": state, "debrief": None}


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.post("/api/interview")
async def interview(payload: dict[str, Any]) -> JSONResponse:
    try:
        result = InterviewEngine().next_turn(payload)
    except Exception as error:
        return JSONResponse(
            {"error": "Interview generation failed", "detail": str(error)},
            status_code=502,
        )
    return JSONResponse(result)
