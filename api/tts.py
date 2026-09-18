import asyncio
from typing import Any

import edge_tts
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

VOICES = {
    "female": "en-NG-EzinneNeural",
    "male": "en-NG-AbeoNeural",
}
MAX_TEXT_LENGTH = 1200


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


async def synthesize(text: str, voice: str) -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    chunks: list[bytes] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    return b"".join(chunks)


@app.post("/api/tts")
async def text_to_speech(request: Request) -> Response:
    try:
        payload: Any = await request.json()
    except ValueError:
        return JSONResponse({"error": "Request body must be valid JSON"}, status_code=400)

    if not isinstance(payload, dict):
        return JSONResponse({"error": "Request body must be a JSON object"}, status_code=400)

    text = str(payload.get("text", "")).strip()
    if not text:
        return JSONResponse({"error": "text is required"}, status_code=400)

    voice = VOICES.get(payload.get("voice", "female"), VOICES["female"])
    try:
        audio = await synthesize(text[:MAX_TEXT_LENGTH], voice)
    except Exception:
        return JSONResponse({"error": "The speech service could not generate audio"}, status_code=502)

    return Response(content=audio, media_type="audio/mpeg", headers={"Cache-Control": "no-store"})
