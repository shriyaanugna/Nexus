import uuid
import datetime
import os
import json
from typing import Dict, Any, List
from ..models.investigation import InvestigationResponse, InvestigationStep
from ..models.evidence import EvidenceItem
from ..core.query_analyzer import query_analyzer
from ..core.investigation_planner import investigation_planner
from ..core.retriever import retriever
from ..core.evidence_analyzer import evidence_analyzer
from ..core.gap_detector import gap_detector
from ..core.followup_generator import followup_generator
from ..core.contradiction_detector import contradiction_detector
from ..core.graph_builder import graph_builder
from ..core.causal_chain import causal_chain_builder
from ..core.root_cause import root_cause_analyzer
from ..core.confidence import confidence_calculator
from ..core.answer_engine import answer_engine
from ..core.report_generator import report_generator
from ..services.audit_service import audit_service
from ..services.demo_engine import demo_engine
from ..database import save_investigation, get_investigation_by_id
from ..config import settings

class InvestigationService:
    def investigate(self, question: str) -> InvestigationResponse:
        inv_id = f"INV-{uuid.uuid4().hex[:6].upper()}"
        start_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        steps: List[InvestigationStep] = []
        visited_queries: List[str] = []
        retrieved_docs_map: Dict[str, Dict[str, Any]] = {}
        
        step_num = 1
        
        # 1. Query Analysis
        analysis = query_analyzer.analyze(question)
        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="QUERY_ANALYZED",
            description=f"Question analyzed. Topic: '{analysis['topic']}'. Detected {len(analysis['entities'])} entities, temporal scope: {analysis['time_period'] or 'unspecified'}.",
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        audit_service.record_action(
            investigation_id=inv_id,
            action="QUERY_ANALYZED",
            query=question,
            details=analysis
        )
        step_num += 1
        
        # 2. Planning
        plan = investigation_planner.plan(analysis)
        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="PLAN_CREATED",
            description=f"Formulated structured multi-phase investigation plan ({len(plan)} strategic goals).",
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        audit_service.record_action(
            investigation_id=inv_id,
            action="PLAN_CREATED",
            query=question,
            details={"plan": plan}
        )
        step_num += 1

        # 3. Initial Search
        # Search the user's complete question first. A second planner query
        # broadens retrieval without forcing the question into a demo scenario.
        initial_query = question
        visited_queries.append(initial_query)
        # Multi-query retrieval prevents the planner from overfitting to a
        # particular demo question. We keep the user's wording as the anchor
        # and add only intent-aware variants.
        retrieval_queries = [initial_query]
        keywords = analysis.get("keywords", [])
        if keywords:
            retrieval_queries.append(" ".join(keywords))
        if analysis.get("question_type") == "why":
            retrieval_queries.append(f"{' '.join(keywords[:6])} cause impact reason")
        elif analysis.get("question_type") in ("how_much", "how_many"):
            retrieval_queries.append(f"{' '.join(keywords[:6])} amount metric total")
        elif analysis.get("question_type") == "who":
            retrieval_queries.append(f"{' '.join(keywords[:6])} author owner")
        elif analysis.get("question_type") == "when":
            retrieval_queries.append(f"{' '.join(keywords[:6])} date schedule")

        planned_query = plan[0]["query"] if plan else ""
        if planned_query and planned_query.lower() != initial_query.lower():
            retrieval_queries.append(planned_query)
        visited_queries.extend(q for q in retrieval_queries[1:] if q)

        initial_results = retriever.retrieve_many(retrieval_queries, top_k_each=8)
        # Quality gate: a vector index always returns *something*, even for
        # completely unrelated questions. Never turn a weak nearest neighbor
        # into evidence. A dynamic floor preserves novel-question support while
        # preventing semantic noise from reaching the answer engine.
        best_initial = initial_results[0].get("score", 0.0) if initial_results else 0.0
        evidence_floor = max(0.20, best_initial * 0.48)
        for r in initial_results:
            lexical = r.get("_lexical_score", 0.0)
            semantic = r.get("_semantic_score", 0.0)
            # Require either meaningful hybrid relevance or meaningful lexical
            # grounding. This blocks unrelated nearest-neighbour matches.
            if r.get("score", 0.0) < evidence_floor:
                continue
            if lexical < 0.08 and semantic < 0.18:
                continue
            retrieved_docs_map[r["document_id"]] = r

        # Event records are first-class evidence for event/date questions, but
        # should not compete with ordinary document evidence for unrelated
        # questions (e.g. a support SLA query).
        event_intent = analysis.get("question_type") == "when" or any(
            term in question.lower() for term in ("event", "incident", "happened", "occurred", "timeline")
        )
        if event_intent:
            for event in retriever.retrieve_events(question, top_k=5):
                if event.get("score", 0.0) >= 0.20:
                    retrieved_docs_map[event["document_id"]] = event

        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="SEARCH_EXECUTED",
            description=f"Executed initial search across enterprise repositories. Retrieved {len(retrieved_docs_map)} primary candidate documents.",
            query=initial_query,
            findings_count=len(retrieved_docs_map),
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        audit_service.record_action(
            investigation_id=inv_id,
            action="SEARCH_EXECUTED",
            query=initial_query,
            documents_searched=len(retrieved_docs_map),
            evidence_selected=len(retrieved_docs_map)
        )
        step_num += 1

        # 4. Evidence Analysis
        evidence_items: List[EvidenceItem] = []
        for idx, (doc_id, doc) in enumerate(retrieved_docs_map.items()):
            ev = evidence_analyzer.analyze_document(doc, query=initial_query, rank_index=idx)
            evidence_items.append(ev)
            
        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="EVIDENCE_SELECTED",
            description=f"Extracted and scored {len(evidence_items)} initial evidence items across multiple departmental silos.",
            findings_count=len(evidence_items),
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        step_num += 1

        # 5. Gap Detection & Multi-Depth Recursive Retrieval Loop
        current_depth = 1
        max_depth = min(settings.MAX_INVESTIGATION_DEPTH, 4)
        
        while current_depth < max_depth:
            established, still_needed, gaps = gap_detector.detect_gaps(question, evidence_items, analysis)
            
            if not gaps or not still_needed:
                break
                
            steps.append(InvestigationStep(
                step_number=step_num,
                action_type="GAP_DETECTED",
                description=f"Information gap identified: {still_needed[0]}",
                status="warning",
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
            ))
            audit_service.record_action(
                investigation_id=inv_id,
                action="GAP_DETECTED",
                details={"still_needed": still_needed, "gaps_count": len(gaps)}
            )
            step_num += 1
            
            followup_query = followup_generator.generate_followup(gaps, evidence_items, visited_queries)
            if not followup_query or followup_query in visited_queries:
                break
                
            visited_queries.append(followup_query)
            steps.append(InvestigationStep(
                step_number=step_num,
                action_type="FOLLOWUP_GENERATED",
                description=f"Formulated targeted follow-up query: '{followup_query}'",
                query=followup_query,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
            ))
            step_num += 1
            
            # Retrieve follow-up evidence
            new_results = retriever.retrieve_many([followup_query], top_k_each=6)
            # Do not pollute the investigation with weak semantic neighbors.
            # A relative threshold keeps retrieval adaptive across question types.
            followup_top = new_results[0]["score"] if new_results else 0.0
            followup_threshold = max(0.12, followup_top * 0.42)
            new_docs_count = 0
            for r in new_results:
                if r.get("score", 0) < followup_threshold:
                    continue
                if r["document_id"] not in retrieved_docs_map:
                    retrieved_docs_map[r["document_id"]] = r
                    new_ev = evidence_analyzer.analyze_document(r, query=followup_query, rank_index=len(evidence_items))
                    evidence_items.append(new_ev)
                    new_docs_count += 1
                    
            steps.append(InvestigationStep(
                step_number=step_num,
                action_type="SEARCH_EXECUTED",
                description=f"Retrieved {new_docs_count} additional corroborated documents for follow-up query.",
                query=followup_query,
                findings_count=new_docs_count,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
            ))
            audit_service.record_action(
                investigation_id=inv_id,
                action="SEARCH_EXECUTED",
                query=followup_query,
                documents_searched=len(new_results),
                evidence_selected=new_docs_count
            )
            step_num += 1
            current_depth += 1

        # 6. Quality gate before synthesis. Weak semantic neighbors are not
        # treated as evidence simply because the vector index returned them.
        if evidence_items:
            best_rel = max(e.relevance for e in evidence_items)
            evidence_items = [e for e in evidence_items if e.relevance >= max(0.10, best_rel * 0.34)]
            evidence_items.sort(key=lambda e: (e.relevance, e.strength), reverse=True)

        # 7. Contradiction Detection
        contradictions = contradiction_detector.detect_contradictions(evidence_items)
        if contradictions:
            steps.append(InvestigationStep(
                step_number=step_num,
                action_type="CONTRADICTION_DETECTED",
                description=f"Evidence conflict detected between {contradictions[0].source_a_id} and {contradictions[0].source_b_id}. Reconciled via document status and date.",
                status="warning",
                findings_count=len(contradictions),
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
            ))
            audit_service.record_action(
                investigation_id=inv_id,
                action="CONTRADICTION_DETECTED",
                contradictions_detected=len(contradictions),
                details={"contradictions": [c.model_dump() for c in contradictions]}
            )
            step_num += 1

        # 7. Causal Chain Construction
        causal_chain = causal_chain_builder.build_chain(question, evidence_items)
        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="CAUSAL_CHAIN_CONSTRUCTED",
            description=f"Constructed directed causal chain spanning {len(causal_chain)} operational milestones.",
            findings_count=len(causal_chain),
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        step_num += 1

        # 8. Root Cause Analysis
        root_cause, answer, unresolved_questions = root_cause_analyzer.analyze(question, evidence_items, causal_chain)
        
        is_insufficient = (root_cause is None or root_cause == "INSUFFICIENT EVIDENCE")
        status = "insufficient_evidence" if is_insufficient else "completed"
        
        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="ROOT_CAUSE_IDENTIFIED" if not is_insufficient else "INSUFFICIENT_EVIDENCE_FLAGGED",
            description="Synthesized evidence-backed root cause conclusion." if not is_insufficient else "Knowledge base lacks sufficient documentation to establish root cause without hallucination.",
            status="completed" if not is_insufficient else "warning",
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        audit_service.record_action(
            investigation_id=inv_id,
            action="ROOT_CAUSE_IDENTIFIED" if not is_insufficient else "INSUFFICIENT_EVIDENCE",
            final_result=root_cause or "INSUFFICIENT EVIDENCE"
        )
        step_num += 1

        # 9. Confidence Calculation
        confidence, confidence_level = confidence_calculator.calculate(
            evidence=evidence_items,
            contradictions=contradictions,
            has_root_cause=not is_insufficient
        )

        # 10. Graph Generation
        graph = graph_builder.build_graph(
            question=question,
            evidence=evidence_items,
            causal_chain=causal_chain,
            root_cause=root_cause or ""
        )
        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="GRAPH_UPDATED",
            description=f"Dynamic evidence graph generated with {len(graph.nodes)} nodes and {len(graph.edges)} typed relationship edges.",
            findings_count=len(graph.nodes),
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        step_num += 1

        # 11. What We Know vs Still Need
        final_established, final_still_needed, _ = gap_detector.detect_gaps(question, evidence_items, analysis)
        if is_insufficient:
            final_still_needed.extend(unresolved_questions)

        # 12. Report Generation
        report_md = report_generator.generate_report(
            investigation_id=inv_id,
            question=question,
            answer=answer,
            root_cause=root_cause,
            confidence=confidence,
            confidence_level=confidence_level,
            evidence=evidence_items,
            causal_chain=causal_chain,
            contradictions=contradictions,
            unresolved_questions=unresolved_questions
        )
        steps.append(InvestigationStep(
            step_number=step_num,
            action_type="REPORT_GENERATED",
            description="Completed 13-section evidence-backed audit report with strict verified citations.",
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        ))
        audit_service.record_action(
            investigation_id=inv_id,
            action="REPORT_GENERATED",
            details={"confidence": confidence, "evidence_count": len(evidence_items)}
        )

        # Build timeline from events
        timeline_events = []
        path_events = os.path.join(settings.DATA_DIR, "events.json")
        if os.path.exists(path_events):
            with open(path_events, "r", encoding="utf-8") as f:
                all_events = json.load(f)
                # Match events linked to retrieved docs
                retrieved_ids = set(retrieved_docs_map.keys())
                for evt in all_events:
                    if any(d in retrieved_ids for d in evt.get("documents", [])):
                        timeline_events.append(evt)
        timeline_events.sort(key=lambda x: x.get("date", ""))

        # Sources summary
        sources_summary = []
        seen_src = set()
        for ev in evidence_items:
            if ev.source not in seen_src:
                sources_summary.append({
                    "name": ev.source,
                    "department": ev.department,
                    "reliability": ev.source_reliability,
                    "document_count": sum(1 for e in evidence_items if e.source == ev.source)
                })
                seen_src.add(ev.source)

        completed_time = datetime.datetime.now(datetime.timezone.utc).isoformat()

        response = InvestigationResponse(
            investigation_id=inv_id,
            status=status,
            question=question,
            mode="Local Evidence Mode" if settings.is_local_mode else "AI Investigation Mode",
            answer=answer,
            root_cause=root_cause,
            confidence=confidence,
            confidence_level=confidence_level,
            investigation_depth=max(1, current_depth),
            steps=steps,
            evidence=evidence_items,
            established_knowledge=final_established[:6],
            still_needed_knowledge=final_still_needed[:4],
            causal_chain=causal_chain,
            contradictions=contradictions,
            unresolved_questions=unresolved_questions,
            sources=sources_summary,
            timeline=timeline_events,
            graph=graph,
            report_markdown=report_md,
            created_at=start_time,
            completed_at=completed_time
        )
        
        # Save to database
        save_investigation(response.model_dump())
        return response

investigation_service = InvestigationService()
