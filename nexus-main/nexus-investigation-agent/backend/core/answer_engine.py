"""Evidence-grounded answer generation for arbitrary questions in the local corpus.

The engine deliberately does not map questions to canned answers. It detects the
question intent, reranks sentence-level evidence, and produces a concise answer
from retrieved records. If the corpus does not contain enough evidence it returns
an explicit insufficiency result instead of guessing.
"""
from __future__ import annotations
import re
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple
from ..models.evidence import EvidenceItem

STOP = {
    "what","which","who","when","where","why","how","did","does","do","is","are","was","were",
    "the","a","an","of","to","for","in","on","at","during","despite","with","from","by","and","or",
    "this","that","these","those","it","its","their","there","tell","me","about","can","could","would",
    "please","latest","current","recent","main","reason","reasons","cause","causes"
}

INTENT_PATTERNS = [
    ("why", r"\bwhy\b|\bcaus(?:e|ed|ing)\b|\breason(?:s)?\b|\bdriver(?:s)?\b"),
    ("who", r"\bwho\b|\bauthor(?:ed)?\b|\bowner\b"),
    ("when", r"\bwhen\b|\bdate\b|\bdeadline\b|\bscheduled\b"),
    ("where", r"\bwhere\b|\blocation\b"),
    ("how_many", r"\bhow many\b|\bnumber of\b|\bcount\b"),
    ("how_much", r"\bhow much\b|\bhow many .*\$|\btotal\b|\bcost\b|\bspend(?:ing)?\b|\brevenue\b|\bpercentage\b|\b%\b"),
    ("compare", r"\bcompare\b|\bdifference between\b|\bversus\b|\bvs\.?\b|\bchange between\b"),
    ("list", r"\blist\b|\bwhat are the\b|\bwhich .* are\b|\bidentify\b|\bshow me\b|\bwhat documents?\b|\bwhich documents?\b"),
]


def tokens(text: str) -> List[str]:
    raw = re.findall(r"[a-zA-Z0-9$%._-]+", (text or "").lower())
    out = []
    for t in raw:
        if len(t) <= 1 or t in STOP:
            continue
        out.append(t)
        # Lightweight morphology improves matching of singular/plural wording.
        if t.endswith("ies") and len(t) > 4:
            out.append(t[:-3] + "y")
        elif t.endswith("s") and len(t) > 4 and not t.endswith("ss"):
            out.append(t[:-1])
    return out



QUERY_CONCEPTS = {
    "target": {"target", "sla", "mandate", "mandates", "require", "required", "requirement", "goal", "threshold", "standard"},
    "latest": {"latest", "current", "recent", "active", "effective", "newest"},
    "forecast": {"forecast", "projection", "projected", "outlook"},
    "owner": {"owner", "owned", "responsible", "department"},
    "cost": {"cost", "spend", "spending", "expense", "expenses", "budget"},
    "response": {"response", "respond", "response-time", "response_time", "sla"},
}

def expanded_query_terms(question: str) -> set:
    base = set(tokens(question))
    expanded = set(base)
    for term in list(base):
        expanded.update(QUERY_CONCEPTS.get(term, set()))
    if "response" in base and "time" in base:
        expanded.update(QUERY_CONCEPTS["response"])
    return expanded

def sentence_split(text: str) -> List[str]:
    text = re.sub(r"\s+", " ", text or "").strip()
    if not text:
        return []
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+|(?<=;)\s+", text) if len(s.strip()) > 10]


class EvidenceAnswerEngine:
    def classify(self, question: str) -> str:
        q = question.lower()
        if re.search(r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b", q):
            return "when"
        for intent, pattern in INTENT_PATTERNS:
            if re.search(pattern, q):
                return intent
        return "general"

    def _score_sentence(self, question: str, sentence: str, doc: EvidenceItem, intent: str) -> float:
        q_tokens = tokens(question)
        s_tokens = tokens(sentence)
        if not q_tokens or not s_tokens:
            return 0.0
        qset, sset = set(q_tokens), set(s_tokens)
        # Expand high-value enterprise concepts (target/SLA, forecast/outlook,
        # owner/responsible, etc.) without hardcoding individual questions.
        concept_set = expanded_query_terms(question)
        overlap = len(qset & sset) / max(1, len(qset))
        concept_overlap = len(concept_set & sset) / max(1, len(concept_set))
        # Exact phrase/number/date matches matter strongly in enterprise research.
        q_lower, s_lower = question.lower(), sentence.lower()
        phrase_bonus = 0.0
        for n in (3, 2):
            grams = list(zip(q_tokens, q_tokens[1:])) if n == 2 else list(zip(q_tokens, q_tokens[1:], q_tokens[2:]))
            for gram in grams:
                phrase = " ".join(gram)
                if phrase in s_lower:
                    phrase_bonus += 0.07
        number_bonus = 0.0
        q_numbers = set(re.findall(r"\$?\d+(?:\.\d+)?%?", q_lower))
        s_numbers = set(re.findall(r"\$?\d+(?:\.\d+)?%?", s_lower))
        if q_numbers & s_numbers:
            number_bonus = 0.20

        intent_bonus = 0.0
        if "latest" in q_lower or "current" in q_lower or "most recent" in q_lower:
            if doc.status == "active":
                intent_bonus += 0.10
        if intent == "why":
            if re.search(r"\b(because|due to|caused|causing|led to|resulted|contributed|attribut|declin|increase|surged|dropped|failure|disruption|issue)\b", s_lower):
                intent_bonus += 0.20
        elif intent == "who":
            if doc.title.lower() in s_lower or re.search(r"\b(author|authored|owner|prepared by|written by|chief|lead)\b", s_lower):
                intent_bonus += 0.35
        elif intent == "when":
            if re.search(r"\b(20\d{2}|january|february|march|april|may|june|july|august|september|october|november|december|date|scheduled|deadline)\b", s_lower):
                intent_bonus += 0.25
        elif intent in ("how_many", "how_much"):
            if re.search(r"\$|%|\b\d+(?:\.\d+)?\b|million|billion|crore|nodes|customers|users|accounts", s_lower):
                intent_bonus += 0.25
        elif intent == "compare":
            if re.search(r"\b(vs|versus|compared|difference|increase|decrease|higher|lower|from .* to)\b", s_lower):
                intent_bonus += 0.15
        elif intent == "list":
            if re.search(r"[:,]|\b(first|second|third|including|such as|following|documents?|records?|reports?)\b", s_lower):
                intent_bonus += 0.10

        title_overlap = len(set(tokens(doc.title)) & qset) / max(1, len(qset))
        source_type_bonus = 0.0
        if doc.document_type != "Event Record" and intent != "when":
            source_type_bonus = 0.07
        if doc.document_type == "Event Record" and intent == "when":
            source_type_bonus = 0.18
        # Title alignment is a strong signal for factual questions. Keep the
        # sentence itself dominant so a generic event/summary cannot outrank a
        # precise sentence from the document whose title matches the query.
        return min(1.0, 0.38 * overlap + 0.22 * concept_overlap + 0.20 * title_overlap + phrase_bonus + number_bonus + intent_bonus + source_type_bonus)

    def rank_sentences(self, question: str, evidence: List[EvidenceItem]) -> List[Tuple[float, EvidenceItem, str]]:
        intent = self.classify(question)
        ranked: List[Tuple[float, EvidenceItem, str]] = []
        for ev in evidence:
            candidates = sentence_split(ev.summary) + sentence_split(ev.excerpt)
            # Also use full excerpt/content-derived summary supplied by analyzer.
            if not candidates:
                candidates = [ev.title]
            seen = set()
            for sent in candidates:
                if sent in seen:
                    continue
                seen.add(sent)
                score = self._score_sentence(question, sent, ev, intent)
                score += min(0.18, ev.relevance * 0.18) + min(0.12, ev.strength * 0.12)
                ranked.append((score, ev, sent))
        ranked.sort(key=lambda x: x[0], reverse=True)
        return ranked

    def answer(self, question: str, evidence: List[EvidenceItem], causal_chain: Optional[List[Any]] = None) -> Tuple[Optional[str], Optional[str], List[str], Dict[str, Any]]:
        intent = self.classify(question)
        ranked = self.rank_sentences(question, evidence)
        if not ranked:
            return None, "INSUFFICIENT EVIDENCE", [
                "The indexed enterprise knowledge base does not contain enough directly relevant evidence for this question."
            ], {"intent": intent, "evidence_sentences": 0}
        top_available = ranked[0][0]
        threshold = max(0.16, top_available * 0.45)
        usable = [x for x in ranked if x[0] >= threshold]
        if not usable:
            return None, "INSUFFICIENT EVIDENCE", [
                "The indexed enterprise knowledge base does not contain enough directly relevant evidence for this question.",
                "Add or index a source containing the requested topic, metric, event, person, or date."
            ], {"intent": intent, "evidence_sentences": 0}

        # Keep the strongest sentence per document to avoid repeating one record.
        selected: List[Tuple[float, EvidenceItem, str]] = []
        seen_docs = set()
        for item in usable:
            if item[1].document_id not in seen_docs:
                selected.append(item)
                seen_docs.add(item[1].document_id)
            if len(selected) >= 5:
                break

        top_score, primary, primary_sentence = selected[0]
        citations = [e.document_id for _, e, _ in selected]

        if intent == "who":
            author_candidates = [e for _, e, _ in selected if e.author]
            if author_candidates:
                author_doc = max(author_candidates, key=lambda e: e.relevance)
                answer = f"The author of **{author_doc.title}** ({author_doc.document_id}) is **{author_doc.author}**."
                primary = author_doc
            else:
                answer = f"The strongest matching record is **{primary.title}** ({primary.document_id}). {primary_sentence}"
        elif intent == "when":
            event_candidates = [x for x in selected if x[1].document_type == "Event Record"]
            date_match = re.search(r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b", question.lower())
            if date_match and event_candidates:
                month, day = date_match.groups()
                months = {m:i for i,m in enumerate(['january','february','march','april','may','june','july','august','september','october','november','december'],1)}
                target = f"2026-{months[month]:02d}-{int(day):02d}"
                exact = [x for x in event_candidates if x[1].date == target]
                if exact:
                    chosen = max(exact, key=lambda x: x[0])
                    primary, primary_sentence = chosen[1], chosen[2]
            answer = f"The strongest matching event is dated **{primary.date}**. {primary_sentence}"
        elif intent == "compare":
            parts = [f"**{e.document_id}** ({e.title}): {s}" for _, e, s in selected[:4]]
            answer = "The authorized evidence shows these relevant records:\n\n" + "\n\n".join(parts)
        elif intent == "list":
            parts = [f"• **{e.title}** ({e.document_id}): {s}" for _, e, s in selected[:5]]
            answer = "The investigation found these relevant evidence-backed items:\n\n" + "\n".join(parts)
        elif intent == "why":
            reasons = [s for _, _, s in selected[:4]]
            answer = "Based on the strongest evidence, the documented contributing factors are:\n\n" + "\n".join(f"• {r}" for r in reasons)
        else:
            answer = f"Based on **{primary.document_id} — {primary.title}**, the strongest matching enterprise evidence is: {primary_sentence}"
            if len(selected) > 1:
                answer += "\n\nAdditional corroboration: " + " ".join(s for _, _, s in selected[1:3])

        root_cause = None
        if intent == "why":
            root_cause = primary_sentence
        elif selected:
            root_cause = f"Primary finding: {primary_sentence}"

        unresolved: List[str] = []
        if top_score < 0.48:
            unresolved.append("The answer is supported by relevant but moderately matched evidence; additional primary records would increase certainty.")
        if len(selected) == 1:
            unresolved.append("Only one distinct record provided strong sentence-level support.")

        return root_cause, answer, unresolved, {
            "intent": intent,
            "evidence_sentences": len(selected),
            "primary_score": round(top_score, 3),
            "citation_ids": citations,
        }

answer_engine = EvidenceAnswerEngine()
