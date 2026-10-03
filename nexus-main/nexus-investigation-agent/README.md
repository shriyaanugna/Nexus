# NEXUS — Autonomous Enterprise Investigation System

**Evidence-first investigation for new questions.**

NEXUS accepts a natural-language question, searches the local enterprise knowledge base, reranks sentence-level evidence, follows connected records, detects contradictions, builds a dynamic evidence tree, and produces an evidence-grounded answer. It does not use a question-to-answer dictionary for arbitrary questions.

## What was fixed

- Multi-query retrieval keeps the user's exact question as the primary search signal and adds intent-aware variants.
- Hybrid TF-IDF + lexical + title + phrase + numeric matching improves new-question retrieval.
- Sentence-level evidence reranking supports `why`, `who`, `when`, `where`, `how much`, `how many`, `compare`, `list`, and general questions.
- Dated event records are searchable and become evidence for date/event questions.
- Weak semantic neighbors are removed by an adaptive quality gate before synthesis.
- Exact challenge/demo cases remain regression fixtures; arbitrary questions are evidence-driven.
- The knowledge graph is generated from the actual investigation and now includes Question → Search → Documents → Entities/Events → Conclusion.
- React Flow nodes have animated edges, floating motion, minimap and interactive selection.
- Frontend now uses a pink/lavender enterprise visual system with persistent light/dark mode.
- Investigation progress is animated through seven visible stages.

## Important limitation

NEXUS can answer new questions **when the indexed knowledge base contains supporting evidence**. No retrieval system can correctly answer facts that are absent from its data without an external source. When evidence is insufficient, NEXUS returns `INSUFFICIENT EVIDENCE` instead of inventing an answer.

## Run locally

### Backend

From the project root:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

API: http://localhost:8000
Swagger: http://localhost:8000/docs

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

PowerShell shortcut:

```powershell
Start-Process "http://localhost:5173"
```

## Test

```powershell
python -m pytest -q
```

The included regression suite covers retrieval, investigation flow, contradictions and demo scenarios. Additional new-question behavior is implemented by the same retrieval/answer pipeline rather than a hardcoded question list.

## Architecture

```text
User Question
     ↓
Query Analysis + Intent Detection
     ↓
Multi-Query Hybrid Retrieval
     ↓
Sentence-Level Evidence Reranking
     ↓
Adaptive Evidence Quality Gate
     ↓
Recursive Gap / Follow-up Search
     ↓
Contradiction + Version Analysis
     ↓
Dynamic Evidence Graph
     ↓
Evidence-Grounded Answer Engine
     ↓
Audit Trail + Report
```

## Frontend

- React + Vite
- Tailwind CSS
- React Flow
- Recharts
- Lucide icons
- Responsive enterprise dashboard
- Light/dark theme switch
- Animated investigation pipeline
- Dynamic evidence tree with nodes, links, events and entities

## Backend

- FastAPI
- SQLite
- Local TF-IDF hybrid retrieval
- Sentence-level evidence scoring
- Event retrieval
- Contradiction detector
- Causal chain builder
- Root-cause/evidence answer engine
- Audit logging

## Demo questions

Try the original challenge questions as well as new questions such as:

- What is the total cloud infrastructure spend in August?
- Who authored the Q4 financial close report?
- What happened on July 1?
- What is the engineering roadmap?
- What documents discuss cloud costs?
- How much did the marketing campaign cost?
- Tell me about customer retention

For topics not represented in the dataset, NEXUS should explicitly report insufficient evidence.

## Windows one-click launcher

If Python and Node.js are installed, double-click `run_nexus.bat`. It creates/uses the Python environment, installs dependencies, starts the backend and frontend, and opens `http://localhost:5173`.
