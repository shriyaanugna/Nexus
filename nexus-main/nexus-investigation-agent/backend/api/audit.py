from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from ..database import list_all_audits

router = APIRouter()

@router.get("/audit")
def get_audit_trail(
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    audits = list_all_audits(limit=limit)
    if action and action != "All":
        return [a for a in audits if a.get("action") == action]
    return audits
