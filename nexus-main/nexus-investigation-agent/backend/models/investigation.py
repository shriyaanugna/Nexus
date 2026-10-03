from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .evidence import EvidenceItem, KnowledgeGap, CausalLink
from .contradiction import ContradictionItem

class InvestigationStep(BaseModel):
    step_number: int
    action_type: str
    description: str
    query: Optional[str] = None
    status: str = "completed"  # in_progress, completed, warning
    findings_count: int = 0
    timestamp: str

class GraphNode(BaseModel):
    id: str
    type: str  # question, finding, document, entity, event, root_cause
    label: str
    data: Dict[str, Any] = Field(default_factory=dict)
    position: Optional[Dict[str, float]] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str  # supports, explains, caused_by, contributes_to, contradicts, follows, related_to, corroborates, supersedes
    strength: float = 1.0

class EvidenceGraph(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)

class InvestigationRequest(BaseModel):
    question: str

class InvestigationResponse(BaseModel):
    investigation_id: str
    status: str  # completed, insufficient_evidence, running
    question: str
    mode: str = "Local Evidence Mode"
    answer: str
    root_cause: Optional[str] = None
    confidence: float
    confidence_level: str  # HIGH, MEDIUM, LOW
    investigation_depth: int
    steps: List[InvestigationStep] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    established_knowledge: List[str] = Field(default_factory=list)
    still_needed_knowledge: List[str] = Field(default_factory=list)
    causal_chain: List[CausalLink] = Field(default_factory=list)
    contradictions: List[ContradictionItem] = Field(default_factory=list)
    unresolved_questions: List[str] = Field(default_factory=list)
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    graph: EvidenceGraph = Field(default_factory=EvidenceGraph)
    report_markdown: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
