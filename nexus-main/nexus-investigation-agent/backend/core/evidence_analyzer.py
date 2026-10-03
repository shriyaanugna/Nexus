import os
import json
from typing import Dict, Any, List
import re
from ..models.evidence import EvidenceItem
from ..config import settings

class EvidenceAnalyzer:
    def __init__(self):
        self.sources_map: Dict[str, float] = {}
        self._load_sources()

    def _load_sources(self):
        path = os.path.join(settings.DATA_DIR, "sources.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for s in data:
                    self.sources_map[s["name"]] = s.get("reliability_level", 0.85)

    def analyze_document(self, doc: Dict[str, Any], query: str, rank_index: int = 0) -> EvidenceItem:
        score = doc.get("score", 0.75)
        source_name = doc.get("source", "")
        source_rel = self.sources_map.get(source_name, 0.85)
        
        # Calculate evidence strength
        strength = round(min(0.98, max(0.40, (score * 0.55) + (source_rel * 0.45))), 2)
        
        # Determine evidence type
        status = doc.get("status", "active")
        if status == "superseded":
            ev_type = "Contradictory Evidence"
        elif rank_index == 0 or score > 0.70:
            ev_type = "Direct Evidence"
        elif rank_index <= 2 or score > 0.50:
            ev_type = "Supporting Evidence"
        else:
            ev_type = "Corroborating Evidence"

        # Query-focused excerpt: use the full document to select the sentence
        # that actually addresses the user's question. This prevents a generic
        # summary sentence from winning over a precise fact buried in the record.
        summary = doc.get("summary", "")
        content = doc.get("content", "")
        sentences = [x.strip() for x in re.split(r"(?<=[.!?])\s+", content) if len(x.strip()) > 15]
        q_tokens = {t for t in re.findall(r"[a-zA-Z0-9_-]+", query.lower()) if len(t) > 2}
        def sentence_score(text):
            toks = {t for t in re.findall(r"[a-zA-Z0-9_-]+", text.lower()) if len(t) > 2}
            overlap = len(q_tokens & toks) / max(1, len(q_tokens))
            phrase = 0.12 if any(
                " ".join(list(q_tokens)[:2]) in text.lower() for _ in [0]
            ) and len(q_tokens) >= 2 else 0.0
            return overlap + phrase
        best_sentence = max(sentences, key=sentence_score) if sentences else ""
        excerpt = best_sentence or summary or content[:240] + "..."

        # Extracted facts
        supports = [doc.get("title", "")]
        new_info = [doc.get("summary", "")]

        return EvidenceItem(
            document_id=doc["document_id"],
            title=doc["title"],
            department=doc["department"],
            date=doc["date"],
            document_type=doc.get("document_type", "Report"),
            source=source_name,
            author=doc.get("author", ""),
            relevance=round(float(score), 2),
            strength=strength,
            evidence_type=ev_type,
            source_reliability=source_rel,
            summary=summary if summary else excerpt,
            excerpt=excerpt,
            supports=supports,
            contradicts=[doc["supersedes"]] if doc.get("supersedes") else [],
            new_information=new_info,
            entities=doc.get("entities", []),
            related_documents=doc.get("related_documents", []),
            version=doc.get("version", "1.0"),
            status=status
        )

evidence_analyzer = EvidenceAnalyzer()
