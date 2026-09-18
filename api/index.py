"""Vercel entrypoint for the interview and TTS FastAPI routes."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.interview import interview
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
