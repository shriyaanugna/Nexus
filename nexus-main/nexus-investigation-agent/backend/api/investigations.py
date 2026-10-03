from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..database import list_all_investigations, get_investigation_by_id

router = APIRouter()

@router.get("/investigations")
def get_investigations() -> List[Dict[str, Any]]:
    return list_all_investigations()

@router.get("/investigations/{investigation_id}")
def get_investigation(investigation_id: str) -> Dict[str, Any]:
    data = get_investigation_by_id(investigation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return data

@router.get("/investigations/{investigation_id}/steps")
def get_steps(investigation_id: str) -> List[Dict[str, Any]]:
    data = get_investigation_by_id(investigation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return data.get("steps", [])

@router.get("/investigations/{investigation_id}/evidence")
def get_evidence(investigation_id: str) -> List[Dict[str, Any]]:
    data = get_investigation_by_id(investigation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return data.get("evidence", [])

@router.get("/investigations/{investigation_id}/graph")
def get_graph(investigation_id: str) -> Dict[str, Any]:
    data = get_investigation_by_id(investigation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return data.get("graph", {"nodes": [], "edges": []})

@router.get("/investigations/{investigation_id}/report")
def get_report(investigation_id: str) -> Dict[str, Any]:
    data = get_investigation_by_id(investigation_id)
    if not data:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return {
        "investigation_id": investigation_id,
        "question": data.get("question"),
        "report_markdown": data.get("report_markdown", "")
    }
