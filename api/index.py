"""Vercel entrypoint for the interview and TTS FastAPI routes."""

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from api.aptitude import aptitude_start, aptitude_submit, aptitude_tracks
from api.interview import interview
from api.product import (
    health,
    interview_debrief,
    opportunity_detail,
    opportunity_research,
    opportunities,
    profile_analyze,
    profile_cv,
    profile_cv_upload,
    profile_generate,
    profile_intake,
    readiness,
)
from api.transcribe import transcribe
from api.tts import text_to_speech

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        {"error": {"code": "VALIDATION_ERROR", "message": "Request body is invalid", "retryable": False}},
        status_code=422,
    )

app.add_api_route("/api/interview", interview, methods=["POST"])
app.add_api_route("/api/interview/debrief", interview_debrief, methods=["POST"])
app.add_api_route("/api/tts", text_to_speech, methods=["POST"])
app.add_api_route("/api/transcribe", transcribe, methods=["POST"])
app.add_api_route("/api/health", health, methods=["GET"])
app.add_api_route("/api/profile/intake", profile_intake, methods=["POST"])
app.add_api_route("/api/profile/cv", profile_cv, methods=["POST"])
app.add_api_route("/api/profile/cv/upload", profile_cv_upload, methods=["POST"])
app.add_api_route("/api/profile/generate", profile_generate, methods=["POST"])
app.add_api_route("/api/profile/analyze", profile_analyze, methods=["POST"])
app.add_api_route("/api/opportunities", opportunities, methods=["GET"])
app.add_api_route("/api/opportunities/{opportunity_id}", opportunity_detail, methods=["GET"])
app.add_api_route("/api/opportunities/research", opportunity_research, methods=["POST"])
app.add_api_route("/api/readiness", readiness, methods=["POST"])
app.add_api_route("/api/aptitude/tracks", aptitude_tracks, methods=["GET"])
app.add_api_route("/api/aptitude/start", aptitude_start, methods=["POST"])
app.add_api_route("/api/aptitude/submit", aptitude_submit, methods=["POST"])
app.mount("/", StaticFiles(directory=Path(__file__).resolve().parent.parent, html=True), name="frontend")
