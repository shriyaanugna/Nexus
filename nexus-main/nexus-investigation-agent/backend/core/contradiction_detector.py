import os
import json
from typing import List, Dict, Any
from ..models.evidence import EvidenceItem
from ..models.contradiction import ContradictionItem
from ..config import settings

class ContradictionDetector:
    def __init__(self):
        self.relationships_data: List[Dict[str, Any]] = []
        self._load_relationships()

    def _load_relationships(self):
        path = os.path.join(settings.DATA_DIR, "relationships.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                self.relationships_data = json.load(f)

    def detect_contradictions(self, evidence: List[EvidenceItem]) -> List[ContradictionItem]:
        contradictions: List[ContradictionItem] = []
        doc_map = {e.document_id: e for e in evidence}
        
        # 1. Check explicit supersedes / status contradiction in retrieved evidence
        for ev in evidence:
            if ev.status == "superseded":
                # Look for superseding document in evidence or dataset
                for other in evidence:
                    if other.document_id != ev.document_id and (other.status == "active" or other.version > ev.version):
                        if ("revenue" in ev.title.lower() and "revenue" in other.title.lower()) or \
                           ("support" in ev.title.lower() and "support" in other.title.lower()):
                            cid = f"CONTRAD-{ev.document_id}-{other.document_id}"
                            if not any(c.contradiction_id == cid for c in contradictions):
                                contradictions.append(ContradictionItem(
                                    contradiction_id=cid,
                                    claim_a=f"{ev.title}: '{ev.excerpt[:120]}...'",
                                    source_a_id=ev.document_id,
                                    source_a_title=ev.title,
                                    source_a_date=ev.date,
                                    source_a_status=ev.status,
                                    source_a_version=ev.version,
                                    claim_b=f"{other.title}: '{other.excerpt[:120]}...'",
                                    source_b_id=other.document_id,
                                    source_b_title=other.title,
                                    source_b_date=other.date,
                                    source_b_status=other.status,
                                    source_b_version=other.version,
                                    resolution_basis=(
                                        f"Source {ev.document_id} is marked status '{ev.status}' (v{ev.version}, dated {ev.date}). "
                                        f"Source {other.document_id} is the verified '{other.status}' record (v{other.version}, dated {other.date}). "
                                        f"Under enterprise governance rules, verified active reports supersede outdated forecasts and draft estimates."
                                    ),
                                    resolved_source_id=other.document_id,
                                    confidence_impact=-0.03
                                ))

        # 2. Check relationship graph contradictions
        for rel in self.relationships_data:
            if rel.get("relationship") in ["contradicts", "supersedes"]:
                src = rel["source"]
                tgt = rel["target"]
                if src in doc_map and tgt in doc_map:
                    cid = f"REL-CONTRAD-{src}-{tgt}"
                    if not any(c.contradiction_id == cid for c in contradictions):
                        ev_src = doc_map[src]
                        ev_tgt = doc_map[tgt]
                        resolved_id = ev_src.document_id if ev_src.status == "active" else ev_tgt.document_id
                        contradictions.append(ContradictionItem(
                            contradiction_id=cid,
                            claim_a=f"{ev_src.title} ({ev_src.document_id})",
                            source_a_id=ev_src.document_id,
                            source_a_title=ev_src.title,
                            source_a_date=ev_src.date,
                            source_a_status=ev_src.status,
                            source_a_version=ev_src.version,
                            claim_b=f"{ev_tgt.title} ({ev_tgt.document_id})",
                            source_b_id=ev_tgt.document_id,
                            source_b_title=ev_tgt.title,
                            source_b_date=ev_tgt.date,
                            source_b_status=ev_tgt.status,
                            source_b_version=ev_tgt.version,
                            resolution_basis=f"Reconciled via '{rel['relationship']}' relationship. Active operational records take evidentiary precedence.",
                            resolved_source_id=resolved_id,
                            confidence_impact=-0.04
                        ))
                        
        return contradictions

contradiction_detector = ContradictionDetector()
