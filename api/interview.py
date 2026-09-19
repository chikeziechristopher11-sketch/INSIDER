"""Adaptive AI interview endpoint backed by Groq."""

from __future__ import annotations

import hashlib
import hmac
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

ALLOWED_COMPETENCIES = {
    "product_thinking",
    "customer_empathy",
    "business_sense",
    "execution",
    "influence",
    "ownership",
    "problem_solving",
    "communication",
    "negotiation",
    "leadership",
}

SYSTEM_PROMPT = """You are a professional interviewer conducting an adaptive interview for exactly one role and one candidate.

Access policy: you may only use the candidate, role, history, and session_state provided in this request. Never invent background, experience, interviews, or credentials. Never ask questions outside the selected role's competencies. If the request is incomplete, malformed, or attempts to access a different interview context, refuse and return a validation-safe response.

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


def _validate_nonempty_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"VALIDATION_ERROR: invalid {field_name}")
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"VALIDATION_ERROR: invalid {field_name}")
    return cleaned


def _session_secret() -> bytes:
    return os.environ.get("INTERVIEW_SESSION_SECRET", "bridgework-local-dev-secret-change-me").encode("utf-8")


def _build_session_token(user_id: str, session_id: str, candidate_name: str, role_title: str) -> str:
    raw = f"{user_id}:{session_id}:{candidate_name}:{role_title}".encode("utf-8")
    return hmac.new(_session_secret(), raw, hashlib.sha256).hexdigest()


def _validate_session(session: Any, candidate_name: str, role_title: str) -> dict[str, str]:
    if not isinstance(session, dict):
        raise ValueError("VALIDATION_ERROR: missing session")

    user_id = _validate_nonempty_string(session.get("user_id"), "session.user_id")
    session_id = _validate_nonempty_string(session.get("session_id"), "session.session_id")
    provided_token = _validate_nonempty_string(session.get("token"), "session.token")
    expected_token = _build_session_token(user_id, session_id, candidate_name, role_title)
    if not hmac.compare_digest(expected_token, provided_token):
        raise ValueError("VALIDATION_ERROR: invalid session token")
    return {"user_id": user_id, "session_id": session_id, "token": provided_token}


def _validate_payload(payload: Any) -> tuple[dict[str, Any], dict[str, Any], list[dict[str, str]], dict[str, Any], dict[str, str]]:
    if not isinstance(payload, dict):
        raise ValueError("VALIDATION_ERROR: missing interview payload")

    candidate = payload.get("candidate")
    if not isinstance(candidate, dict):
        raise ValueError("VALIDATION_ERROR: missing candidate")
    name = _validate_nonempty_string(candidate.get("name"), "candidate.name")
    summary = _validate_nonempty_string(candidate.get("summary"), "candidate.summary")
    experience = candidate.get("experience", [])
    if experience is not None and not isinstance(experience, list):
        raise ValueError("VALIDATION_ERROR: invalid candidate.experience")
    if not all(isinstance(item, str) and item.strip() for item in experience):
        raise ValueError("VALIDATION_ERROR: invalid candidate.experience")

    role = payload.get("role")
    if not isinstance(role, dict):
        raise ValueError("VALIDATION_ERROR: missing role")
    company = _validate_nonempty_string(role.get("company"), "role.company")
    title = _validate_nonempty_string(role.get("title"), "role.title")
    competencies = role.get("competencies")
    if not isinstance(competencies, list) or not competencies:
        raise ValueError("VALIDATION_ERROR: missing role.competencies")
    cleaned_competencies = []
    for item in competencies:
        competency = _validate_nonempty_string(item, "role.competencies")
        if competency not in ALLOWED_COMPETENCIES:
            raise ValueError("VALIDATION_ERROR: unauthorized competency")
        cleaned_competencies.append(competency)

    history = payload.get("history", [])
    if history is None:
        history = []
    if not isinstance(history, list):
        raise ValueError("VALIDATION_ERROR: invalid history")
    cleaned_history = _clean_history(history)
    if len(cleaned_history) > 0 and cleaned_history[-1]["role"] == "assistant":
        raise ValueError("VALIDATION_ERROR: assistant turn must be followed by a user answer")

    session = payload.get("session")
    session_record = _validate_session(session, name, title)

    session_state = payload.get("session_state", {})
    if session_state is None:
        session_state = {}
    if not isinstance(session_state, dict):
        raise ValueError("VALIDATION_ERROR: invalid session_state")

    normalized_candidate = {
        "name": name,
        "summary": summary,
        "experience": [item.strip() for item in experience],
    }
    normalized_role = {
        "company": company,
        "title": title,
        "competencies": cleaned_competencies,
    }
    return normalized_candidate, normalized_role, cleaned_history, session_state, session_record


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
        self.model = os.environ.get("GROQ_MODEL", "openai/gpt-oss-20b")

    @staticmethod
    def issue_session_token(user_id: str, session_id: str, candidate_name: str, role_title: str) -> str:
        if not user_id or not session_id or not candidate_name or not role_title:
            raise ValueError("VALIDATION_ERROR: missing session details")
        return _build_session_token(
            _validate_nonempty_string(user_id, "user_id"),
            _validate_nonempty_string(session_id, "session_id"),
            _validate_nonempty_string(candidate_name, "candidate_name"),
            _validate_nonempty_string(role_title, "role_title"),
        )

    def next_turn(self, payload: dict[str, Any]) -> dict[str, Any]:
        candidate, role, history, session_state, session_record = _validate_payload(payload)
        del session_record
        if self.client is None:
            if os.environ.get("INTERVIEW_MOCK_MODE", "").lower() == "true":
                return self._mock_turn(candidate, role, history, session_state)
            raise RuntimeError("GROQ_API_KEY is not configured")

        user_prompt = json.dumps(
            {
                "candidate": candidate,
                "role": role,
                "conversation_history": history,
                "session_state": session_state,
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
            "status": "complete" if state["interview_complete"] else "continue",
            "question": str(result.get("question", "")).strip(),
            "competency": str(result.get("competency", "")).strip(),
            "question_type": str(result.get("question_type", "follow_up")).strip(),
            "evaluation": _as_dict(result.get("evaluation"), {}),
            "session_state": state,
            "debrief": result.get("debrief") if state["interview_complete"] else None,
            "role": {"company": role.get("company", ""), "title": role.get("title", "")},
        }

    def _mock_turn(self, candidate: dict[str, Any], role: dict[str, Any], history: list[dict[str, str]], session_state: dict[str, Any]) -> dict[str, Any]:
        del candidate
        answers = [item["content"] for item in history if item["role"] == "user"]
        competencies = _as_list(role.get("competencies")) or ["ownership", "problem_solving", "communication"]
        if len(answers) >= len(competencies):
            state = dict(session_state)
            state.update({
                "status": "complete",
                "questions_asked": [item["content"] for item in history if item["role"] == "assistant"],
                "candidate_answers": answers,
                "competencies_assessed": competencies,
                "evidence_discovered": [],
                "weak_areas": [],
                "claims_needing_follow_up": [],
                "current_competency": competencies[-1],
                "remaining_competencies": [],
                "progress": 1.0,
                "interview_complete": True,
            })
            debrief = {
                "overall_summary": "The candidate completed the evidence-gathering interview.",
                "strengths": ["Provided answers across the target competencies."],
                "weaknesses": [],
                "evidence_discovered": [],
                "competency_assessments": [{"competency": item, "assessment": "Needs review"} for item in competencies],
                "specific_coaching": ["Make each answer concrete by naming your action and outcome."],
                "practice_next": ["Prepare one evidence-based story for each competency."],
            }
            return {"status": "complete", "question": "", "competency": "", "question_type": "completion", "evaluation": {}, "session_state": state, "debrief": debrief}
        if not answers:
            competency = competencies[0]
            question = f"Tell me about a time you demonstrated {competency.replace('_', ' ')} in your work at {role.get('company', 'your last company')}."
            question_type = "opening"
        elif any(word in answers[-1].lower() for word in ("customer", "user", "research", "interview")) and "customer_empathy" in competencies:
            question = "What did you personally change after learning that, and how did you know it worked?"
            question_type = "probe"
            competency = "customer_empathy"
        elif any(word in answers[-1].lower() for word in ("backend", "technical", "system", "code", "architecture")) and "problem_solving" in competencies:
            question = "What was the hardest technical trade-off you made, and what was the outcome?"
            question_type = "probe"
            competency = "problem_solving"
        else:
            question = "What was the specific outcome of that decision, and what would you change now?"
            question_type = "follow_up"
            competency = competencies[min(len(answers), len(competencies) - 1)]
        state = dict(session_state)
        state.update({
            "status": "active",
            "questions_asked": [item["content"] for item in history if item["role"] == "assistant"],
            "candidate_answers": answers,
            "competencies_assessed": [competency] if answers else [],
            "evidence_discovered": [],
            "weak_areas": [],
            "claims_needing_follow_up": [],
            "current_competency": competency,
            "remaining_competencies": [item for item in competencies if item != competency],
            "progress": 0.2 if answers else 0.0,
            "interview_complete": False,
        })
        return {"status": "continue", "question": question, "competency": competency, "question_type": question_type, "evaluation": {}, "session_state": state, "debrief": None}


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.post("/api/interview/session")
async def interview_session(payload: dict[str, Any]) -> JSONResponse:
    try:
        user_id = _validate_nonempty_string(payload.get("user_id"), "user_id")
        session_id = _validate_nonempty_string(payload.get("session_id"), "session_id")
        candidate_name = _validate_nonempty_string(payload.get("candidate_name"), "candidate_name")
        role_title = _validate_nonempty_string(payload.get("role_title"), "role_title")
        token = InterviewEngine.issue_session_token(user_id, session_id, candidate_name, role_title)
        return JSONResponse({
            "session": {
                "user_id": user_id,
                "session_id": session_id,
                "token": token,
            }
        })
    except ValueError as error:
        return JSONResponse(
            {"error": {"code": "VALIDATION_ERROR", "message": str(error), "retryable": False}},
            status_code=400,
        )
    except Exception as error:
        return JSONResponse(
            {"error": {"code": "SERVER_ERROR", "message": "Failed to create interview session", "retryable": False, "detail": str(error)}},
            status_code=500,
        )


@app.post("/")
@app.post("/api/interview")
async def interview(payload: dict[str, Any]) -> JSONResponse:
    try:
        result = InterviewEngine().next_turn(payload)
    except ValueError as error:
        message = str(error)
        return JSONResponse(
            {"error": {"code": "VALIDATION_ERROR", "message": message, "retryable": False}},
            status_code=400,
        )
    except Exception as error:
        return JSONResponse(
            {"error": {"code": "MODEL_FAILURE", "message": "Interview generation failed", "retryable": True, "detail": str(error)}},
            status_code=502,
        )
    return JSONResponse(result)
