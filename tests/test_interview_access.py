import os

import pytest

from api.interview import InterviewEngine


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
