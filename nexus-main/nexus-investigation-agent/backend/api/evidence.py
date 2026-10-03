from fastapi import APIRouter
from typing import List, Dict, Any
import os
import json
from ..config import settings
from ..services.vector_store import vector_store

router = APIRouter()

@router.get("/evidence")
def list_evidence() -> List[Dict[str, Any]]:
    """Returns repository documents enriched with source reliability and metadata."""
    sources_map = {}
    path_sources = os.path.join(settings.DATA_DIR, "sources.json")
    if os.path.exists(path_sources):
        with open(path_sources, "r", encoding="utf-8") as f:
            for s in json.load(f):
                sources_map[s["name"]] = s.get("reliability_level", 0.85)

    results = []
    for d in vector_store.documents:
        item = dict(d)
        item["reliability"] = sources_map.get(d.get("source", ""), 0.85)
        results.append(item)
    return results
