from typing import List
from ..models.evidence import EvidenceItem, CausalLink

class CausalChainBuilder:
    """Construct a generic, evidence-grounded chain for any question."""

    def build_chain(self, question: str, evidence: List[EvidenceItem]) -> List[CausalLink]:
        links: List[CausalLink] = []
        ranked = sorted(
            evidence,
            key=lambda e: (e.strength, e.relevance),
            reverse=True
        )

        for idx, ev in enumerate(ranked[:5]):
            links.append(CausalLink(
                step_order=idx + 1,
                cause=f"{ev.title} ({ev.department})",
                effect=ev.summary or ev.excerpt or ev.title,
                supporting_doc_ids=[ev.document_id]
            ))
        return links

causal_chain_builder = CausalChainBuilder()
