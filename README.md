# Insider

Insider is an AI-powered career readiness platform built to close the access gap in
Nigeria's hiring process. Instead of generic interview tips, users get an AI coach
that runs real, adaptive practice interviews, a real aptitude test, and a profile
that turns their experience into evidence employers can actually understand.

Whether you're a fresh graduate or a career changer, Insider makes sure your first
shot isn't a guess.

## What's in the product

- **Profile builder** — skills, experience, projects, achievements, education, and
  links, plus CV upload with server-side text extraction (PDF, DOCX, TXT).
- **CV generator** — turns whatever's in your profile into a clean, downloadable CV
  (print-to-PDF, no external service).
- **AI interview room** — a live, adaptive voice interview backed by Groq. The
  model asks follow-up questions based on what you actually said, evaluates your
  evidence, and gives a real debrief (strengths, gaps, coaching) — not a canned
  script. Includes a typed-answer fallback for when speech recognition doesn't
  transcribe cleanly.
- **Aptitude test** — a timed, 12-question test across numerical, logical, verbal
  reasoning and attention to detail, the same categories most employers screen on.
  Pick a track (Software Engineer, Marketer, or General) to layer in role-specific
  questions. Scored entirely server-side so answers can't be read off the network
  response.
- **Voice** — real Nigerian-accented neural voice (via edge-tts), not the browser's
  built-in text-to-speech.

## Stack

- **Frontend**: vanilla HTML/CSS/JS, no framework. Font Awesome for icons.
- **Backend**: FastAPI (Python), deployed as Vercel serverless functions.
- **AI**: Groq (interview generation, Whisper transcription), edge-tts (voice).
- **Deployment**: Vercel. The backend (`api/`) and frontend live together at the
  repo root — that's what Vercel actually builds and serves.

## Running locally

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Optional: skip real Groq calls while working on the frontend
set INTERVIEW_MOCK_MODE=true  # Windows
# export INTERVIEW_MOCK_MODE=true

uvicorn api.index:app --port 8000
```

Then open `http://127.0.0.1:8000`.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Yes, for real AI | Powers the interview engine and transcription. Without it, the interview falls back to a basic mock mode. |
| `GROQ_MODEL` | No | Defaults to `openai/gpt-oss-20b`. |
| `GROQ_TRANSCRIPTION_MODEL` | No | Defaults to `whisper-large-v3-turbo`. |
| `INTERVIEW_MOCK_MODE` | No | Set to `true` locally to develop without burning Groq calls. Never set in production. |

See `docs/API_CONTRACT.md` for the full endpoint reference and `docs/FRONTEND_INTEGRATION.md`
for how the frontend is expected to call the backend.

## Project layout

```
api/            FastAPI backend (interview, aptitude, profile, tts, transcribe)
docs/           API contract and integration reference
*.html/.css/.js Frontend pages — one HTML/CSS/JS set per page, no bundler
```

## Known gaps

- **Auth is local-only.** Signup/login persist an account in `localStorage`, not a
  real database — accounts don't carry across devices or browsers yet.
- **Settings page logic hasn't been fully audited** (icons and layout have).
