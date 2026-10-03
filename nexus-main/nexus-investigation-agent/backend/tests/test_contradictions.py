import pytest
import os
import json
from backend.config import settings
from backend.services.vector_store import vector_store
from backend.core.evidence_analyzer import evidence_analyzer
from backend.core.contradiction_detector import contradiction_detector

@pytest.fixture(autouse=True)
def init_store():
    doc_path = os.path.join(settings.DATA_DIR, "documents.json")
    with open(doc_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    vector_store.build_index(docs)

def test_detect_superseded_contradiction():
    doc20 = vector_store.get_document("DOC-020")
    doc21 = vector_store.get_document("DOC-021")
    
    assert doc20 is not None
    assert doc21 is not None
    assert doc20["status"] == "superseded"
    assert doc21["status"] == "active"
    
    ev20 = evidence_analyzer.analyze_document(doc20, "Q4 revenue")
    ev21 = evidence_analyzer.analyze_document(doc21, "Q4 revenue")
    
    contradictions = contradiction_detector.detect_contradictions([ev20, ev21])
    assert len(contradictions) >= 1
    c = contradictions[0]
    assert c.source_a_id == "DOC-020" or c.source_b_id == "DOC-020"
    assert "supersedes" in c.resolution_basis.lower() or "active" in c.resolution_basis.lower()
