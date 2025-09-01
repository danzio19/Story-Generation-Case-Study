# app/routers/stories.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, models, schemas
from ..database import SessionLocal, engine
from ..services import llm_service

models.Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/stories",
    tags=["Stories"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.Story])
def read_stories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all stories."""
    stories = crud.get_stories(db, skip=skip, limit=limit)
    return stories

@router.get("/{story_id}", response_model=schemas.Story)
def read_story(story_id: int, db: Session = Depends(get_db)):
    """Retrieve a single story by ID."""
    db_story = crud.get_story(db, story_id=story_id)
    if db_story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    return db_story

@router.post("/", response_model=schemas.Story, status_code=status.HTTP_201_CREATED)
def create_story_from_topic(topic: schemas.StoryTopic, db: Session = Depends(get_db)):
    """
    Generates a new story based on a topic, saves it to the database,
    and returns the created story.
    """
    try:
        # generate story
        story_data = llm_service.generate_story_from_topic(topic.topic)

        # save to db
        new_story = crud.create_story(db=db, story=story_data)
        return new_story
        
    except Exception as e:
        
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to generate story from LLM: {str(e)}"
        )