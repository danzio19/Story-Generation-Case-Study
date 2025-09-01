from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base

class Story(Base):
    """SQLAlchemy ORM model for a story."""
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    text = Column(Text, nullable=False)
    questions = Column(JSON) # will store a list of question/answer dicts
    llm_model = Column(String) # which model was used
    created_at = Column(DateTime(timezone=True), server_default=func.now())