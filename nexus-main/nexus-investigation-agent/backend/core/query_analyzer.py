import re
import json
import os
from typing import Dict, Any, List
from ..config import settings

class QueryAnalyzer:
    def __init__(self):
        self.entities_data: List[Dict[str, Any]] = []
        self._load_entities()

    def _load_entities(self):
        path = os.path.join(settings.DATA_DIR, "entities.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                self.entities_data = json.load(f)

    def analyze(self, question: str) -> Dict[str, Any]:
        q_lower = question.lower()
        
        # 1. Match entities
        matched_entities = []
        for ent in self.entities_data:
            name = ent["name"].lower()
            if name in q_lower:
                matched_entities.append(ent)
                continue
            for alias in ent.get("aliases", []):
                if alias.lower() in q_lower:
                    matched_entities.append(ent)
                    break

        # 2. Extract temporal scope
        time_period = None
        months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
        quarters = ["q1", "q2", "q3", "q4"]
        for q in quarters:
            if re.search(rf"\b{q}\b", q_lower):
                time_period = q.upper()
                break
        if not time_period:
            for m in months:
                if m in q_lower:
                    time_period = m.capitalize()
                    break
        date_match = re.search(r"\b(september\s+\d{1,2}|august\s+\d{1,2})\b", q_lower)
        if date_match:
            time_period = date_match.group(0).capitalize()

        # 3. Determine investigation type
        inv_type = "root_cause_analysis"
        if "cost" in q_lower or "spend" in q_lower or "budget" in q_lower:
            inv_type = "financial_variance_investigation"
        elif "delay" in q_lower or "postpone" in q_lower:
            inv_type = "schedule_delay_investigation"
        elif "incident" in q_lower or "security" in q_lower or "breach" in q_lower:
            inv_type = "security_incident_investigation"
        elif "churn" in q_lower or "satisfaction" in q_lower or "complaints" in q_lower:
            inv_type = "customer_retention_investigation"

        # 4. Extract keywords. Keep domain terms and numbers because they are often the
        # strongest retrieval signals for new questions.
        stop_words = {"why", "did", "the", "what", "caused", "by", "was", "were", "is", "are", "for", "in", "during", "despite", "a", "an", "and", "or", "to", "of", "please", "tell", "me", "about", "how", "when", "where", "who", "which"}
        raw_words = re.findall(r"[a-zA-Z0-9_-]+", q_lower)
        keywords = [w for w in raw_words if w not in stop_words and len(w) > 2]

        # 5. Query intent is used to select retrieval and answer strategies.
        q_type = "general"
        if re.search(r"\bwhy\b|\bcaus(?:e|ed|ing)\b|\breason(?:s)?\b", q_lower):
            q_type = "why"
        elif re.search(r"\bwho\b|\bauthor|\bowner\b", q_lower):
            q_type = "who"
        elif re.search(r"\bwhen\b|\bdate\b|\bdeadline\b", q_lower):
            q_type = "when"
        elif re.search(r"\bwhere\b|\blocation\b", q_lower):
            q_type = "where"
        elif re.search(r"\bhow many\b|\bnumber of\b|\bcount\b", q_lower):
            q_type = "how_many"
        elif re.search(r"\bhow much\b|\btotal\b|\bcost\b|\bspend|\brevenue\b|%", q_lower):
            q_type = "how_much"
        elif re.search(r"\bcompare\b|\bversus\b|\bvs\.?\b|\bdifference between\b", q_lower):
            q_type = "compare"
        elif re.search(r"\blist\b|\bwhat are the\b|\bidentify\b", q_lower):
            q_type = "list"

        return {
            "original_question": question,
            "topic": " ".join(keywords[:4]) if keywords else question,
            "entities": matched_entities,
            "time_period": time_period,
            "investigation_type": inv_type,
            "question_type": q_type,
            "keywords": keywords,
            "initial_questions": [
                f"Verify whether {(' '.join(keywords[:3]))} occurred and determine affected systems or metrics.",
                f"Identify proximate operational, technical, or organizational changes associated with this event.",
                f"Trace the direct causal mechanism linking initial triggers to final observed outcomes."
            ]
        }

query_analyzer = QueryAnalyzer()
