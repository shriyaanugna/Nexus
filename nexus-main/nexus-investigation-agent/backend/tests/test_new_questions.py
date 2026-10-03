import json
import os
import pytest
from backend.config import settings
from backend.services.vector_store import vector_store
from backend.services.investigation_service import investigation_service

@pytest.fixture(autouse=True)
def setup_env():
    with open(os.path.join(settings.DATA_DIR, "documents.json"), "r", encoding="utf-8") as f:
        vector_store.build_index(json.load(f))


def test_new_metric_question_is_evidence_grounded():
    r = investigation_service.investigate("What is the total cloud infrastructure spend in August?")
    assert r.status == "completed"
    assert "$1.85M" in r.answer or "$1,852,400" in r.answer
    assert any(e.document_id == "DOC-002" for e in r.evidence)


def test_new_author_question_uses_metadata():
    r = investigation_service.investigate("Who authored the Q4 financial close report?")
    assert r.status == "completed"
    assert "Marcus Vance" in r.answer
    assert any(e.document_id == "DOC-001" for e in r.evidence)


def test_new_event_date_question_uses_event_registry():
    r = investigation_service.investigate("What happened on July 1?")
    assert r.status == "completed"
    assert "2026-07-01" in r.answer
    assert "4.2M" in r.answer
    assert any(e.document_id == "EVT-001" for e in r.evidence)


def test_unknown_topic_stays_insufficient():
    r = investigation_service.investigate("What caused the lunar manufacturing division to miss its target?")
    assert r.status == "insufficient_evidence"
    assert r.root_cause is None

def test_latest_question_prefers_current_record():
    r = investigation_service.investigate("What is the latest Q4 revenue?")
    assert r.status == "completed"
    assert "DOC-021" in r.answer or "DOC-001" in r.answer
    assert any(e.document_id == "DOC-021" for e in r.evidence)
