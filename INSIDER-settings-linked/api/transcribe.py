"""Audio transcription endpoint for browsers without Web Speech recognition."""

from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from groq import Groq

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.post("/")
@app.post("/api/transcribe")
async def transcribe(request: Request) -> JSONResponse:
    audio = await request.body()
    if not audio:
        return JSONResponse({"error": "Audio is required"}, status_code=400)
    if len(audio) > 25 * 1024 * 1024:
        return JSONResponse({"error": "Audio is too large"}, status_code=413)
    if not os.environ.get("GROQ_API_KEY"):
        return JSONResponse({"error": "GROQ_API_KEY is not configured"}, status_code=502)

    content_type = request.headers.get("content-type", "audio/webm").split(";", 1)[0]
    extension = {
        "audio/mp4": "mp4",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
        "audio/webm": "webm",
    }.get(content_type, "webm")

    try:
        client = Groq(api_key=os.environ["GROQ_API_KEY"])
        result: Any = client.audio.transcriptions.create(
            file=(f"answer.{extension}", audio),
            model=os.environ.get("GROQ_TRANSCRIPTION_MODEL", "whisper-large-v3-turbo"),
            response_format="json",
            language="en",
        )
    except Exception as error:
        return JSONResponse({"error": "Transcription failed", "detail": str(error)}, status_code=502)

    return JSONResponse({"text": str(getattr(result, "text", "")).strip()})
