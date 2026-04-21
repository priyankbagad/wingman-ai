# Wingman — AI Meeting Prep Agent

> Your AI co-pilot before every sales call.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-wingman.priyankbagad.com-6366f1?style=flat-square)](https://wingman.priyankbagad.com)
[![GitHub](https://img.shields.io/badge/GitHub-priyankbagad%2Fwingman--ai-24292e?style=flat-square&logo=github)](https://github.com/priyankbagad/wingman-ai)

---

## What it does

Sales reps spend hours before every call digging through CRM notes, Googling recent news, and piecing together account context — only to walk into the meeting with a patchwork of information that may be incomplete or stale. Wingman solves this by generating a complete, structured pre-meeting brief in seconds, pulling from CRM data, live news, and AI reasoning all at once.

Wingman connects to your CRM (Salesforce, HubSpot, or Pipedrive), retrieves the account's full history using semantic vector search, fetches live news about the company, and hands everything to Claude to generate a human-readable briefing. The output includes an account overview, a risk score with reasoning, specific talk track opening lines, and the five most relevant CRM notes ranked by semantic similarity — not just recency.

What makes Wingman different is the combination of RAG-powered retrieval and multi-model AI reasoning. Rather than summarizing a flat dump of notes, Wingman uses Gemini embeddings to surface the most contextually relevant information before Claude ever sees it. The result is a briefing that reads like it was written by a colleague who actually did the research.

---

## Features

| Feature | Description |
|---|---|
| **Instant AI Briefing** | Structured pre-meeting brief generated from CRM data, contacts, and notes |
| **Risk Scoring** | Claude scores each account 1–10 (Critical / High / Medium / Low) with specific reasons |
| **Live News Pulse** | Real-time Google News headlines fetched via Serper before every meeting |
| **Verbatim Talk Tracks** | 3 specific, human-sounding opening lines tailored to each account's situation |
| **Semantic CRM Search** | pgvector RAG retrieves the top 5 most relevant notes by cosine similarity |
| **Multi-CRM Support** | Salesforce, HubSpot, and Pipedrive normalized through a vendor adapter layer |

---

## Architecture

```
┌─────────────────────┐         ┌─────────────────────────────────┐
│   Frontend          │         │   Backend                       │
│   React + Vite      │──────→  │   Node.js + Express             │
│   Vercel            │         │   Railway                       │
└─────────────────────┘         └────────────┬────────────────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────┐
              │                              │                      │
              ▼                              ▼                      ▼
   ┌─────────────────┐          ┌────────────────────┐   ┌──────────────────┐
   │  Supabase       │          │  Google Gemini     │   │  Anthropic       │
   │  PostgreSQL     │          │  text-embedding    │   │  Claude Sonnet   │
   │  + pgvector     │          │  768-dim vectors   │   │  Briefing + Risk │
   └─────────────────┘          └────────────────────┘   └──────────────────┘
                                                                   │
                                                          ┌────────▼─────────┐
                                                          │  Serper API      │
                                                          │  Google News     │
                                                          │  (live results)  │
                                                          └──────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS v4 | SPA with dark-theme UI |
| **UI Components** | shadcn/ui + Aceternity UI | Spotlight cards, hover effects, animated components |
| **Animation** | Motion (Framer Motion) + Three.js | Canvas reveal, lamp effect, noise background |
| **Backend** | Node.js + Express | REST API, orchestration layer |
| **Database** | Supabase PostgreSQL + pgvector | Account storage + vector similarity search |
| **Embeddings** | Google Gemini `gemini-embedding-001` | 768-dim note embeddings for RAG |
| **AI Reasoning** | Anthropic Claude `claude-sonnet-4-6` | Briefing generation, risk scoring, talk tracks |
| **News** | Serper API (Google News) | Live pre-meeting company intelligence |
| **Deployment** | Vercel (frontend) + Railway (backend) | Production hosting |
| **DNS** | GoDaddy custom domain | `wingman.priyankbagad.com` |

---

## How it Works

Wingman uses a retrieval-augmented generation (RAG) pipeline to ensure Claude only reasons over the most relevant context for each meeting.

**1. Store CRM data**
Account records, contacts, and notes are stored in Supabase PostgreSQL. Each note captures call summaries, email threads, meeting recaps, and deal context as free text.

**2. Embed notes with Gemini**
A backfill script runs `gemini-embedding-001` on every note and stores the resulting 768-dimension vector in a `pgvector` column. An IVFFlat index enables fast approximate nearest-neighbor search.

**3. Embed the query**
When a user opens an account, the company name is embedded using the same Gemini model, producing a query vector in the same 768-dim space.

**4. Retrieve top-5 semantically similar notes**
pgvector's cosine distance operator finds the five notes most semantically similar to the query — not just the five most recent. The `match_notes` SQL function returns each note with its similarity score.

**5. Generate the briefing**
Claude receives the full account context and runs three parallel inference calls to produce the briefing, risk analysis, and talk track simultaneously.

```
Account metadata
+ Contacts
+ Top-5 semantic notes          →  Claude (3x parallel)  →  Briefing (Markdown)
+ Live news (Serper)                                         Risk Score + Reasons
                                                             Talk Track (3 lines)
```

---

## Multi-CRM Architecture

Real-world CRM data is messy: Salesforce uses `FirstName` + `LastName`, HubSpot nests everything under `properties.*`, and Pipedrive stores emails as an array. Wingman's adapter layer normalizes all three vendors to a single internal schema before any business logic runs.

```
Salesforce raw data  →  SalesforceAdapter  ─┐
HubSpot raw data     →  HubSpotAdapter     ──┼──→  Wingman internal schema  →  Backend
Pipedrive raw data   →  PipedriveAdapter   ─┘
```

Each adapter exposes three functions:

| Function | Maps from | Maps to |
|---|---|---|
| `adaptAccounts()` | Vendor account fields | `{ id, name, industry, contractValue, renewalDate, healthScore }` |
| `adaptContacts()` | Vendor contact fields | `{ name, role, email, isPrimary }` |
| `adaptNotes()` | Vendor activity/engagement fields | `{ content, createdAt, type }` |

The backend never checks which CRM the data came from — it always receives the same normalized schema. Adding a new CRM requires only a single adapter file.

---

## Local Development

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project (free tier works)
- [Anthropic API key](https://console.anthropic.com)
- [Google AI Studio API key](https://aistudio.google.com) (Gemini)
- [Serper API key](https://serper.dev) *(optional — News Pulse disabled without it)*

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/priyankbagad/wingman-ai.git
cd wingman-ai
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
# Edit .env and fill in your API keys (see table below)
```

**4. Set up the database**

Open your Supabase project's SQL editor and run these two files in order:
```
backend/supabase/schema.sql   # Creates tables, pgvector index, and match_notes function
backend/supabase/seed.sql     # Seeds 5 demo accounts, 11 contacts, and 15 notes
```

**5. Backfill embeddings**

Populate the `embedding` column on all seeded notes:
```bash
node src/scripts/backfill-embeddings.js
```

**6. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

**7. Start both servers**

In `backend/`:
```bash
npm run dev   # Express on http://localhost:3001
```

In `frontend/`:
```bash
npm run dev   # Vite on http://localhost:5173
```

### Environment Variables

All variables go in `backend/.env`.

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Your Supabase project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key for admin DB access |
| `GEMINI_API_KEY` | Yes | Google AI Studio key for `gemini-embedding-001` |
| `ANTHROPIC_API_KEY` | Yes | Anthropic key for Claude `claude-sonnet-4-6` |
| `SERPER_API_KEY` | No | Serper key for live Google News — News Pulse disabled if unset |
| `PORT` | No | HTTP port for Express (defaults to `3001`) |

Frontend environment (`frontend/.env.local`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://wingmanapi.priyankbagad.com` | Backend base URL |

---

## API Reference

### `GET /health`

Health check.

```json
{ "status": "ok" }
```

---

### `GET /api/accounts`

Returns all accounts stored in Supabase.

```json
{
  "accounts": [
    {
      "id": "uuid",
      "name": "Meridian Logistics",
      "industry": "Logistics",
      "contract_value": 120000,
      "renewal_date": "2025-03-15",
      "health_score": 3
    }
  ]
}
```

---

### `POST /api/brief`

Generates a complete pre-meeting briefing for an account.

**Request body**
```json
{
  "company": "Meridian Logistics",
  "crmAccount": { }
}
```

`company` (string, required) — Account name to search.  
`crmAccount` (object, optional) — If provided from a CRM flow, skips Supabase lookup and uses this data directly.

**Response**
```json
{
  "account": {
    "name": "Meridian Logistics",
    "industry": "Logistics",
    "contract_value": 120000,
    "renewal_date": "2025-03-15",
    "health_score": 3
  },
  "contacts": [
    { "name": "Jordan Kim", "role": "VP Operations", "email": "jkim@meridian.com", "is_primary": true }
  ],
  "notes_used": [
    { "content": "...", "similarity": 0.89, "created_at": "2024-11-01" }
  ],
  "briefing": "## Account Overview\n...",
  "risk_analysis": {
    "score": 7,
    "level": "high",
    "reasons": ["Missed renewal call", "Support ticket spike"],
    "recommendation": "Schedule executive business review before renewal date."
  },
  "talk_track": [
    "Jordan, I saw the Q3 logistics report — how did the Miami hub expansion land?",
    "...",
    "..."
  ],
  "news": [
    { "title": "...", "snippet": "...", "date": "2025-01-10", "url": "https://..." }
  ]
}
```

---

### `GET /api/crm/accounts/:crm`

Returns mock CRM accounts normalized through the adapter layer.

`crm` — one of `salesforce`, `hubspot`, `pipedrive`

```json
{
  "crm": "salesforce",
  "label": "Salesforce",
  "tier": "Enterprise",
  "accounts": [{ "id": "...", "name": "...", "contacts": [], "notes": [] }]
}
```

---

## Database Schema

```sql
-- Accounts
CREATE TABLE accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  industry       TEXT,
  contract_value INTEGER,
  renewal_date   DATE,
  health_score   INTEGER CHECK (health_score BETWEEN 1 AND 10),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT,
  email      TEXT
);

-- Notes with pgvector embeddings
CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  embedding  vector(768)
);

-- IVFFlat index for fast approximate cosine search
CREATE INDEX ON notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Demo Accounts

The seed data covers five B2B scenarios across the health spectrum:

| Account | Industry | Health | Scenario |
|---|---|---|---|
| Meridian Logistics | Logistics | 3/10 | Churn risk — hero demo account |
| Helix Biotech | Biotechnology | 9/10 | Healthy — expansion candidate |
| Crestwood Media | Media | 6/10 | Stable — UX concerns flagged |
| Pinnacle Legal Group | Legal Services | 4/10 | At-risk — low engagement |
| Vantage Retail Co. | Retail | 1/10 | Critical — win-back scenario |

---

## Project Structure

```
wingman-ai/
├── backend/
│   ├── src/
│   │   ├── index.js                  # Express entry point
│   │   ├── routes/
│   │   │   ├── accounts.js           # GET /api/accounts
│   │   │   ├── brief.js              # POST /api/brief (RAG pipeline)
│   │   │   └── crm.js                # GET /api/crm/accounts/:crm
│   │   ├── services/
│   │   │   ├── claude.js             # Briefing, risk, talk track generation
│   │   │   ├── embed.js              # Gemini text embeddings
│   │   │   ├── news.js               # Serper live news
│   │   │   └── supabase.js           # DB client
│   │   ├── adapters/
│   │   │   ├── salesforce.js
│   │   │   ├── hubspot.js
│   │   │   └── pipedrive.js
│   │   └── scripts/
│   │       └── backfill-embeddings.js
│   └── supabase/
│       ├── schema.sql
│       └── seed.sql
└── frontend/
    └── src/
        ├── App.jsx                   # State management + routing
        ├── pages/
        │   ├── Landing.jsx
        │   └── CrmSelect.jsx
        ├── components/ui/            # shadcn/ui primitives
        └── ui/                       # Aceternity animated components
```

---

## Built by

**Priyank Bagad**  
MS Computer Software Engineering, Northeastern University  
[priyankbagad.com](https://priyankbagad.com) · [LinkedIn](https://linkedin.com/in/priyankbagad) · [GitHub](https://github.com/priyankbagad)
