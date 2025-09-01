from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

# shared properties for a story
class StoryBase(BaseModel):
    title: str
    text: str
    questions: List[Dict[str, Any]]
    llm_model: str

# receive via API on creation
class StoryCreate(StoryBase):
    pass

# returning to client
class Story(StoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# from user request
class StoryTopic(BaseModel):
    topic: str