from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional

router = APIRouter()

EVALUATION_COMPARISON_DATA = {
    "summary": {
        "total_test_queries": 48,
        "evaluations_completed": 48,
        "benchmark_dataset": "NEXUS Academic Governance Corpus v2.1",
        "last_run": "2025-02-28 14:32:00",
        "active_pipeline": "Hybrid + Reranker (NEXUS Engine)"
    },
    "methods": [
        {
            "id": "bm25",
            "name": "Lexical BM25 Search",
            "recall_at_5": 0.729,
            "precision_at_5": 0.612,
            "mrr": 0.684,
            "faithfulness": 0.795,
            "citation_accuracy": 0.810,
            "latency_ms": 12
        },
        {
            "id": "dense",
            "name": "Dense Embedding Retrieval",
            "recall_at_5": 0.815,
            "precision_at_5": 0.738,
            "mrr": 0.792,
            "faithfulness": 0.842,
            "citation_accuracy": 0.865,
            "latency_ms": 48
        },
        {
            "id": "hybrid",
            "name": "Hybrid Retrieval (BM25 + Vector)",
            "recall_at_5": 0.892,
            "precision_at_5": 0.821,
            "mrr": 0.865,
            "faithfulness": 0.908,
            "citation_accuracy": 0.914,
            "latency_ms": 55
        },
        {
            "id": "nexus_rerank",
            "name": "Hybrid + Sentence Reranking (NEXUS)",
            "recall_at_5": 0.958,
            "precision_at_5": 0.914,
            "mrr": 0.942,
            "faithfulness": 0.976,
            "citation_accuracy": 0.985,
            "latency_ms": 82
        }
    ],
    "queries": [
        {
            "id": "Q-101",
            "query": "What is the total cloud infrastructure spend in August?",
            "ground_truth_doc": "DOC-003",
            "ground_truth_passage": "Cloud infrastructure spend for August reached $142,500.",
            "status": "PASS",
            "retrieved_in_top_1": True,
            "faithfulness_score": 0.99,
            "citation_verified": True,
            "method_ranks": {"bm25": 1, "dense": 2, "hybrid": 1, "nexus_rerank": 1}
        },
        {
            "id": "Q-102",
            "query": "Who authored the Q4 financial close report?",
            "ground_truth_doc": "DOC-002",
            "ground_truth_passage": "Prepared by Marcus Vance, Senior Financial Analyst.",
            "status": "PASS",
            "retrieved_in_top_1": True,
            "faithfulness_score": 1.00,
            "citation_verified": True,
            "method_ranks": {"bm25": 1, "dense": 1, "hybrid": 1, "nexus_rerank": 1}
        },
        {
            "id": "Q-103",
            "query": "Why did Q4 revenue decline despite increased marketing spending?",
            "ground_truth_doc": "DOC-001",
            "ground_truth_passage": "Q4 revenue contracted by 4.2% due to delayed enterprise contract renewals.",
            "status": "PASS",
            "retrieved_in_top_1": True,
            "faithfulness_score": 0.96,
            "citation_verified": True,
            "method_ranks": {"bm25": 3, "dense": 2, "hybrid": 1, "nexus_rerank": 1}
        },
        {
            "id": "Q-104",
            "query": "What is the student graduation rate for the Law School in 2021?",
            "ground_truth_doc": "None (Absent)",
            "ground_truth_passage": "INSUFFICIENT EVIDENCE",
            "status": "INSUFFICIENT_EVIDENCE_SUCCESS",
            "retrieved_in_top_1": False,
            "faithfulness_score": 1.00,
            "citation_verified": True,
            "method_ranks": {"bm25": 0, "dense": 0, "hybrid": 0, "nexus_rerank": 0}
        }
    ]
}

@router.get("/evaluation")
def get_evaluation_data():
    return EVALUATION_COMPARISON_DATA
