from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EvidenceItem(BaseModel):
    document_id: str
    title: str
    department: str
    date: str
    document_type: str
    source: str
    relevance: float
    strength: float
    evidence_type: str  # Direct Evidence, Supporting Evidence, Corroborating Evidence, Contradictory Evidence
    source_reliability: float
    summary: str = ""
    excerpt: str
    supports: List[str] = Field(default_factory=list)
    contradicts: List[str] = Field(default_factory=list)
    new_information: List[str] = Field(default_factory=list)
    entities: List[str] = Field(default_factory=list)
    related_documents: List[str] = Field(default_factory=list)
    version: str = "1.0"
    status: str = "active"
    author: str = ""

class KnowledgeGap(BaseModel):
    gap_id: str
    description: str
    required_evidence_type: str
    target_entity: Optional[str] = None
    resolved: bool = False
    resolved_by_doc_id: Optional[str] = None

class CausalLink(BaseModel):
    step_order: int
    cause: str
    effect: str
    supporting_doc_ids: List[str] = Field(default_factory=list)
    confidence: float = 0.90
