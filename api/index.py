"""Vercel entrypoint for the interview and TTS FastAPI routes."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.interview import interview
from api.transcribe import transcribe
from api.tts import text_to_speech

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.add_api_route("/api/interview", interview, methods=["POST"])
app.add_api_route("/api/tts", text_to_speech, methods=["POST"])
app.add_api_route("/api/transcribe", transcribe, methods=["POST"])
app.mount("/", StaticFiles(directory=Path(__file__).resolve().parent.parent, html=True), name="frontend")
