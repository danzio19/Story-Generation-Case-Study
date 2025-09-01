from fastapi import FastAPI
from .routers import stories

app = FastAPI(
    title="LLM Story Generation Platform",
    description="Backend API for creating and retrieving AI-generated stories.",
    version="1.0.0",
)

app.include_router(stories.router)

@app.get("/")
def read_root():
    """Root endpoint for the API."""
    return {"message": "Welcome to the Story Generation API!"}