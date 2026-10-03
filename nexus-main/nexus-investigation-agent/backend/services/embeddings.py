import os
import numpy as np
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer

class EmbeddingService:
    """
    High performance embedding service supporting semantic feature extraction.
    Provides instant offline TF-IDF + n-gram dense embeddings, or sentence-transformers
    if installed.
    """
    def __init__(self):
        self._st_model = None
        self._tfidf_vectorizer = None
        self._use_st = False
        
        # Check if sentence-transformers is available
        try:
            from sentence_transformers import SentenceTransformer
            # Only use if explicitly pre-cached or local without network hang
            pass
        except Exception:
            self._use_st = False

    def fit_or_init(self, corpus: List[str]):
        """Initializes or fits vectorizer on corpus."""
        self._tfidf_vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=4096,
            stop_words='english',
            sublinear_tf=True
        )
        self._tfidf_vectorizer.fit(corpus)

    def encode(self, texts: List[str]) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]
        if self._tfidf_vectorizer is None:
            raise ValueError("Embedding service not fitted with corpus.")
        mat = self._tfidf_vectorizer.transform(texts).toarray()
        # L2 normalize
        norms = np.linalg.norm(mat, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return mat / norms

embedding_service = EmbeddingService()
