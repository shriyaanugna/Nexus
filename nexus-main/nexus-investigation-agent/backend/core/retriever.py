from typing import List, Dict, Any, Optional
import json, os, re
from ..services.vector_store import vector_store
from ..config import settings

class Retriever:
    def __init__(self):
        self.events: List[Dict[str, Any]] = []
        path = os.path.join(settings.DATA_DIR, "events.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                self.events = json.load(f)

    def retrieve(self, query: str, top_k: int = 10,
                 department: Optional[str] = None) -> List[Dict[str, Any]]:
        return vector_store.search(query, top_k=top_k, department_filter=department)

    def retrieve_many(self, queries: List[str], top_k_each: int = 8,
                      department: Optional[str] = None) -> List[Dict[str, Any]]:
        merged: Dict[str, Dict[str, Any]] = {}
        for q in queries:
            if not q or not q.strip():
                continue
            for doc in self.retrieve(q, top_k=top_k_each, department=department):
                existing = merged.get(doc["document_id"])
                if existing is None or doc.get("score", 0) > existing.get("score", 0):
                    merged[doc["document_id"]] = doc
        return sorted(merged.values(), key=lambda d: d.get("score", 0), reverse=True)

    @staticmethod
    def _tokens(text: str) -> set:
        return {t for t in re.findall(r"[a-zA-Z0-9_-]+", (text or "").lower()) if len(t) > 2}

    def retrieve_events(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        q = self._tokens(query)
        results = []
        for event in self.events:
            hay = " ".join([
                event.get("title", ""), event.get("description", ""),
                event.get("department", ""), event.get("date", ""),
                " ".join(event.get("entities", [])), " ".join(event.get("documents", []))
            ])
            d = self._tokens(hay)
            overlap = len(q & d) / max(1, len(q))
            # Dates are decisive for event questions.
            date_bonus = 0.0
            exact_date = re.search(r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b", query.lower())
            if exact_date:
                months = {m:i for i,m in enumerate(['january','february','march','april','may','june','july','august','september','october','november','december'],1)}
                target = f"2026-{months[exact_date.group(1)]:02d}-{int(exact_date.group(2)):02d}"
                date_bonus = 0.85 if event.get("date") == target else -0.08
            else:
                date_tokens = set(re.findall(r"\d{4}-\d{2}-\d{2}|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b", query.lower()))
                date_bonus = 0.35 if any(dt in hay.lower() for dt in date_tokens) else 0.0
            title_overlap = len(q & self._tokens(event.get("title", ""))) / max(1, len(q))
            score = min(1.0, max(0.0, overlap * 0.55 + title_overlap * 0.25 + date_bonus))
            if score >= 0.18:
                results.append({
                    "document_id": event["event_id"],
                    "title": event.get("title", "Enterprise Event"),
                    "department": event.get("department", "General"),
                    "date": event.get("date", ""),
                    "document_type": "Event Record",
                    "source": "Enterprise Event Registry",
                    "author": "",
                    "summary": event.get("description", ""),
                    "content": event.get("description", ""),
                    "entities": event.get("entities", []),
                    "related_documents": event.get("documents", []),
                    "keywords": [],
                    "version": "1.0",
                    "effective_date": event.get("date", ""),
                    "status": "active",
                    "supersedes": None,
                    "score": round(score, 4),
                })
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

retriever = Retriever()
