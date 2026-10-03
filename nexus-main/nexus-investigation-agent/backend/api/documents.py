from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from ..services.vector_store import vector_store

router = APIRouter()

@router.get("/documents")
def list_documents(
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    docs = vector_store.documents
    results = []
    for d in docs:
        if department and d.get("department", "").lower() != department.lower():
            continue
        if status and d.get("status", "").lower() != status.lower():
            continue
        if q:
            q_low = q.lower()
            if q_low not in d.get("title", "").lower() and q_low not in d.get("summary", "").lower() and q_low not in d.get("content", "").lower():
                continue
        results.append(d)
    return results

@router.get("/documents/{document_id}")
def get_document(document_id: str) -> Dict[str, Any]:
    doc = vector_store.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    return doc
