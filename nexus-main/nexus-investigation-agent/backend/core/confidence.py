from typing import List, Tuple
from ..models.evidence import EvidenceItem
from ..models.contradiction import ContradictionItem

class ConfidenceCalculator:
    def calculate(
        self,
        evidence: List[EvidenceItem],
        contradictions: List[ContradictionItem],
        has_root_cause: bool
    ) -> Tuple[float, str]:
        
        if not has_root_cause or not evidence:
            return 0.15, "LOW"
            
        # Base confidence from evidence count and relevance
        scores = [e.relevance for e in evidence]
        avg_rel = sum(scores) / len(scores) if scores else 0.5
        
        # Source reliability
        reliabilities = [e.source_reliability for e in evidence]
        avg_rel_src = sum(reliabilities) / len(reliabilities) if reliabilities else 0.8
        
        # Independent departments
        depts = {e.department for e in evidence}
        dept_bonus = min(0.12, len(depts) * 0.03)
        
        # Base formula
        raw_conf = (avg_rel * 0.40) + (avg_rel_src * 0.45) + dept_bonus
        
        # Penalty for unresolved contradictions
        for c in contradictions:
            raw_conf += c.confidence_impact
            
        conf = round(min(0.96, max(0.20, raw_conf)), 2)
        
        level = "HIGH" if conf >= 0.85 else ("MEDIUM" if conf >= 0.65 else "LOW")
        return conf, level

confidence_calculator = ConfidenceCalculator()
