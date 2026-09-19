"""Timed aptitude test: curated question bank, server-side scoring.

Correct answers never leave the server until after submission, so the
test can't be gamed by reading the network response.
"""

from __future__ import annotations

import random
from typing import Any

from fastapi.responses import JSONResponse


QUESTION_BANK: list[dict[str, Any]] = [
    # --- Numerical reasoning ---
    {
        "id": "num-1",
        "category": "numerical",
        "question": "A shop sells a bag for 4,500 after a 25% discount. What was the original price?",
        "options": ["5,625", "6,000", "5,400", "6,200"],
        "correct_index": 1,
    },
    {
        "id": "num-2",
        "category": "numerical",
        "question": "If 3 machines produce 90 units in 2 hours, how many units do 5 machines produce in 3 hours (same rate)?",
        "options": ["150", "225", "200", "180"],
        "correct_index": 1,
    },
    {
        "id": "num-3",
        "category": "numerical",
        "question": "A company's revenue grew from 8,000,000 to 10,400,000 in a year. What was the percentage growth?",
        "options": ["24%", "28%", "30%", "32%"],
        "correct_index": 2,
    },
    {
        "id": "num-4",
        "category": "numerical",
        "question": "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
        "options": ["36", "40", "42", "44"],
        "correct_index": 2,
    },
    {
        "id": "num-5",
        "category": "numerical",
        "question": "A train travels 180km in 2.5 hours. At the same speed, how long does 288km take?",
        "options": ["3 hours", "3.5 hours", "4 hours", "4.5 hours"],
        "correct_index": 2,
    },
    {
        "id": "num-6",
        "category": "numerical",
        "question": "An investment of 200,000 earns 12% simple interest per year. What is it worth after 3 years?",
        "options": ["272,000", "268,000", "280,000", "264,000"],
        "correct_index": 0,
    },
    # --- Logical reasoning ---
    {
        "id": "log-1",
        "category": "logical",
        "question": "All analysts are detail-oriented. Some detail-oriented people are slow workers. Which conclusion is valid?",
        "options": [
            "All analysts are slow workers",
            "Some analysts might be slow workers",
            "No analysts are slow workers",
            "All slow workers are analysts",
        ],
        "correct_index": 1,
    },
    {
        "id": "log-2",
        "category": "logical",
        "question": "If it rains, the match is postponed. The match was not postponed. What can you conclude?",
        "options": [
            "It rained",
            "It did not rain",
            "The match was cancelled",
            "Nothing can be concluded",
        ],
        "correct_index": 1,
    },
    {
        "id": "log-3",
        "category": "logical",
        "question": "Which figure completes the pattern: Circle, Square, Triangle, Circle, Square, ?",
        "options": ["Circle", "Square", "Triangle", "Pentagon"],
        "correct_index": 2,
    },
    {
        "id": "log-4",
        "category": "logical",
        "question": "Five colleagues sit in a row. Ada is left of Bola. Chidi is right of Bola. Deji is left of Ada. Who is in the middle?",
        "options": ["Ada", "Bola", "Chidi", "Deji"],
        "correct_index": 0,
    },
    {
        "id": "log-5",
        "category": "logical",
        "question": "Book is to Library as Painting is to ?",
        "options": ["Artist", "Frame", "Gallery", "Canvas"],
        "correct_index": 2,
    },
    {
        "id": "log-6",
        "category": "logical",
        "question": "If some of the claims in a report are false, does it follow that the report's conclusion is false?",
        "options": [
            "Yes, always",
            "No, not necessarily",
            "Only if all claims are false",
            "Only if the author admits it",
        ],
        "correct_index": 1,
    },
    # --- Verbal reasoning ---
    {
        "id": "verb-1",
        "category": "verbal",
        "question": "Choose the word that is the opposite of 'transparent' in a business context.",
        "options": ["Honest", "Evasive", "Clear", "Direct"],
        "correct_index": 1,
    },
    {
        "id": "verb-2",
        "category": "verbal",
        "question": "\"The candidate's answer was evasive.\" What does 'evasive' mean here?",
        "options": [
            "Confident and direct",
            "Avoiding giving a clear answer",
            "Well-researched",
            "Aggressive",
        ],
        "correct_index": 1,
    },
    {
        "id": "verb-3",
        "category": "verbal",
        "question": "Which word best completes: 'The merger was expected to ___ costs across both companies.'",
        "options": ["inflate", "consolidate", "obscure", "delay"],
        "correct_index": 1,
    },
    {
        "id": "verb-4",
        "category": "verbal",
        "question": "Select the sentence that is grammatically correct.",
        "options": [
            "Neither the manager nor the analysts was available.",
            "Neither the manager nor the analysts were available.",
            "Neither the manager or the analysts were available.",
            "Neither the manager nor analysts was available.",
        ],
        "correct_index": 1,
    },
    {
        "id": "verb-5",
        "category": "verbal",
        "question": "'Meticulous' most nearly means:",
        "options": ["Careless", "Very careful and precise", "Fast", "Confident"],
        "correct_index": 1,
    },
    # --- Attention to detail ---
    {
        "id": "att-1",
        "category": "attention",
        "question": "Which of these account numbers does NOT match the pattern NGN-0245-88-XX (X = any digit)?",
        "options": ["NGN-0245-88-12", "NGN-0245-88-04", "NGN-0245-89-12", "NGN-0245-88-99"],
        "correct_index": 2,
    },
    {
        "id": "att-2",
        "category": "attention",
        "question": "Spot the error: 'The recieved invoice was proccessed on time.'",
        "options": [
            "recieved, proccessed",
            "invoice, processed",
            "was, on",
            "No errors",
        ],
        "correct_index": 0,
    },
    {
        "id": "att-3",
        "category": "attention",
        "question": "Two reports show Q3 revenue as 4,820,000 and 4,280,000. What is the discrepancy?",
        "options": ["420,000", "540,000", "460,000", "500,000"],
        "correct_index": 1,
    },
]


def _public_question(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": item["id"],
        "category": item["category"],
        "question": item["question"],
        "options": item["options"],
    }


async def aptitude_start(payload: dict[str, Any]) -> JSONResponse:
    count = min(int(payload.get("count", 12)), len(QUESTION_BANK))

    categories: dict[str, list[dict[str, Any]]] = {}
    for item in QUESTION_BANK:
        categories.setdefault(item["category"], []).append(item)

    selected: list[dict[str, Any]] = []
    per_category = max(1, count // len(categories))

    for items in categories.values():
        pool = items.copy()
        random.shuffle(pool)
        selected.extend(pool[:per_category])

    random.shuffle(selected)
    selected = selected[:count]

    return JSONResponse({
        "questions": [_public_question(item) for item in selected],
        "duration_seconds": len(selected) * 60,
        "total": len(selected),
    })


async def aptitude_submit(payload: dict[str, Any]) -> JSONResponse:
    answers = payload.get("answers", [])
    if not isinstance(answers, list) or not answers:
        return JSONResponse(
            {"error": {"code": "VALIDATION_ERROR", "message": "answers is required", "retryable": False}},
            status_code=400,
        )

    lookup = {item["id"]: item for item in QUESTION_BANK}
    results: list[dict[str, Any]] = []
    category_totals: dict[str, dict[str, int]] = {}

    for answer in answers:
        question_id = answer.get("id")
        selected_index = answer.get("selected_index")
        item = lookup.get(question_id)
        if item is None:
            continue

        is_correct = selected_index == item["correct_index"]
        category = item["category"]
        totals = category_totals.setdefault(category, {"correct": 0, "total": 0})
        totals["total"] += 1
        if is_correct:
            totals["correct"] += 1

        results.append({
            "id": question_id,
            "category": category,
            "correct": is_correct,
            "correct_index": item["correct_index"],
            "selected_index": selected_index,
        })

    total_correct = sum(1 for r in results if r["correct"])
    total = len(results)
    score = round((total_correct / total) * 100) if total else 0

    return JSONResponse({
        "score": score,
        "correct": total_correct,
        "total": total,
        "by_category": {
            category: {
                "correct": totals["correct"],
                "total": totals["total"],
                "score": round((totals["correct"] / totals["total"]) * 100) if totals["total"] else 0,
            }
            for category, totals in category_totals.items()
        },
        "results": results,
    })
