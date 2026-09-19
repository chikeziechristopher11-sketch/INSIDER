# Insider API Contract

Base URL: the deployed Vercel URL or `/` in the frontend.

All endpoints return JSON except `POST /api/tts`, which returns `audio/mpeg`. Errors use:

```json
{"error":{"code":"VALIDATION_ERROR","message":"...","retryable":false}}
```

## Health

### `GET /api/health`

Returns service configuration status without exposing secrets.

```json
{"status":"ok","services":{"api":"ok","groq":"configured","tts":"configured","rag":"configured"}}
```

## Profile

### `POST /api/profile/intake`

Progressive no-CV onboarding. The backend chooses the next useful question.

Request:

```json
{"profile":{"field":"marketing"},"answers":["I ran a campaign for a student group"],"current_section":"evidence","question_history":[]}
```

Response:

```json
{"next_question":{"id":"intake-2","text":"What did you personally do, and what changed because of it?","type":"evidence","purpose":"Collect concrete evidence without requiring a specific platform or work history."},"progress":{"completed":1,"total":4},"missing_information":[],"status":"continue"}
```

`status` is `complete` when enough basic profile information exists.

### `POST /api/profile/cv`

Request:

```json
{"cv_text":"Managed a school campaign that increased attendance.","candidate_data":{"name":"Amina","field":"marketing"}}
```

Response fields: `profile`, `evidence`, `missing_information`, `follow_up_questions`.

### `POST /api/profile/generate`

Request:

```json
{"candidate_data":{"name":"Amina","field":"marketing","goals":["brand strategy"]},"evidence":[{"description":"Ran a campaign","outcome":"Attendance increased"}]}
```

Response fields: `profile`, `summary`, `evidence`, `gaps`. The service does not invent facts.

### `POST /api/profile/analyze`

Request:

```json
{"profile":{"field":"sales","evidence":[{"claim":"Closed a partnership","type":"evidence"}]},"opportunity":{"competencies":["ownership","communication","negotiation"]}}
```

Response fields: `demonstrated`, `partial`, `missing`, `evidence`, `recommended_followups`.

## Opportunities

### `GET /api/opportunities`

Returns available opportunity context records.

### `GET /api/opportunities/{id}`

Returns one opportunity. Current mock IDs include `gtco-product-designer` and `general-professional-growth`. Unknown IDs return `INVALID_OPPORTUNITY` with HTTP 404.

### `POST /api/opportunities/research`

Ingests already-researched public context. No expensive web research occurs during interview turns.

Request:

```json
{"company":"Example Co","role":"Operations Lead","requirements":["Process improvement"],"competencies":["ownership","problem_solving"],"company_context":["Growth stage"],"sources":["https://example.com/role"]}
```

Response: `{ "opportunity": {...}, "knowledge_status": "ingested" }`.

## Readiness

### `POST /api/readiness`

Request:

```json
{"profile":{"field":"design","evidence":[{"claim":"Improved onboarding","type":"evidence"}]},"opportunity":{"competencies":["customer_empathy","execution"]}}
```

Response:

```json
{"demonstrated":[],"partial":[],"missing":["customer_empathy","execution"],"interview_focus":["customer_empathy","execution"],"recommended_actions":["Tell me about a specific example of customer empathy."]}
```

## Interview

### `POST /api/interview`

One Groq request per live turn. The browser never calls Groq directly.

Request:

```json
{"candidate":{"name":"Amina","field":"operations","evidence":[]},"role":{"company":"Example Co","title":"Operations Lead","competencies":["ownership","problem_solving"]},"history":[],"session_state":{}}
```

Active response:

```json
{"status":"continue","question":"Tell me about a time you improved a process.","competency":"ownership","question_type":"opening","evaluation":{},"session_state":{"status":"active","competencies_assessed":[],"evidence_discovered":[],"claims_needing_follow_up":[],"weak_areas":[],"questions_asked":[],"candidate_answers":[],"progress":0.0,"interview_complete":false}}
```

For the next turn, append the assistant question and user answer to `history`, then send the returned `session_state` back. The next question uses the latest answer and remaining competencies. Completed interviews return `status: "complete"` and `debrief`.

### `POST /api/interview/debrief`

Request:

```json
{"candidate":{},"role":{"competencies":["ownership"]},"history":[{"role":"user","content":"I improved the process."}],"session_state":{"competencies_assessed":["ownership"],"evidence_discovered":[]}}
```

Response fields: `competencies`, `evidence`, `strengths`, `gaps`, `coaching`, `next_steps`, `profile_updates`.

## Voice

### `POST /api/tts`

Request: `{ "text": "Question text", "voice": "female" }`. Returns MP3 audio. Existing Edge TTS behavior is unchanged.

### `POST /api/transcribe`

Mobile fallback for browsers without Web Speech recognition. Send raw audio bytes with an `audio/*` content type. Returns `{ "text": "..." }`. Uses server-side Groq Whisper and never exposes the key.

## Common errors

- `VALIDATION_ERROR` (400): missing or malformed input; not retryable.
- `INVALID_OPPORTUNITY` (404): unknown opportunity ID; not retryable.
- `MODEL_FAILURE` (502): Groq failure; retryable, preserve the submitted session state.
- `INTERVIEW_TIMEOUT` (504): model timeout; retryable, do not duplicate the turn.
- `TRANSCRIPTION_FAILURE` (502): transcription failure; retryable.
- `SERVER_ERROR` (500): unexpected backend failure; retryable.

## Mock mode

Set `INTERVIEW_MOCK_MODE=true` to avoid Groq calls during frontend development. Mock interview follow-ups vary with the candidate answer and all non-AI endpoints remain available.
