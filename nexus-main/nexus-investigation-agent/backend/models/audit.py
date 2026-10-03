from typing import Optional, Dict, Any
from pydantic import BaseModel

class AuditLogEntry(BaseModel):
    log_id: str
    timestamp: str
    investigation_id: str
    action: str  # QUERY_ANALYZED, PLAN_CREATED, SEARCH_EXECUTED, EVIDENCE_SELECTED, GAP_DETECTED, FOLLOWUP_GENERATED, CONTRADICTION_DETECTED, GRAPH_UPDATED, ROOT_CAUSE_IDENTIFIED, REPORT_GENERATED
    query: Optional[str] = None
    documents_searched: int = 0
    evidence_selected: int = 0
    followup_query: Optional[str] = None
    contradictions_detected: int = 0
    final_result: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
