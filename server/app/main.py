from fastapi import FastAPI
from .routers import stories
from fastapi.middleware.cors import CORSMiddleware 
from .routers import streaming 

app = FastAPI(
    title="LLM Story Generation Platform",
    description="Backend API for creating and retrieving AI-generated stories.",
    version="1.0.0",
)

# CORS settings,
# for development only
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stories.router)
app.include_router(streaming.router)

@app.get("/")
def read_root():
    """Root endpoint for the API."""
    return {"message": "Welcome to the Story Generation API!"}