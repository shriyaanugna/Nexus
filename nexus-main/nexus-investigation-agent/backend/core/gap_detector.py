from typing import List, Dict, Any, Tuple
from ..models.evidence import EvidenceItem, KnowledgeGap

class GapDetector:
    """
    Generic gap detection. It does not assume that a question belongs to one
    of the demo scenarios. A new question is judged from the evidence actually
    retrieved for that question.
    """

    def detect_gaps(
        self,
        question: str,
        current_evidence: List[EvidenceItem],
        analysis: Dict[str, Any]
    ) -> Tuple[List[str], List[str], List[KnowledgeGap]]:

        established = [
            f"{ev.title} [{ev.document_id}] ({ev.department})"
            for ev in current_evidence
        ]
        still_needed: List[str] = []
        gaps: List[KnowledgeGap] = []

        strong = [
            e for e in current_evidence
            if e.relevance >= 0.18
        ]
        departments = {e.department for e in strong}

        if not strong:
            still_needed.append(
                f"Find primary records directly addressing: {question}"
            )
            gaps.append(KnowledgeGap(
                gap_id="GAP-SEARCH-1",
                description=f"Retrieve evidence directly relevant to: {question}",
                required_evidence_type="Primary Record"
            ))
            return established, still_needed, gaps

        if len(strong) < 2:
            still_needed.append(
                "Retrieve an independent corroborating record for the strongest finding"
            )
            gaps.append(KnowledgeGap(
                gap_id="GAP-CORROBORATION-1",
                description=f"Find corroborating evidence for: {question}",
                required_evidence_type="Corroborating Evidence"
            ))

        if len(departments) == 1 and len(strong) >= 2:
            still_needed.append(
                "Check another relevant departmental source for independent corroboration"
            )
            gaps.append(KnowledgeGap(
                gap_id="GAP-CROSS-SILO-1",
                description=f"Find an independent cross-functional source for: {question}",
                required_evidence_type="Cross-Department Record"
            ))

        if not any(e.evidence_type == "Direct Evidence" for e in strong):
            still_needed.append("Locate a direct primary record supporting the finding")
            gaps.append(KnowledgeGap(
                gap_id="GAP-DIRECT-1",
                description=f"Find a primary record that directly answers: {question}",
                required_evidence_type="Direct Evidence"
            ))

        return established, still_needed, gaps

gap_detector = GapDetector()
