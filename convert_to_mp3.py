"""Generate an MP3 (audio/mpeg) file from text using edge-tts."""

from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

import edge_tts

DEFAULT_VOICE = "en-NG-EzinneNeural"


async def synthesize(text: str, voice: str) -> bytes:
    """Return MP3 bytes generated from text."""
    audio_chunks: list[bytes] = []
    communicate = edge_tts.Communicate(text, voice)

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])

    return b"".join(audio_chunks)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert text to an MP3 audio/mpeg file."
    )
    parser.add_argument("text", help="Text to convert to speech")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("output.mp3"),
        help="Output MP3 path (default: output.mp3)",
    )
    parser.add_argument(
        "-v",
        "--voice",
        default=DEFAULT_VOICE,
        help=f"edge-tts voice (default: {DEFAULT_VOICE})",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    audio = asyncio.run(synthesize(args.text, args.voice))
    if not audio:
        raise RuntimeError("The speech service returned no audio data")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(audio)
    print(f"Created {args.output} ({len(audio)} bytes, audio/mpeg)")


if __name__ == "__main__":
    main()
