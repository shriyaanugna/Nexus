from typing import List, Optional
from ..models.evidence import KnowledgeGap, EvidenceItem

class FollowupGenerator:
    def generate_followup(
        self,
        gaps: List[KnowledgeGap],
        current_evidence: List[EvidenceItem],
        visited_queries: List[str]
    ) -> Optional[str]:
        if not gaps:
            return None

        unresolved = [g for g in gaps if not g.resolved]
        if not unresolved:
            return None

        # The gap description already contains the actual new question.
        query = unresolved[0].description
        if query in visited_queries:
            query = f"{query} primary source details"

        return query

followup_generator = FollowupGenerator()
