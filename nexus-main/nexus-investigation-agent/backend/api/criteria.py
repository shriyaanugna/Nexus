from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from ..services.vector_store import vector_store

router = APIRouter()

ACCREDITATION_CRITERIA_DATA = [
    {
        "id": "CRIT-1",
        "code": "1.A",
        "title": "Mission & Ethical Governance",
        "description": "The institution's mission is clear, articulated publicly, and guides its operations and academic integrity.",
        "category": "Criterion 1: Mission",
        "status": "Verified",
        "coverage_percentage": 92,
        "evidence_count": 8,
        "gaps_count": 0,
        "required_documents": ["Board Charter", "Institutional Strategic Plan", "Ethics Code"],
        "linked_document_ids": ["DOC-001", "DOC-003", "DOC-006"]
    },
    {
        "id": "CRIT-2",
        "code": "2.B",
        "title": "Institutional Integrity & Compliance",
        "description": "The institution operates with integrity in financial, academic, and administrative functions.",
        "category": "Criterion 2: Integrity",
        "status": "Verified",
        "coverage_percentage": 88,
        "evidence_count": 6,
        "gaps_count": 1,
        "required_documents": ["Financial Audit Q4", "Compliance Disclosure", "Whistleblower Policy"],
        "linked_document_ids": ["DOC-002", "DOC-005"]
    },
    {
        "id": "CRIT-3",
        "code": "3.C",
        "title": "Teaching, Learning & Academic Quality",
        "description": "The institution provides high quality academic programs with rigorous learning assessment and evidence.",
        "category": "Criterion 3: Teaching & Quality",
        "status": "Needs Review",
        "coverage_percentage": 74,
        "evidence_count": 5,
        "gaps_count": 2,
        "required_documents": ["Faculty Review Report", "Curriculum Committee Minutes", "Student Learning Assessment"],
        "linked_document_ids": ["DOC-004", "DOC-008"]
    },
    {
        "id": "CRIT-4",
        "code": "4.D",
        "title": "Resources, Infrastructure & Cloud Spend",
        "description": "The institution maintains financial, technological, and physical resources adequate for future strategic goals.",
        "category": "Criterion 4: Resources",
        "status": "Evidence Gap",
        "coverage_percentage": 61,
        "evidence_count": 4,
        "gaps_count": 3,
        "required_documents": ["Cloud Infrastructure Budget", "IT Master Plan", "Marketing ROI Analysis"],
        "linked_document_ids": ["DOC-003", "DOC-007"]
    },
    {
        "id": "CRIT-5",
        "code": "5.E",
        "title": "Institutional Effectiveness & Continuous Improvement",
        "description": "The institution allocates resources to support continuous performance evaluation and evidence-based decision making.",
        "category": "Criterion 5: Effectiveness",
        "status": "Verified",
        "coverage_percentage": 85,
        "evidence_count": 7,
        "gaps_count": 1,
        "required_documents": ["Q4 Executive Summary", "Continuous Improvement Audit", "KPI Tracking"],
        "linked_document_ids": ["DOC-001", "DOC-002"]
    }
]

@router.get("/criteria")
def get_criteria(q: Optional[str] = Query(None)) -> List[Dict[str, Any]]:
    criteria = ACCREDITATION_CRITERIA_DATA
    if q:
        q_low = q.lower()
        criteria = [
            c for c in criteria
            if q_low in c["title"].lower() or q_low in c["code"].lower() or q_low in c["category"].lower() or q_low in c["description"].lower()
        ]
    return criteria

@router.get("/criteria/{criterion_id}")
def get_criterion_detail(criterion_id: str) -> Dict[str, Any]:
    found = next((c for c in ACCREDITATION_CRITERIA_DATA if c["id"].lower() == criterion_id.lower() or c["code"].lower() == criterion_id.lower()), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Criteria {criterion_id} not found")

    # Attach actual document records
    linked_docs = [d for d in vector_store.documents if d.get("id") in found["linked_document_ids"]]

    return {
        **found,
        "documents": linked_docs,
        "gaps": [
            {"id": "GAP-1", "severity": "MEDIUM", "description": f"Missing official signed approval document for academic year 2024-2025 regarding {found['title']}."},
            {"id": "GAP-2", "severity": "LOW", "description": "Citation audit indicates partial evidence overlap; requires annual re-verification."}
        ] if found["gaps_count"] > 0 else []
    }
