import pytest
import os
import json
from backend.config import settings
from backend.services.vector_store import vector_store

@pytest.fixture(autouse=True)
def init_store():
    doc_path = os.path.join(settings.DATA_DIR, "documents.json")
    with open(doc_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    vector_store.build_index(docs)

def test_document_count():
    assert len(vector_store.documents) >= 80

def test_semantic_search_revenue():
    results = vector_store.search("Q4 revenue decline marketing spend", top_k=5)
    assert len(results) > 0
    doc_ids = [r["document_id"] for r in results]
    assert "DOC-001" in doc_ids or "DOC-003" in doc_ids or "DOC-005" in doc_ids

def test_semantic_search_cloud():
    results = vector_store.search("cloud infrastructure costs 32% AWS compute", top_k=5)
    assert len(results) > 0
    doc_ids = [r["document_id"] for r in results]
    assert "DOC-002" in doc_ids or "DOC-006" in doc_ids or "DOC-009" in doc_ids

def test_department_filtering():
    results = vector_store.search("incident", top_k=5, department_filter="Engineering")
    for r in results:
        assert r["department"].lower() == "engineering"
