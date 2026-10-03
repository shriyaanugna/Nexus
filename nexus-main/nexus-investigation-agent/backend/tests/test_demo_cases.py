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

def test_scenario_1_revenue_decline():
    resp = investigation_service.investigate("Why did Q4 revenue decline despite increased marketing spending?")
    assert resp.status == "completed"
    assert resp.root_cause is not None
    assert "reliability" in resp.root_cause.lower() or "renewals" in resp.root_cause.lower()
    doc_ids = [e.document_id for e in resp.evidence]
    assert "DOC-001" in doc_ids or "DOC-004" in doc_ids

def test_scenario_2_cloud_cost():
    resp = investigation_service.investigate("Why did cloud infrastructure costs increase by 32%?")
    assert resp.status == "completed"
    assert resp.root_cause is not None
    assert "shutdown" in resp.root_cause.lower() or "compute" in resp.root_cause.lower() or "staging" in resp.root_cause.lower()

def test_scenario_3_customer_churn():
    resp = investigation_service.investigate("Why did enterprise customer churn increase in Q3?")
    assert resp.status == "completed"
    assert resp.root_cause is not None
    assert "support" in resp.root_cause.lower() or "hiring" in resp.root_cause.lower()

def test_scenario_4_security_incident():
    resp = investigation_service.investigate("What caused the security incident on September 12?")
    assert resp.status == "completed"
    assert resp.root_cause is not None
    assert "mfa" in resp.root_cause.lower() or "credential" in resp.root_cause.lower()

def test_scenario_5_release_delay():
    resp = investigation_service.investigate("Why was the platform release delayed by three weeks?")
    assert resp.status == "completed"
    assert resp.root_cause is not None
    assert "scope" in resp.root_cause.lower() or "regression" in resp.root_cause.lower()

def test_scenario_unknown_no_evidence():
    resp = investigation_service.investigate("What caused the lunar manufacturing division to miss its target?")
    assert resp.status == "insufficient_evidence"
    assert resp.root_cause is None
    assert len(resp.unresolved_questions) > 0

def test_new_question_customer_satisfaction():
    resp = investigation_service.investigate("Why did customer satisfaction decrease during August?")
    assert resp.status == "completed"
    assert resp.root_cause is not None
    doc_ids = [e.document_id for e in resp.evidence]
    assert len(doc_ids) > 0
