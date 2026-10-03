from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class Document(BaseModel):
    document_id: str
    title: str
    department: str
    date: str
    document_type: str
    source: str
    author: str
    summary: str
    content: str
    entities: List[str] = Field(default_factory=list)
    related_documents: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    version: str = "1.0"
    effective_date: str
    status: str = "active"  # "active" or "superseded"
    supersedes: Optional[str] = None

class Entity(BaseModel):
    entity_id: str
    name: str
    type: str
    aliases: List[str] = Field(default_factory=list)

class Event(BaseModel):
    event_id: str
    date: str
    title: str
    department: str
    description: str
    entities: List[str] = Field(default_factory=list)
    documents: List[str] = Field(default_factory=list)

class Source(BaseModel):
    source_id: str
    name: str
    department: str
    type: str
    reliability_level: float

class Relationship(BaseModel):
    relationship_id: str
    source: str
    target: str
    relationship: str
    strength: float
