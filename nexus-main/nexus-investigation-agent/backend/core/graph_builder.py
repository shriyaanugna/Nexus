import os
import json
from typing import List, Dict, Any, Set
from ..models.investigation import EvidenceGraph, GraphNode, GraphEdge
from ..models.evidence import EvidenceItem, CausalLink
from ..config import settings

class GraphBuilder:
    """Builds a question -> evidence -> entity/event -> conclusion tree.

    The graph is generated from the actual retrieved records, so a new question
    creates a new topology rather than displaying a canned diagram.
    """
    def __init__(self):
        self.relationships_data: List[Dict[str, Any]] = []
        self.entities_data: Dict[str, Dict[str, Any]] = {}
        self.events_data: Dict[str, Dict[str, Any]] = {}
        self._load_metadata()

    def _load_metadata(self):
        for filename, target in [
            ("relationships.json", "relationships_data"),
        ]:
            path = os.path.join(settings.DATA_DIR, filename)
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    setattr(self, target, json.load(f))
        ent_path = os.path.join(settings.DATA_DIR, "entities.json")
        if os.path.exists(ent_path):
            with open(ent_path, "r", encoding="utf-8") as f:
                self.entities_data = {e["entity_id"]: e for e in json.load(f)}
        evt_path = os.path.join(settings.DATA_DIR, "events.json")
        if os.path.exists(evt_path):
            with open(evt_path, "r", encoding="utf-8") as f:
                self.events_data = {e["event_id"]: e for e in json.load(f)}

    def build_graph(self, question: str, evidence: List[EvidenceItem], causal_chain: List[CausalLink], root_cause: str) -> EvidenceGraph:
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        added: Set[str] = set()

        def add_node(node: GraphNode):
            if node.id not in added:
                nodes.append(node)
                added.add(node.id)

        add_node(GraphNode(
            id="NODE-QUESTION", type="question", label=question[:70],
            data={"question": question, "type": "question"}, position={"x": 520, "y": 20}
        ))
        add_node(GraphNode(
            id="NODE-SEARCH", type="process", label="Autonomous Evidence Search",
            data={"stage": "search", "status": "completed"}, position={"x": 520, "y": 135}
        ))
        edges.append(GraphEdge(id="EDGE-QUESTION-SEARCH", source="NODE-QUESTION", target="NODE-SEARCH", relationship="investigates", strength=1.0))

        selected = sorted(evidence, key=lambda e: (e.relevance, e.strength), reverse=True)[:10]
        # First evidence tier is arranged as a tree under the search stage.
        for i, ev in enumerate(selected):
            x = 80 + (i % 5) * 220
            y = 260 + (i // 5) * 180
            ntype = "contradiction" if ev.status == "superseded" else ("finding" if ev.evidence_type == "Direct Evidence" else "document")
            add_node(GraphNode(
                id=ev.document_id, type=ntype,
                label=f"{ev.document_id}: {ev.title[:30]}",
                data={
                    "document_id": ev.document_id, "title": ev.title,
                    "department": ev.department, "evidence_type": ev.evidence_type,
                    "strength": ev.strength, "relevance": ev.relevance,
                    "date": ev.date, "status": ev.status, "author": ev.author,
                }, position={"x": x, "y": y}
            ))
            edges.append(GraphEdge(
                id=f"EDGE-SEARCH-{ev.document_id}", source="NODE-SEARCH", target=ev.document_id,
                relationship="retrieved", strength=ev.relevance
            ))

        # Preserve explicit relationships between retrieved documents.
        ids = set(added)
        edge_idx = 1
        for rel in self.relationships_data:
            s, t = rel.get("source"), rel.get("target")
            if s in ids and t in ids:
                edges.append(GraphEdge(
                    id=f"EDGE-REL-{edge_idx}", source=s, target=t,
                    relationship=rel.get("relationship", "related_to"), strength=rel.get("strength", 0.9)
                ))
                edge_idx += 1

        # Add entity nodes from the actual evidence.
        entity_ids: List[str] = []
        for ev in selected:
            for ent_id in ev.entities:
                if ent_id not in entity_ids:
                    entity_ids.append(ent_id)
        for j, ent_id in enumerate(entity_ids[:8]):
            ent = self.entities_data.get(ent_id)
            if not ent:
                continue
            x = 80 + (j % 4) * 260
            y = 620 + (j // 4) * 150
            add_node(GraphNode(
                id=ent_id, type="entity", label=ent.get("name", ent_id),
                data={"entity_id": ent_id, "type": ent.get("type", "Entity")},
                position={"x": x, "y": y}
            ))
            for ev in selected:
                if ent_id in ev.entities:
                    edges.append(GraphEdge(
                        id=f"EDGE-ENT-{ev.document_id}-{ent_id}", source=ev.document_id, target=ent_id,
                        relationship="involves", strength=0.82
                    ))
                    break

        # Add dated event nodes connected to evidence documents.
        event_ids: List[str] = []
        for ev in selected:
            for event_id, event in self.events_data.items():
                if ev.document_id in event.get("documents", []) and event_id not in event_ids:
                    event_ids.append(event_id)
        for j, event_id in enumerate(event_ids[:8]):
            event = self.events_data[event_id]
            x = 1100 + (j % 2) * 230
            y = 260 + (j // 2) * 150
            add_node(GraphNode(
                id=event_id, type="event", label=event.get("title", event_id)[:34],
                data={"event_id": event_id, "date": event.get("date", ""), "department": event.get("department", "")},
                position={"x": x, "y": y}
            ))
            linked = next((e for e in selected if event_id in self.events_data[event_id].get("documents", []) and e.document_id), None)
            if linked:
                edges.append(GraphEdge(
                    id=f"EDGE-EVENT-{event_id}-{linked.document_id}", source=linked.document_id, target=event_id,
                    relationship="occurred", strength=0.80
                ))

        if root_cause and root_cause != "INSUFFICIENT EVIDENCE":
            add_node(GraphNode(
                id="NODE-ROOT-CAUSE", type="root_cause", label="Investigation Conclusion",
                data={"root_cause": root_cause}, position={"x": 520, "y": 900}
            ))
            for ev in selected[:3]:
                edges.append(GraphEdge(
                    id=f"EDGE-CONCLUSION-{ev.document_id}", source=ev.document_id, target="NODE-ROOT-CAUSE",
                    relationship="supports", strength=ev.strength
                ))

        return EvidenceGraph(nodes=nodes, edges=edges)

graph_builder = GraphBuilder()
