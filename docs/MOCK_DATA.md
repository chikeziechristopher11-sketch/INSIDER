# Mock Data

These examples are safe to use in frontend development with `INTERVIEW_MOCK_MODE=true`.

## Candidate

```json
{"name":"Amina Okafor","field":"operations","summary":"Early-career operations professional","skills":["process mapping","communication"],"goals":["operations lead"]}
```

## Profile

```json
{"name":"Amina Okafor","field":"operations","goals":["operations lead"],"skills":["process mapping"],"evidence":[{"claim":"Reduced manual work in a volunteer program","type":"evidence","source":"candidate"}]}
```

## CV profile path

```json
{"cv_text":"Coordinated a volunteer program and reduced manual reporting.","candidate_data":{"name":"Amina Okafor","field":"operations"}}
```

## Opportunity

```json
{"id":"general-professional-growth","company":"Example Employer","role":"Professional contributor","requirements":["Ownership","Problem solving","Communication","Adaptability"],"competencies":["ownership","problem_solving","communication","adaptability"],"company_context":[],"sources":[]}
```

## Readiness request

```json
{"profile":{"field":"operations","evidence":[{"claim":"Reduced manual reporting","type":"evidence"}]},"opportunity":{"competencies":["ownership","problem_solving","communication"]}}
```

## Interview session

```json
{"status":"active","current_competency":"ownership","competencies_assessed":[],"evidence_found":[],"claims_to_verify":[],"weak_areas":[],"questions_asked":[],"answers":[],"progress":0.0}
```

## Interview opening request

```json
{"candidate":{"name":"Amina Okafor","field":"operations"},"role":{"company":"Example Employer","title":"Operations Lead","competencies":["ownership","problem_solving","communication"]},"history":[],"session_state":{}}
```

## Interview response

```json
{"status":"continue","question":"Tell me about a time you improved a process.","competency":"ownership","question_type":"opening","evaluation":{},"session_state":{"status":"active","competencies_assessed":[],"evidence_discovered":[],"claims_needing_follow_up":[],"weak_areas":[],"questions_asked":[],"candidate_answers":[],"progress":0.0,"interview_complete":false}}
```

## Candidate answer request

```json
{"candidate":{"name":"Amina Okafor","field":"operations"},"role":{"company":"Example Employer","title":"Operations Lead","competencies":["ownership","problem_solving","communication"]},"history":[{"role":"assistant","content":"Tell me about a time you improved a process."},{"role":"user","content":"I mapped a volunteer signup process, removed duplicate steps, and reduced completion time."}],"session_state":{"status":"active","current_competency":"ownership"}}
```

## Completed interview

```json
{"status":"complete","debrief":{"overall_summary":"The candidate showed ownership through a concrete process improvement.","strengths":["Ownership"],"weaknesses":["Outcome measurement"],"evidence_discovered":[],"competency_assessments":[],"specific_coaching":[],"practice_next":[]},"session_state":{"status":"complete","progress":1.0,"interview_complete":true}}
```

## Debrief

```json
{"competencies":["ownership"],"evidence":[{"competency":"ownership","evidence":"Mapped the signup process and removed duplicate steps."}],"strengths":["Concrete ownership"],"gaps":["Needs a measurable outcome"],"coaching":["Separate your action from the result and quantify the change."],"next_steps":["Practice one story per competency."],"profile_updates":[]}
```
