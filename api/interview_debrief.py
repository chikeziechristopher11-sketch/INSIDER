"""Vercel function entrypoint for strict AI interview debriefs."""

from fastapi import FastAPI

from api.interview import interview_debrief

app = FastAPI()
app.add_api_route("/api/interview_debrief", interview_debrief, methods=["POST"])
