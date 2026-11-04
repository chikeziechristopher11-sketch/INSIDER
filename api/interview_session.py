"""Vercel function entrypoint for creating signed interview sessions."""

from fastapi import FastAPI

from api.interview import interview_session

app = FastAPI()
app.add_api_route("/api/interview_session", interview_session, methods=["POST"])
