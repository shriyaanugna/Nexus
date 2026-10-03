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

from fastapi import UploadFile, File, Form
import json
import uuid
import datetime

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    department: str = Form(...),
    academic_year: str = Form(...)
) -> Dict[str, Any]:
    content = ""
    ext = file.filename.split(".")[-1].lower() if file.filename else ""
    
    file_bytes = await file.read()
    
    if ext == "json":
        try:
            data = json.loads(file_bytes)
            content = json.dumps(data, indent=2)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON file.")
    elif ext == "txt":
        content = file_bytes.decode("utf-8", errors="replace")
    elif ext == "docx":
        try:
            import docx
            import io
            doc = docx.Document(io.BytesIO(file_bytes))
            content = "\n".join([p.text for p in doc.paragraphs])
        except ImportError:
            raise HTTPException(status_code=501, detail="DOCX extraction requires python-docx.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {e}")
    elif ext == "pdf":
        raise HTTPException(status_code=501, detail="PDF extraction requires PyMuPDF or PyPDF2 which are not installed on the backend.")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    doc_id = f"DOC-{str(uuid.uuid4())[:8].upper()}"
    
    # Simple chunking (sentence level approximation)
    sentences = [s.strip() for s in content.replace("\n", ". ").split(". ") if len(s.strip()) > 10]
    
    new_doc = {
        "document_id": doc_id,
        "title": title,
        "department": department,
        "academic_year": academic_year,
        "filename": file.filename,
        "file_type": ext,
        "file_size_bytes": len(file_bytes),
        "summary": content[:200] + "..." if len(content) > 200 else content,
        "content": content,
        "chunk_count": len(sentences) or 1,
        "status": "Indexed & Searchable",
        "date": datetime.datetime.now().strftime("%Y-%m-%d"),
        "version": "1.0",
        "related_documents": [],
        "keywords": [],
        "entities": []
    }
    
    vector_store.add_document(new_doc)
    
    # Create Audit event using audit_service if available
    try:
        from ..services.audit_service import audit_service
        audit_service.log_event(
            action="DOCUMENT_INDEXED",
            description=f"Document '{title}' ({department}, {academic_year}) uploaded and indexed.",
            query=f"Filename: {file.filename}",
            findings_count=len(sentences) or 1
        )
    except Exception as e:
        print(f"Failed to log audit event: {e}")
        
    return {
        "status": "success",
        "document": new_doc
    }
