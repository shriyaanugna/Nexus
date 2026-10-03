from typing import Dict, Any, List

class InvestigationPlanner:
    def plan(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        question = analysis["original_question"]
        keywords = analysis.get("keywords", [])
        entities = analysis.get("entities", [])
        time_period = analysis.get("time_period")
        
        time_str = f" {time_period}" if time_period else ""
        ent_str = f" {entities[0]['name']}" if entities else ""
        
        plan_steps = [
            {
                "step": 1,
                "goal": f"Retrieve primary documentation establishing the event baseline and initial impact",
                "query": f"{' '.join(keywords[:3])}{time_str}".strip()
            },
            {
                "step": 2,
                "goal": f"Investigate cross-department operational dependencies and proximate contributing events",
                "query": f"{' '.join(keywords[:2])}{ent_str}".strip()
            },
            {
                "step": 3,
                "goal": "Verify root cause mechanism, inspect system postmortems, and identify conflicting claims",
                "query": f"{' '.join(keywords[1:3])} root cause incident postmortem".strip()
            }
        ]
        return plan_steps

investigation_planner = InvestigationPlanner()
