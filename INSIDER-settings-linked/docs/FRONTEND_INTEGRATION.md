# Frontend Integration

The frontend only calls Insider API routes. It never imports Groq, reads API keys, or sends provider requests directly.

```js
async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw data.error || { message: 'Request failed', retryable: false };
  return data;
}
```

## Landing -> Profile onboarding

Call `POST /api/profile/intake` after each answer. Start with an empty profile and answers array. Render `next_question.text`; stop when `status` is `complete`.

```js
const data = await api('/api/profile/intake', {
  method: 'POST',
  body: JSON.stringify({ profile, answers, current_section: 'discovery', question_history })
});
```

Loading: show one question at a time. Error: show `error.message` and keep the current answer.

## CV profile path

After the frontend extracts CV text, call `POST /api/profile/cv`.

```js
const data = await api('/api/profile/cv', {
  method: 'POST',
  body: JSON.stringify({ cv_text, candidate_data })
});
```

Display `profile`, then ask from `follow_up_questions` and show `missing_information`.

## No-CV path and profile generation

Use the same intake endpoint. When complete, call `POST /api/profile/generate`:

```js
const data = await api('/api/profile/generate', {
  method: 'POST',
  body: JSON.stringify({ candidate_data, evidence })
});
```

Display `summary`, `profile`, and evidence. Never display unverified claims as facts.

## My Profile

Render the returned `profile`, `evidence`, and `gaps`. A frontend approval action can save `profile_updates` returned later by the debrief.

## Opportunity

```js
const opportunities = await api('/api/opportunities');
const opportunity = await api(`/api/opportunities/${id}`);
```

Render company, role, requirements, competencies, context, and sources. Research is an explicit separate action:

```js
const result = await api('/api/opportunities/research', {
  method: 'POST',
  body: JSON.stringify({ company, role, requirements, competencies, company_context, sources })
});
```

## Readiness

```js
const readiness = await api('/api/readiness', {
  method: 'POST',
  body: JSON.stringify({ profile, opportunity })
});
```

Render `demonstrated`, `partial`, `missing`, `interview_focus`, and `recommended_actions`.

## Interview

Use one request per turn. Keep history and session state in frontend session memory.

```js
const data = await api('/api/interview', {
  method: 'POST',
  body: JSON.stringify({ candidate, role, history, session_state })
});
if (data.status === 'continue') {
  renderQuestion(data.question);
  history.push({ role: 'assistant', content: data.question });
  session_state = data.session_state;
}
```

After the candidate answers:

```js
history.push({ role: 'user', content: answer });
const next = await api('/api/interview', {
  method: 'POST',
  body: JSON.stringify({ candidate, role, history, session_state })
});
```

Speak `next.question` using the existing TTS layer. If `status === 'complete'`, render `next.debrief` and do not ask another question. On a retryable error, resend the same payload once; do not append a duplicate turn.

## Voice

Existing TTS:

```js
const audio = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: question, voice: 'female' })
});
```

For mobile browsers without Web Speech recognition, record audio and send the bytes to `POST /api/transcribe` with `Content-Type: audio/webm` or `audio/mp4`.

## Debrief

```js
const debrief = await api('/api/interview/debrief', {
  method: 'POST',
  body: JSON.stringify({ candidate, role, history, session_state })
});
```

Render strengths, gaps, coaching, next steps, and candidate-approved profile updates.

## Health and loading

Call `GET /api/health` on app startup. Show a non-blocking service warning if Groq is `missing`; profile and mock flows can still work. Every request needs a loading state, timeout handling, and a retry action for `retryable: true` errors.
