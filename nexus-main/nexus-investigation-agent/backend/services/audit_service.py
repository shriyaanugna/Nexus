import datetime
import uuid
from typing import Optional, Dict, Any
from ..database import log_audit

class AuditService:
    @staticmethod
    def record_action(
        investigation_id: str,
        action: str,
        query: Optional[str] = None,
        documents_searched: int = 0,
        evidence_selected: int = 0,
        followup_query: Optional[str] = None,
        contradictions_detected: int = 0,
        final_result: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        entry = {
            "log_id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "investigation_id": investigation_id,
            "action": action,
            "query": query,
            "documents_searched": documents_searched,
            "evidence_selected": evidence_selected,
            "followup_query": followup_query,
            "contradictions_detected": contradictions_detected,
            "final_result": final_result,
            "details": details or {}
        }
        log_audit(entry)
        return entry

audit_service = AuditService()
