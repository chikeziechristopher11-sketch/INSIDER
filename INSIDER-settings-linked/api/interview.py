"""AI-powered adaptive interview endpoint backed by Groq."""

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
    "name": "Candidate",
    "summary": "",
    "experience": [],
}


MOCK_ROLE = {
    "company": "Company",
    "title": "Interview Candidate",
    "description": "General professional interview.",
    "competencies": [
        "problem_solving",
        "communication",
        "ownership",
        "execution",
    ],
}


SYSTEM_PROMPT = """
You are an expert professional interviewer and interview evaluator.

You are conducting an adaptive job interview.

Your job has TWO responsibilities:

1. Conduct the interview naturally.
2. Evaluate the candidate's actual answers objectively.

IMPORTANT SCORING RULES:

- NEVER give a high score simply because the candidate completed the interview.
- NEVER assume an answer is good without evidence.
- A vague, extremely short, irrelevant, incorrect, or unsupported answer must receive a low evaluation.
- A detailed answer with a clear situation, personal actions, reasoning, trade-offs, measurable results, and reflection should receive a stronger evaluation.
- Distinguish between what the candidate CLAIMS and what they actually demonstrate.
- Do not invent achievements, metrics, skills, or evidence that the candidate did not provide.
- Evaluate the candidate based ONLY on their answers and the supplied role requirements.
- The final score must reflect answer quality, not interview completion.
- A candidate can receive a low score even if they answered every question.
- A candidate can receive a high score only when their answers contain strong, relevant evidence.

Evaluate these dimensions:

- relevance
- correctness
- depth
- specificity
- reasoning
- ownership
- communication
- evidence
- role relevance

Evidence should ideally contain:
- a concrete situation
- the candidate's personal action
- reasoning or decision-making
- trade-offs where relevant
- measurable or observable outcome
- reflection or learning

Use only competencies relevant to the supplied role.

During the interview:

- Ask concise questions.
- Ask follow-up questions when an answer is vague.
- Probe unsupported claims.
- Move to another competency when sufficient evidence has been collected.
- Do not tell the candidate how to answer before they answer.
- Questions should depend on the candidate's previous answers.

When the interview is complete, produce a detailed AI-generated debrief.

The final score must be an integer from 0 to 100.

Use approximately these principles when deciding the score:

0-20:
Very poor evidence, irrelevant answers, or almost no useful substance.

21-40:
Limited evidence, vague answers, weak ownership or reasoning.

41-60:
Some relevant evidence but significant gaps in depth, specificity, reasoning, or outcomes.

61-75:
Generally solid answers with relevant evidence, but noticeable weaknesses.

76-89:
Strong, specific, well-reasoned answers with clear ownership and outcomes.

90-100:
Consistently exceptional evidence across the important competencies, with strong reasoning, ownership, specificity, outcomes, and role relevance.

Do NOT mechanically calculate the score from these ranges.
Use professional judgment based on the complete conversation.

Return VALID JSON ONLY using this structure:

{
  "question": "short spoken question",
  "competency": "competency being assessed",
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
    "evidence_found": [
      "only concrete evidence actually present in the answer"
    ],
    "strength": "weak|moderate|strong",
    "missing_evidence": [
      "evidence that is still missing"
    ],
    "claims_needing_follow_up": [
      "claims that need verification or clarification"
    ]
  },

  "session_state": {
    "competencies_assessed": [],
    "evidence_discovered": [],
    "weak_areas": [],
    "claims_needing_follow_up": [],
    "current_competency": "",
    "remaining_competencies": [],
    "progress": 0.0,
    "interview_complete": false
  },

  "debrief": null
}

WHEN THE INTERVIEW IS COMPLETE:

Set:

"question_type": "completion"
"question": ""
"session_state.interview_complete": true

And return:

"debrief": {
  "score": 0,
  "overall_summary": "",
  "strengths": [],
  "weaknesses": [],
  "evidence_discovered": [],
  "competency_assessments": [],
  "specific_coaching": [],
  "practice_next": []
}

The debrief score MUST be based on the candidate's actual answers.

The competency assessments should explain what the candidate demonstrated and what they failed to demonstrate.

Do not make all competency assessments positive.

Do not automatically give the candidate credit for a competency merely because they were asked about it.
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

        content = item.get(
            "content",
            item.get(
                "text",
                item.get(
                    "answer",
                    ""
                )
            )
        )

        if role in {"user", "assistant"} and str(content).strip():
            cleaned.append({
                "role": role,
                "content": str(content).strip()
            })

        elif "answer" in item and str(content).strip():
            cleaned.append({
                "role": "user",
                "content": str(content).strip()
            })

    return cleaned


class InterviewEngine:

    def __init__(self, client: Any = None) -> None:

        if client is not None:
            self.client = client

        elif os.environ.get("GROQ_API_KEY"):

            from groq import Groq

            self.client = Groq(
                api_key=os.environ["GROQ_API_KEY"]
            )

        else:
            self.client = None

        self.model = os.environ.get(
            "GROQ_MODEL",
            "openai/gpt-oss-20b"
        )


    def next_turn(
        self,
        payload: dict[str, Any]
    ) -> dict[str, Any]:

        candidate = _as_dict(
            payload.get("candidate"),
            MOCK_CANDIDATE
        )

        role = _as_dict(
            payload.get("role"),
            MOCK_ROLE
        )

        history = _clean_history(
            payload.get("history")
        )

        session_state = _as_dict(
            payload.get("session_state"),
            {}
        )

        if self.client is None:

            if os.environ.get(
                "INTERVIEW_MOCK_MODE",
                ""
            ).lower() == "true":

                return self._mock_turn(
                    candidate,
                    role,
                    history,
                    session_state
                )

            raise RuntimeError(
                "GROQ_API_KEY is not configured"
            )


        user_prompt = json.dumps(
            {
                "candidate": candidate,
                "role": role,
                "conversation_history": history,
                "session_state": session_state,

                "instruction": (
                    "Generate the opening question."
                    if not history
                    else
                    "Evaluate the latest candidate answer. "
                    "Update the evidence and session state. "
                    "Then generate the next appropriate question. "
                    "If enough evidence has been collected, "
                    "complete the interview and generate the final "
                    "AI debrief and score."
                )
            },
            ensure_ascii=True
        )


        completion = self.client.chat.completions.create(

            model=self.model,

            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],

            temperature=0.25,

            max_tokens=3000,

            response_format={
                "type": "json_object"
            }
        )


        raw_content = (
            completion
            .choices[0]
            .message
            .content
            or "{}"
        )


        result = json.loads(
            raw_content
        )


        return self._normalize_result(
            result,
            role,
            history
        )


    def _normalize_result(
        self,
        result: dict[str, Any],
        role: dict[str, Any],
        history: list[dict[str, str]]
    ) -> dict[str, Any]:

        state = _as_dict(
            result.get("session_state"),
            {}
        )


        state["questions_asked"] = [
            item["content"]
            for item in history
            if item["role"] == "assistant"
        ]


        state["candidate_answers"] = [
            item["content"]
            for item in history
            if item["role"] == "user"
        ]


        state["competencies_assessed"] = _as_list(
            state.get("competencies_assessed")
        )

        state["evidence_discovered"] = _as_list(
            state.get("evidence_discovered")
        )

        state["weak_areas"] = _as_list(
            state.get("weak_areas")
        )

        state["claims_needing_follow_up"] = _as_list(
            state.get("claims_needing_follow_up")
        )

        state["remaining_competencies"] = _as_list(
            state.get("remaining_competencies")
        )


        state["interview_complete"] = bool(
            state.get(
                "interview_complete",
                False
            )
        )


        try:

            state["progress"] = max(
                0.0,
                min(
                    1.0,
                    float(
                        state.get(
                            "progress",
                            0.0
                        )
                    )
                )
            )

        except (
            TypeError,
            ValueError
        ):

            state["progress"] = 0.0


        debrief = None


        if state["interview_complete"]:

            debrief = _as_dict(
                result.get("debrief"),
                {}
            )


            # Normalize the AI score.
            try:

                score = int(
                    round(
                        float(
                            debrief.get(
                                "score",
                                0
                            )
                        )
                    )
                )

            except (
                TypeError,
                ValueError
            ):

                score = 0


            # Never allow completion progress to become
            # the interview performance score.
            score = max(
                0,
                min(
                    100,
                    score
                )
            )


            debrief["score"] = score


            debrief["overall_summary"] = str(
                debrief.get(
                    "overall_summary",
                    "The interview has been completed."
                )
            )


            debrief["strengths"] = _as_list(
                debrief.get("strengths")
            )

            debrief["weaknesses"] = _as_list(
                debrief.get("weaknesses")
            )

            debrief["evidence_discovered"] = _as_list(
                debrief.get(
                    "evidence_discovered",
                    state["evidence_discovered"]
                )
            )

            debrief["competency_assessments"] = _as_list(
                debrief.get(
                    "competency_assessments"
                )
            )

            debrief["specific_coaching"] = _as_list(
                debrief.get(
                    "specific_coaching"
                )
            )

            debrief["practice_next"] = _as_list(
                debrief.get(
                    "practice_next"
                )
            )


        return {

            "status": (
                "complete"
                if state["interview_complete"]
                else "continue"
            ),

            "question": str(
                result.get(
                    "question",
                    ""
                )
            ).strip(),

            "competency": str(
                result.get(
                    "competency",
                    ""
                )
            ).strip(),

            "question_type": str(
                result.get(
                    "question_type",
                    "follow_up"
                )
            ).strip(),

            "evaluation": _as_dict(
                result.get(
                    "evaluation"
                ),
                {}
            ),

            "session_state": state,

            "debrief": debrief,

            "role": {
                "company": role.get(
                    "company",
                    ""
                ),
                "title": role.get(
                    "title",
                    ""
                )
            }
        }


    def _mock_turn(
        self,
        candidate: dict[str, Any],
        role: dict[str, Any],
        history: list[dict[str, str]],
        session_state: dict[str, Any]
    ) -> dict[str, Any]:

        # Mock mode is intentionally simple.
        # For real scoring, configure GROQ_API_KEY.

        del candidate

        answers = [
            item["content"]
            for item in history
            if item["role"] == "user"
        ]

        competencies = (
            _as_list(
                role.get("competencies")
            )
            or [
                "ownership",
                "problem_solving",
                "communication"
            ]
        )


        if len(answers) >= len(competencies):

            state = dict(
                session_state
            )

            state.update({

                "questions_asked": [
                    item["content"]
                    for item in history
                    if item["role"] == "assistant"
                ],

                "candidate_answers": answers,

                "competencies_assessed":
                    competencies,

                "evidence_discovered": [],

                "weak_areas": [],

                "claims_needing_follow_up": [],

                "current_competency":
                    competencies[-1],

                "remaining_competencies": [],

                "progress": 1.0,

                "interview_complete": True
            })


            # Mock mode does NOT pretend that completion
            # equals performance.
            debrief = {

                "score": 0,

                "overall_summary":
                    "Mock mode completed. Configure GROQ_API_KEY to receive an AI-generated evaluation.",

                "strengths": [],

                "weaknesses": [
                    "AI evaluation is unavailable in mock mode."
                ],

                "evidence_discovered": [],

                "competency_assessments": [],

                "specific_coaching": [
                    "Configure GROQ_API_KEY for AI-powered scoring."
                ],

                "practice_next": [
                    "Run the interview again with the AI evaluator enabled."
                ]
            }


            return {

                "status": "complete",

                "question": "",

                "competency": "",

                "question_type": "completion",

                "evaluation": {},

                "session_state": state,

                "debrief": debrief
            }


        if not answers:

            competency = competencies[0]

            question = (
                "Tell me about a time you demonstrated "
                f"{competency.replace('_', ' ')} "
                f"in your work at "
                f"{role.get('company', 'your last company')}."
            )

            question_type = "opening"

        else:

            question = (
                "What was the specific outcome "
                "of that decision, and what "
                "would you change now?"
            )

            question_type = "follow_up"

            competency = competencies[
                min(
                    len(answers),
                    len(competencies) - 1
                )
            ]


        state = dict(
            session_state
        )

        state.update({

            "status": "active",

            "questions_asked": [
                item["content"]
                for item in history
                if item["role"] == "assistant"
            ],

            "candidate_answers": answers,

            "competencies_assessed": [
                competency
            ],

            "evidence_discovered": [],

            "weak_areas": [],

            "claims_needing_follow_up": [],

            "current_competency": competency,

            "remaining_competencies": [
                item
                for item in competencies
                if item != competency
            ],

            "progress": (
                0.2
                if answers
                else 0.0
            ),

            "interview_complete": False
        })


        return {

            "status": "continue",

            "question": question,

            "competency": competency,

            "question_type": question_type,

            "evaluation": {},

            "session_state": state,

            "debrief": None
        }


app = FastAPI()


app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_methods=[
        "POST",
        "OPTIONS"
    ],

    allow_headers=[
        "Content-Type"
    ]
)


@app.post("/")
@app.post("/api/interview")
async def interview(
    payload: dict[str, Any]
) -> JSONResponse:

    try:

        result = InterviewEngine().next_turn(
            payload
        )

    except Exception as error:

        return JSONResponse(

            {
                "error": {
                    "code": "MODEL_FAILURE",

                    "message":
                        "Interview generation failed",

                    "retryable": True,

                    "detail":
                        str(error)
                }
            },

            status_code=502
        )


    return JSONResponse(
        result
    )