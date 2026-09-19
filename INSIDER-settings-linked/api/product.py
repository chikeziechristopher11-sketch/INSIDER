"""Role-agnostic profile, opportunity, readiness, and health APIs."""

from __future__ import annotations

import json
import os
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse


OPPORTUNITIES = [
    {
        "id": "gtco-product-designer",
        "company": "GTCO",
        "role": "Product Designer, Digital Channels",
        "description": "Design useful financial products for customers across Africa.",
        "requirements": ["Product thinking", "Customer empathy", "Business sense", "Execution", "Influence"],
        "competencies": ["product_thinking", "customer_empathy", "business_sense", "execution", "influence"],
        "company_context": ["Financial services", "Large consumer audience", "Digital channels"],
        "sources": [],
    },
    {
        "id": "general-professional-growth",
        "company": "Example Employer",
        "role": "Professional contributor",
        "description": "A general opportunity used for role-agnostic testing.",
        "requirements": ["Ownership", "Problem solving", "Communication", "Adaptability"],
        "competencies": ["ownership", "problem_solving", "communication", "adaptability"],
        "company_context": [],
        "sources": [],
    },
]


def error(code: str, message: str, status: int = 400, retryable: bool = False) -> JSONResponse:
    return JSONResponse(
        {"error": {"code": code, "message": message, "retryable": retryable}},
        status_code=status,
    )


def as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def text(value: Any) -> str:
    return str(value or "").strip()


def evidence_from_items(items: list[Any]) -> list[dict[str, Any]]:
    evidence: list[dict[str, Any]] = []
    for item in items:
        if isinstance(item, str) and item.strip():
            evidence.append({"claim": item.strip(), "type": "claim", "source": "candidate"})
        elif isinstance(item, dict) and text(item.get("description") or item.get("evidence") or item.get("text")):
            evidence.append({
                "claim": text(item.get("description") or item.get("evidence") or item.get("text")),
                "type": "evidence" if item.get("outcome") or item.get("result") else "claim",
                "source": item.get("source", "candidate"),
            })
    return evidence


def build_profile(candidate: dict[str, Any], evidence: list[dict[str, Any]]) -> dict[str, Any]:
    profile = dict(candidate)
    profile.setdefault("field", text(candidate.get("field") or candidate.get("profession") or "professional"))
    profile.setdefault("goals", as_list(candidate.get("goals")))
    profile.setdefault("skills", as_list(candidate.get("skills")))
    profile["evidence"] = evidence
    return profile


def profile_gaps(profile: dict[str, Any], evidence: list[dict[str, Any]]) -> list[str]:
    gaps: list[str] = []
    if not text(profile.get("field")) or profile.get("field") == "professional":
        gaps.append("What kind of work or field are you pursuing?")
    if not evidence:
        gaps.append("Describe one thing you have done and the result.")
    if evidence and not any(item.get("type") == "evidence" for item in evidence):
        gaps.append("What did you personally do, and what changed because of it?")
    if not as_list(profile.get("goals")):
        gaps.append("What would you like to do next?")
    return gaps


def find_opportunity(opportunity_id: str) -> dict[str, Any] | None:
    return next((item for item in OPPORTUNITIES if item["id"] == opportunity_id), None)


async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "services": {
            "api": "ok",
            "groq": "configured" if os.environ.get("GROQ_API_KEY") else "missing",
            "tts": "configured",
            "rag": "configured",
        },
    }


async def profile_cv(payload: dict[str, Any]) -> JSONResponse:
    cv_text = text(payload.get("cv_text"))
    if not cv_text:
        return error("VALIDATION_ERROR", "cv_text is required")
    candidate = as_dict(payload.get("candidate_data"))
    evidence = evidence_from_items([cv_text])
    profile = build_profile(candidate, evidence)
    return JSONResponse({
        "profile": profile,
        "evidence": evidence,
        "missing_information": profile_gaps(profile, evidence),
        "follow_up_questions": ["What part did you personally own?", "What was the result of this work?"],
    })


async def profile_intake(payload: dict[str, Any]) -> JSONResponse:
    profile = as_dict(payload.get("profile"))
    answers = as_list(payload.get("answers"))
    history = as_list(payload.get("question_history"))
    evidence = evidence_from_items(answers)
    merged = build_profile(profile, evidence)
    gaps = profile_gaps(merged, evidence)
    if not gaps:
        return JSONResponse({"next_question": None, "progress": {"completed": 4, "total": 4}, "missing_information": [], "status": "complete"})
    question = gaps[0]
    return JSONResponse({
        "next_question": {
            "id": f"intake-{len(history) + 1}",
            "text": question,
            "type": "evidence" if "personally" in question or "result" in question else "discovery",
            "purpose": "Collect concrete evidence without requiring a specific platform or work history.",
        },
        "progress": {"completed": max(0, min(3, len(answers))), "total": 4},
        "missing_information": gaps,
        "status": "continue",
    })


async def profile_generate(payload: dict[str, Any]) -> JSONResponse:
    candidate = as_dict(payload.get("candidate_data"))
    evidence = evidence_from_items(as_list(payload.get("evidence")))
    if not candidate and not evidence:
        return error("VALIDATION_ERROR", "candidate_data or evidence is required")
    profile = build_profile(candidate, evidence)
    name = text(profile.get("name")) or "This candidate"
    summary = f"{name} is a {profile.get('field', 'professional')} with evidence across {len(evidence)} contribution(s)."
    return JSONResponse({"profile": profile, "summary": summary, "evidence": evidence, "gaps": profile_gaps(profile, evidence)})


async def profile_analyze(payload: dict[str, Any]) -> JSONResponse:
    profile = as_dict(payload.get("profile"))
    opportunity = as_dict(payload.get("opportunity"))
    competencies = as_list(opportunity.get("competencies")) or ["ownership", "problem_solving", "communication"]
    evidence_text = " ".join(item.get("claim", "") for item in as_list(profile.get("evidence")) if isinstance(item, dict)).lower()
    demonstrated = [item for item in competencies if item.replace("_", " ") in evidence_text]
    missing = [item for item in competencies if item not in demonstrated]
    return JSONResponse({
        "demonstrated": demonstrated,
        "partial": [item for item in competencies if item not in demonstrated and evidence_text],
        "missing": missing,
        "evidence": as_list(profile.get("evidence")),
        "recommended_followups": [f"Tell me about a specific example of {item.replace('_', ' ')}." for item in missing],
    })


async def opportunities() -> list[dict[str, Any]]:
    return OPPORTUNITIES


async def opportunity_detail(opportunity_id: str) -> JSONResponse:
    item = find_opportunity(opportunity_id)
    return JSONResponse(item) if item else error("INVALID_OPPORTUNITY", "Opportunity not found", 404)


async def opportunity_research(payload: dict[str, Any]) -> JSONResponse:
    company = text(payload.get("company"))
    role = text(payload.get("role"))
    if not company or not role:
        return error("VALIDATION_ERROR", "company and role are required")
    item = {
        "id": f"{company.lower().replace(' ', '-')}-{role.lower().replace(' ', '-')}",
        "company": company,
        "role": role,
        "requirements": as_list(payload.get("requirements")),
        "competencies": as_list(payload.get("competencies")) or ["ownership", "problem_solving", "communication"],
        "company_context": as_list(payload.get("company_context")),
        "sources": as_list(payload.get("sources")),
        "status": "ingested",
    }
    return JSONResponse({"opportunity": item, "knowledge_status": "ready"})


async def readiness(payload: dict[str, Any]) -> JSONResponse:
    analysis = await profile_analyze(payload)
    data = json.loads(analysis.body)
    return JSONResponse({
        "demonstrated": data["demonstrated"],
        "partial": data["partial"],
        "missing": data["missing"],
        "interview_focus": data["missing"][:3],
        "recommended_actions": data["recommended_followups"],
    })


async def interview_debrief(payload: dict[str, Any]) -> JSONResponse:
    history = as_list(payload.get("history"))
    state = as_dict(payload.get("session_state"))
    answers = [item.get("content", item.get("answer", "")) for item in history if isinstance(item, dict) and item.get("role") == "user"]
    evidence = as_list(state.get("evidence_discovered") or state.get("evidence_found"))
    return JSONResponse({
        "competencies": as_list(state.get("competencies_assessed")),
        "evidence": evidence,
        "strengths": ["The candidate provided concrete examples." ] if answers else [],
        "gaps": as_list(state.get("weak_areas")),
        "coaching": ["Separate the situation, your specific action, and the measurable outcome in each answer."],
        "next_steps": ["Practice one evidence-based story for each target competency."],
        "profile_updates": evidence,
    })
