import pytest
import os
import json
from backend.config import settings
from backend.database import init_db
from backend.services.vector_store import vector_store
from backend.services.investigation_service import investigation_service

@pytest.fixture(autouse=True)
def setup_env():
    init_db()
    doc_path = os.path.join(settings.DATA_DIR, "documents.json")
    with open(doc_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    vector_store.build_index(docs)

def test_investigation_trace_steps():
    resp = investigation_service.investigate("Why did Q4 revenue decline despite increased marketing spending?")
    assert resp.status == "completed"
    assert resp.investigation_id.startswith("INV-")
    assert resp.root_cause is not None
    assert len(resp.steps) >= 8
    
    action_types = [s.action_type for s in resp.steps]
    assert "QUERY_ANALYZED" in action_types
    assert "PLAN_CREATED" in action_types
    assert "SEARCH_EXECUTED" in action_types
    assert "EVIDENCE_SELECTED" in action_types
    assert "GRAPH_UPDATED" in action_types
    assert "REPORT_GENERATED" in action_types

def test_dynamic_graph_structure():
    resp = investigation_service.investigate("Why did cloud infrastructure costs increase by 32%?")
    assert resp.graph is not None
    assert len(resp.graph.nodes) >= 4
    assert len(resp.graph.edges) >= 3
    
    node_types = {n.type for n in resp.graph.nodes}
    assert "question" in node_types
    assert "document" in node_types or "finding" in node_types
