from sqlalchemy.orm import Session
from . import models, schemas

def get_story(db: Session, story_id: int):
    """Retrieve a single story by its ID."""
    return db.query(models.Story).filter(models.Story.id == story_id).first()

def get_stories(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve a list of stories with pagination."""
    return db.query(models.Story).offset(skip).limit(limit).all()

def create_story(db: Session, story: schemas.StoryCreate):
    """Create a new story record in the database."""
    db_story = models.Story(**story.model_dump())
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story