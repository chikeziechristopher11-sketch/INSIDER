import os
import json
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from api.interview import InterviewEngine
from api.index import app as api_app
from api.interview_session import app as interview_session_app


@pytest.fixture(autouse=True)
def mock_interview_mode(monkeypatch):
    monkeypatch.setenv("INTERVIEW_MOCK_MODE", "true")


@pytest.mark.parametrize(
    "payload, expected_error",
    [
        ({}, "VALIDATION_ERROR"),
        ({"candidate": {"name": "A"}, "role": {"company": "ACME", "title": "Engineer", "competencies": ["execution"]}, "history": []}, "VALIDATION_ERROR"),
        ({"candidate": {"name": "A", "summary": "x"}, "role": {"company": "ACME", "title": "Engineer", "competencies": ["not_real"]}, "history": []}, "VALIDATION_ERROR"),
        ({"candidate": {"name": "A", "summary": "x"}, "role": {"company": "ACME", "title": "Engineer", "competencies": ["execution"]}, "history": [{"role": "assistant", "content": "Hello"}]}, "VALIDATION_ERROR"),
    ],
)
def test_interview_rejects_invalid_or_untrusted_payloads(payload, expected_error):
    engine = InterviewEngine(client=None)
    with pytest.raises(ValueError, match=expected_error):
        engine.next_turn(payload)


def test_interview_allows_only_whitelisted_role_scope():
    user_id = "user-allowed"
    session_id = "session-allowed"
    token = InterviewEngine.issue_session_token(user_id=user_id, session_id=session_id, candidate_name="Amaka Okafor", role_title="Product Designer, Digital Channels")
    payload = {
        "candidate": {
            "name": "Amaka Okafor",
            "summary": "Product designer with three years of fintech experience.",
            "experience": ["Designed onboarding flows."],
        },
        "role": {
            "company": "GTCO",
            "title": "Product Designer, Digital Channels",
            "competencies": ["product_thinking", "customer_empathy", "business_sense", "execution", "influence"],
        },
        "history": [],
        "session": {
            "user_id": user_id,
            "session_id": session_id,
            "token": token,
        },
    }

    response = InterviewEngine(client=None).next_turn(payload)
    assert response["status"] in {"continue", "complete"}
    assert response["role"]["company"] == "GTCO"
    assert response["role"]["title"] == "Product Designer, Digital Channels"
    assert all(item in {"product_thinking", "customer_empathy", "business_sense", "execution", "influence"} for item in payload["role"]["competencies"])


def test_interview_rejects_invalid_session_token():
    payload = {
        "candidate": {
            "name": "Amaka Okafor",
            "summary": "Product designer with three years of fintech experience.",
            "experience": ["Designed onboarding flows."],
        },
        "role": {
            "company": "GTCO",
            "title": "Product Designer, Digital Channels",
            "competencies": ["product_thinking", "customer_empathy", "business_sense", "execution", "influence"],
        },
        "history": [],
        "session": {
            "user_id": "user-123",
            "session_id": "session-123",
            "token": "bad-token",
        },
    }

    with pytest.raises(ValueError, match="VALIDATION_ERROR: invalid session token"):
        InterviewEngine(client=None).next_turn(payload)


def test_interview_accepts_valid_session_token():
    user_id = "user-123"
    session_id = "session-456"
    token = InterviewEngine.issue_session_token(user_id=user_id, session_id=session_id, candidate_name="Amaka Okafor", role_title="Product Designer, Digital Channels")

    payload = {
        "candidate": {
            "name": "Amaka Okafor",
            "summary": "Product designer with three years of fintech experience.",
            "experience": ["Designed onboarding flows."],
        },
        "role": {
            "company": "GTCO",
            "title": "Product Designer, Digital Channels",
            "competencies": ["product_thinking", "customer_empathy", "business_sense", "execution", "influence"],
        },
        "history": [],
        "session": {
            "user_id": user_id,
            "session_id": session_id,
            "token": token,
        },
    }

    response = InterviewEngine(client=None).next_turn(payload)
    assert response["status"] in {"continue", "complete"}
    assert response["role"]["company"] == "GTCO"


@pytest.mark.parametrize("app", [api_app, interview_session_app])
def test_interview_session_route_creates_signed_session(app):
    response = TestClient(app).post(
        "/api/interview_session",
        json={
            "user_id": "user-123",
            "session_id": "session-456",
            "candidate_name": "Amaka Okafor",
            "role_title": "Product Designer, Digital Channels",
        },
    )

    assert response.status_code == 200
    session = response.json()["session"]
    assert session["user_id"] == "user-123"
    assert session["session_id"] == "session-456"
    assert session["token"] == InterviewEngine.issue_session_token(
        user_id="user-123",
        session_id="session-456",
        candidate_name="Amaka Okafor",
        role_title="Product Designer, Digital Channels",
    )


def test_signed_session_route_generates_opening_question():
    client = TestClient(api_app)
    session_response = client.post(
        "/api/interview_session",
        json={
            "user_id": "user-123",
            "session_id": "session-456",
            "candidate_name": "Amaka Okafor",
            "role_title": "Product Designer, Digital Channels",
        },
    )
    interview_response = client.post(
        "/api/interview",
        json={
            "candidate": {
                "name": "Amaka Okafor",
                "summary": "Product designer with customer onboarding experience.",
                "experience": ["Designed onboarding flows."],
            },
            "role": {
                "company": "GTCO",
                "title": "Product Designer, Digital Channels",
                "competencies": ["product_thinking", "customer_empathy", "business_sense", "execution", "influence"],
            },
            "history": [],
            "session_state": {},
            "session": session_response.json()["session"],
        },
    )

    assert interview_response.status_code == 200
    assert interview_response.json()["status"] == "continue"
    assert interview_response.json()["question"]


def test_ai_debrief_scores_all_competencies_and_requires_transcript_quotes():
    user_id = "debrief-user"
    session_id = "debrief-session"
    role_title = "Operations Lead"
    payload = {
        "candidate": {
            "name": "Amina",
            "summary": "Operations professional",
            "experience": [],
        },
        "role": {
            "company": "Example Co",
            "title": role_title,
            "competencies": ["ownership", "communication"],
        },
        "history": [
            {"role": "assistant", "content": "Tell me about a process you improved."},
            {"role": "user", "content": "I redesigned intake and reduced processing time by two days."},
        ],
        "session_state": {},
        "session": {
            "user_id": user_id,
            "session_id": session_id,
            "token": InterviewEngine.issue_session_token(
                user_id, session_id, "Amina", role_title
            ),
        },
    }
    model_result = {
        "overall_summary": "One answer contained a specific outcome; the other competency was not demonstrated.",
        "performance_score": 100,
        "strengths": ["Reduced processing time by two days."],
        "weaknesses": ["Communication evidence was not provided."],
        "evidence_discovered": [
            {"competency": "ownership", "evidence_quote": "reduced processing time by two days"},
            {"competency": "communication", "evidence_quote": "I led a team of 20 people"},
        ],
        "competency_assessments": [
            {
                "competency": "ownership",
                "score": 4,
                "rating": "exceptional",
                "rationale": "The answer states a personal action and outcome.",
                "evidence_quote": "I redesigned intake and reduced processing time by two days.",
            },
            {
                "competency": "communication",
                "score": 4,
                "rating": "exceptional",
                "rationale": "The candidate led a large team.",
                "evidence_quote": "I led a team of 20 people.",
            },
        ],
        "specific_coaching": ["Give a specific communication example."],
        "practice_next": ["Practice a stakeholder communication example."],
    }
    message = SimpleNamespace(content=json.dumps(model_result))
    completion = SimpleNamespace(choices=[SimpleNamespace(message=message)])
    completions = SimpleNamespace(create=lambda **_: completion)
    client = SimpleNamespace(chat=SimpleNamespace(completions=completions))

    debrief = InterviewEngine(client=client).generate_debrief(payload)

    assert debrief["performance_score"] == 50
    assert [item["score"] for item in debrief["competency_assessments"]] == [4, 0]
    assert debrief["competency_assessments"][1]["evidence_quote"] == ""
    assert [item["competency"] for item in debrief["evidence_discovered"]] == ["ownership"]


def test_ai_debrief_requires_at_least_one_answer():
    user_id = "debrief-user"
    session_id = "debrief-empty"
    role_title = "Operations Lead"
    payload = {
        "candidate": {
            "name": "Amina",
            "summary": "Operations professional",
            "experience": [],
        },
        "role": {
            "company": "Example Co",
            "title": role_title,
            "competencies": ["ownership"],
        },
        "history": [],
        "session": {
            "user_id": user_id,
            "session_id": session_id,
            "token": InterviewEngine.issue_session_token(
                user_id, session_id, "Amina", role_title
            ),
        },
    }

    with pytest.raises(ValueError, match="at least one candidate answer"):
        InterviewEngine(client=object()).generate_debrief(payload)


def test_ai_debrief_api_route_is_registered_and_validates_payload():
    response = TestClient(api_app).post("/api/interview_debrief", json={})

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
