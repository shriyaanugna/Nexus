from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import List, Dict, Any, Optional
import json
import uuid
import datetime
from ..services.vector_store import vector_store

router = APIRouter()

@router.get("/documents")
def list_documents(
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    academic_year: Optional[str] = Query(None),
    criterion: Optional[str] = Query(None),
    doc_type: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    docs = vector_store.documents
    results = []
    for d in docs:
        if department and d.get("department", "").lower() != department.lower():
            continue
        if status and d.get("status", "").lower() != status.lower():
            continue
        if academic_year and d.get("academic_year", d.get("effective_date", "")[:4]) != academic_year:
            continue
        if criterion and criterion.lower() not in [c.lower() for c in d.get("criteria", [])]:
            continue
        if doc_type and d.get("type", "").lower() != doc_type.lower():
            continue
        if q:
            q_low = q.lower()
            if q_low not in d.get("title", "").lower() and q_low not in d.get("summary", "").lower() and q_low not in d.get("content", "").lower():
                continue

        # Enrich metadata for UI display if needed
        enriched = dict(d)
        if "academic_year" not in enriched:
            enriched["academic_year"] = d.get("effective_date", "2024-2025")[:4] if d.get("effective_date") else "2024-2025"
        if "criteria" not in enriched:
            enriched["criteria"] = ["Criterion 1: Mission & Integrity", "Criterion 3: Teaching & Learning"]
        results.append(enriched)
    return results

@router.get("/documents/{document_id}")
def get_document(document_id: str) -> Dict[str, Any]:
    doc = vector_store.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    enriched = dict(doc)
    if "academic_year" not in enriched:
        enriched["academic_year"] = "2024-2025"
    if "criteria" not in enriched:
        enriched["criteria"] = ["Criterion 1: Mission & Governance", "Criterion 3: Quality & Resources"]
    return enriched

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    department: Optional[str] = Form("Academic Affairs"),
    doc_type: Optional[str] = Form("Report"),
    academic_year: Optional[str] = Form("2024-2025"),
    criterion: Optional[str] = Form("Criterion 1: Governance")
):
    content_bytes = await file.read()
    try:
        content_text = content_bytes.decode("utf-8", errors="ignore")
    except Exception:
        content_text = f"Binary content uploaded for {file.filename}."

    doc_id = f"DOC-{uuid.uuid4().hex[:6].upper()}"
    new_doc = {
        "id": doc_id,
        "title": title or file.filename,
        "type": doc_type or "Uploaded Evidence",
        "department": department or "Institutional Accreditation",
        "author": "Uploaded File",
        "effective_date": datetime.date.today().isoformat(),
        "academic_year": academic_year,
        "criteria": [criterion] if criterion else ["Criterion 1: Mission & Governance"],
        "status": "APPROVED",
        "summary": content_text[:250] + "..." if len(content_text) > 250 else content_text,
        "content": content_text,
        "version": "1.0",
        "file_name": file.filename,
        "file_size": f"{round(len(content_bytes) / 1024, 1)} KB"
    }

    # Add to vector store in-memory index
    updated_docs = vector_store.documents + [new_doc]
    vector_store.build_index(updated_docs)

    return {
        "status": "success",
        "message": f"Document '{new_doc['title']}' uploaded and indexed into knowledge base successfully.",
        "document": new_doc
    }

@router.post("/documents/{document_id}/reindex")
def reindex_document(document_id: str):
    doc = vector_store.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

    # Re-run index build
    vector_store.build_index(vector_store.documents)
    return {
        "status": "success",
        "message": f"Document '{doc['title']}' ({document_id}) re-indexed into sentence vector store.",
        "indexed_chunks": len(doc.get("content", "").split("\n")) or 1
    }

@router.delete("/documents/{document_id}")
def delete_document(document_id: str):
    doc = vector_store.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

    remaining = [d for d in vector_store.documents if d.get("id") != document_id]
    vector_store.build_index(remaining)
    return {
        "status": "deleted",
        "message": f"Document {document_id} removed from evidence index."
    }
