import os
import json
import re
import numpy as np
from typing import List, Dict, Any, Optional
from .embeddings import embedding_service
from ..config import settings

class VectorStore:
    """
    Hybrid local retriever.

    Semantic TF-IDF is combined with a lightweight lexical score.  This is
    important for arbitrary/new questions: exact entities, numbers, dates and
    domain terms can be highly informative even when the wording is different
    from the training/demo questions.
    """
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.vectors: Optional[np.ndarray] = None
        self.doc_map: Dict[str, Dict[str, Any]] = {}
        self._faiss_index = None
        self._has_faiss = False

        try:
            import faiss
            self._faiss = faiss
            self._has_faiss = True
        except ImportError:
            self._faiss = None
            self._has_faiss = False

    def build_index(self, docs: List[Dict[str, Any]]):
        self.documents = docs
        self.doc_map = {d["document_id"]: d for d in docs}

        corpus = [
            f"{d.get('title', '')} {d.get('department', '')} "
            f"{d.get('summary', '')} {d.get('content', '')} "
            f"{' '.join(d.get('keywords', []))} {' '.join(d.get('entities', []))}"
            for d in docs
        ]

        embedding_service.fit_or_init(corpus)
        self.vectors = embedding_service.encode(corpus).astype(np.float32)

        if self._has_faiss:
            dim = self.vectors.shape[1]
            self._faiss_index = self._faiss.IndexFlatIP(dim)
            self._faiss_index.add(self.vectors)

    @staticmethod
    def _tokens(text: str) -> set:
        return {
            t for t in re.findall(r"[a-zA-Z0-9_-]+", (text or "").lower())
            if len(t) > 2
        }

    def _lexical_score(self, query: str, doc: Dict[str, Any]) -> float:
        q = self._tokens(query)
        if not q:
            return 0.0
        title = str(doc.get("title", ""))
        searchable = " ".join([
            title,
            str(doc.get("department", "")),
            str(doc.get("summary", "")),
            str(doc.get("content", "")),
            " ".join(doc.get("keywords", [])),
            " ".join(doc.get("entities", [])),
        ])
        d = self._tokens(searchable)
        overlap = len(q & d) / max(1, len(q))
        title_tokens = self._tokens(title)
        title_overlap = len(q & title_tokens) / max(1, len(q))
        phrase_boost = 0.0
        q_words = [w for w in re.findall(r"[a-zA-Z0-9_-]+", query.lower()) if len(w) > 2]
        if len(q_words) >= 2:
            for n in (3, 2):
                for i in range(len(q_words) - n + 1):
                    phrase = " ".join(q_words[i:i+n])
                    if phrase in searchable.lower():
                        phrase_boost += 0.08 if n == 2 else 0.12
        # Numeric/date terms are high-value signals.
        q_numbers = set(re.findall(r"\$?\d+(?:\.\d+)?%?", query.lower()))
        d_numbers = set(re.findall(r"\$?\d+(?:\.\d+)?%?", searchable.lower()))
        number_boost = 0.12 if q_numbers & d_numbers else 0.0
        return min(1.0, overlap * 0.55 + title_overlap * 0.25 + min(0.18, phrase_boost) + number_boost)

    def search(self, query: str, top_k: int = 10,
               department_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.vectors is None or not self.documents:
            return []

        q_vec = embedding_service.encode([query]).astype(np.float32)

        if self._has_faiss and self._faiss_index is not None:
            scores, indices = self._faiss_index.search(
                q_vec, len(self.documents)
            )
            semantic_pairs = [
                (self.documents[idx], float(scores[0][i]))
                for i, idx in enumerate(indices[0]) if idx != -1
            ]
        else:
            sims = np.dot(self.vectors, q_vec.T).flatten()
            semantic_pairs = [
                (self.documents[idx], float(sims[idx]))
                for idx in np.argsort(-sims)
            ]

        candidates = []
        for doc, semantic in semantic_pairs:
            if department_filter and doc.get("department", "").lower() != department_filter.lower():
                continue
            lexical = self._lexical_score(query, doc)
            # Hybrid score: semantic meaning + exact term coverage.
            score = (0.62 * max(0.0, semantic)) + (0.38 * lexical)
            res = dict(doc)
            res["score"] = round(float(min(1.0, score)), 4)
            res["_semantic_score"] = round(float(semantic), 4)
            res["_lexical_score"] = round(float(lexical), 4)
            candidates.append(res)

        candidates.sort(key=lambda x: x["score"], reverse=True)
        return candidates[:top_k]

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        return self.doc_map.get(doc_id)

vector_store = VectorStore()
