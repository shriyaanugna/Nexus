import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db, list_all_investigations
from .services.vector_store import vector_store
from .services.investigation_service import investigation_service

from .api.research import router as research_router
from .api.investigations import router as investigations_router
from .api.documents import router as documents_router
from .api.evidence import router as evidence_router
from .api.audit import router as audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite
    init_db()
    
    # 2. Load dataset documents
    doc_path = os.path.join(settings.DATA_DIR, "documents.json")
    if os.path.exists(doc_path):
        with open(doc_path, "r", encoding="utf-8") as f:
            docs = json.load(f)
            vector_store.build_index(docs)
            print(f"[NEXUS] Loaded and indexed {len(docs)} enterprise documents.")
            
    # 3. If no past investigations exist in database, seed a demo investigation
    existing = list_all_investigations()
    if not existing:
        print("[NEXUS] Seeding initial baseline investigation...")
        try:
            investigation_service.investigate("Why did Q4 revenue decline despite increased marketing spending?")
            print("[NEXUS] Baseline investigation INV-001 seeded successfully.")
        except Exception as e:
            print(f"[NEXUS] Warning during seed: {e}")
            
    yield
    print("[NEXUS] Shutdown complete.")

app = FastAPI(
    title=settings.APP_NAME,
    description=f"{settings.APP_SUBTITLE} — {settings.TAGLINE}",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount API routers
app.include_router(research_router, prefix="/api", tags=["Research & Health"])
app.include_router(investigations_router, prefix="/api", tags=["Investigations"])
app.include_router(documents_router, prefix="/api", tags=["Documents"])
app.include_router(evidence_router, prefix="/api", tags=["Evidence"])
app.include_router(audit_router, prefix="/api", tags=["Audit Trail"])

@app.get("/")
def root():
    return {
        "system": settings.APP_NAME,
        "subtitle": settings.APP_SUBTITLE,
        "tagline": settings.TAGLINE,
        "status": "operational",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
