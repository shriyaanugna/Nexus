from typing import Optional
from pydantic import BaseModel

class ContradictionItem(BaseModel):
    contradiction_id: str
    claim_a: str
    source_a_id: str
    source_a_title: str
    source_a_date: str
    source_a_status: str
    source_a_version: str
    
    claim_b: str
    source_b_id: str
    source_b_title: str
    source_b_date: str
    source_b_status: str
    source_b_version: str
    
    resolution_basis: str
    resolved_source_id: str
    confidence_impact: float = -0.05
