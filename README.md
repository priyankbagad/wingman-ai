# Wingman -- AI Meeting Prep Agent

> Your AI co-pilot before every sales call.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-wingman.priyankbagad.com-6366f1?style=flat-square)](https://wingman.priyankbagad.com)
[![GitHub](https://img.shields.io/badge/GitHub-priyankbagad%2Fwingman--ai-24292e?style=flat-square&logo=github)](https://github.com/priyankbagad/wingman-ai)

---

## Problem Statement

A friend of mine has been in B2B sales for ten years. He is genuinely good at his job but he still spends 30 minutes before every call piecing together account context from a dozen different places. He opens Salesforce, scrolls through notes, Googles the company, checks his email threads, and tries to remember what was said two calls ago. Watching him do this is what made me want to build Wingman.

Sales reps do a lot of invisible work before every call. They dig through CRM notes, Google the company, check LinkedIn, and try to piece together a coherent picture of the account from a dozen different places. This easily takes 30 to 60 minutes per meeting, and even after all of that, the briefing they walk in with is usually incomplete or stale.

The people most affected are B2B SaaS account executives and customer success managers with large books of business. When you have 10 to 15 accounts on the calendar each week, that prep time adds up fast, and it is time taken directly away from selling.

The problem is not that reps do not care. It is that the information they need is scattered across CRM notes, news articles, and email threads, and there is no good way to quickly synthesize it into something actionable.

Wingman solves this by generating a complete pre-meeting brief in under 10 seconds. Success looks like this: a rep opens Wingman five minutes before a call, reads the brief, and walks in knowing the account health, recent company news, the biggest risks to the relationship, and three specific opening lines tailored to that account. The measure is simple: prep time drops from 30 to 60 minutes to under a minute, and the rep walks in better prepared, not just faster.

---

## Solution Overview

Wingman connects to a CRM (Salesforce, HubSpot, or Pipedrive), pulls the account's full history using semantic vector search, fetches live news about the company, and sends everything to Claude to generate a structured briefing. The output includes an account overview, a risk score with specific reasoning, verbatim talk track opening lines, and the five most relevant CRM notes ranked by semantic similarity rather than recency.

AI is not supplementary here. It is the core of the product. Without AI, you get a data dump. With AI, you get judgment: which notes actually matter for this meeting, what the risk signals are, and what to say when you open the call.

What makes this meaningfully better than a non-AI approach: traditional CRM reporting surfaces everything chronologically, which means a rep has to read through 15 notes to find the two that matter. Wingman uses semantic search to surface the most contextually relevant notes first, then Claude reasons over that curated context to produce something that reads like it was written by a colleague who actually did the research.

---

## AI Integration

**Models and APIs:**
- Google Gemini `gemini-embedding-001` for generating 768-dimensional note embeddings
- Anthropic Claude `claude-sonnet-4-6` for briefing generation, risk analysis, and talk track generation
- Serper API for live Google News results
- Supabase pgvector for vector similarity search at query time

**Why these choices:**
I chose Gemini for embeddings because it offers strong quality on a generous free tier, and 768 dimensions hit a good balance between accuracy and storage cost. I chose Claude for the reasoning layer because it produces reliable structured JSON output. The risk analysis and talk track both need to come back in a specific schema, and Claude handles that consistently without needing fragile parsing logic.

**Patterns used:**
This is a RAG pipeline with parallel multi-step reasoning. The flow is: embed the query, retrieve the top-5 semantically similar notes via cosine similarity, then fan out to three parallel Claude calls (briefing, risk analysis, talk track) so the total latency stays close to the cost of one call. All three run inside a single `Promise.all`, which brings end-to-end time down to roughly 3 to 5 seconds instead of 12.

**Tradeoffs considered:**
- Cost per briefing lands around $0.002 to $0.004 depending on note length. That is acceptable for a sales tool where the time saved per call is worth far more.
- Using two AI providers adds operational complexity. The split makes sense because Gemini's embedding model outperforms what was available through the Anthropic API for this use case, but it does mean two API keys and two failure modes to handle.
- The three Claude calls in `Promise.all` mean that if one fails, all three fail. I made this call deliberately: displaying a briefing without a risk score would be confusing and harder to debug than a clean error message.

**Where AI exceeded expectations:**
The talk track output surprised me. I expected generic openers but the prompts I landed on produce lines that reference specific details from CRM notes, including names, dates, and incidents. That specificity is what makes them actually usable on a call.

**Where it fell short:**
Briefing length is hard to control. Claude sometimes writes more than a rep wants to read in five minutes before a call. I iterated on the system prompt several times and got it tighter, but it never fully settled. In a production version I would add a user-configurable length preference passed directly into the prompt.

---

## Architecture and Design Decisions

```
+---------------------+         +---------------------------------+
|   Frontend          |         |   Backend                       |
|   React + Vite      |-------> |   Node.js + Express             |
|   Vercel            |         |   Railway                       |
+---------------------+         +----------------+----------------+
                                                 |
              +----------------------------------+-------------------+
              |                                 |                   |
              v                                 v                   v
   +------------------+          +--------------------+   +-----------------+
   |  Supabase        |          |  Google Gemini     |   |  Anthropic      |
   |  PostgreSQL      |          |  text-embedding    |   |  Claude Sonnet  |
   |  + pgvector      |          |  768-dim vectors   |   |  Briefing+Risk  |
   +------------------+          +--------------------+   +-----------------+
                                                                  |
                                                         +--------v--------+
                                                         |  Serper API     |
                                                         |  Google News    |
                                                         +-----------------+
```

**Multi-CRM adapter layer:** Real CRM data is inconsistent across vendors. Salesforce uses `FirstName` + `LastName`, HubSpot nests everything under `properties.*`, and Pipedrive stores emails as an array. Rather than scattering vendor-specific logic throughout the codebase, I built an adapter layer that normalizes all three to a single internal schema before any business logic runs. Adding a fourth CRM requires one new adapter file and nothing else. The adapters currently work with mock records that simulate each CRM's API response shape. In a production version, the adapters would receive data from a live OAuth-authenticated API call. The business logic and normalization layer do not change at all — wiring up real data is an integration step, not a rewrite.

**Parallel Claude calls:** The briefing, risk analysis, and talk track run in a single `Promise.all`. This keeps user-facing latency to roughly the cost of one LLM call instead of three sequential ones.

**pgvector over full-text search:** CRM notes are written inconsistently. A note that says "Sarah mentioned budget concerns" should surface when the query is about financial risk, even though it never uses those words. Semantic vector search handles this. An IVFFlat index on the embedding column keeps search fast as the notes table grows.

**CRM fast-path:** When a user comes through the CRM selection flow, the account data is already in memory from the adapter normalization step. The backend has a fast-path that skips the Supabase lookup entirely and uses the CRM data directly, cutting database round trips in half for that flow.

**Assumptions made:** The demo uses mock CRM records rather than live OAuth integrations. In a real deployment, the adapters would receive data from a live CRM API call. The interface is identical, so wiring up real data is a matter of adding OAuth, not rewriting business logic.

---

## What AI Helped Me Build Faster

I used Claude Code throughout this project as my primary coding tool.

**Where it moved fast:** Boilerplate I knew the shape of but did not want to type out. Express route scaffolding, Tailwind component structure, the SQL schema and seed data. I described what I wanted and got back something close to correct on the first try. The multi-CRM adapter pattern was something I sketched conceptually, and once Claude Code understood the normalization goal, it generated all three adapter files quickly. Writing the Vitest mock setup for Supabase's chained calls (`.from().select().ilike().limit()`) was another place where it saved real time -- getting that chainable mock structure right by hand would have taken a frustrating amount of trial and error.

**Where it got in the way:** Prompt engineering for the Claude services was something I had to own entirely. AI coding tools generate code that calls LLMs, but they cannot tell you whether the LLM output is actually good. I went through many versions of the risk analysis and talk track prompts by running them manually and reading the output. The tool also had a tendency to over-engineer things. Early versions of the backend had abstraction layers I did not ask for and did not need, and I spent time removing them.

**How it changed my approach:** I wrote less throw-away exploratory code and more working code from the start. The cost of "let me just try this approach" dropped enough that I explored design options I might have skipped in a weekend project. The CRM adapter pattern is a good example of that. I would not have built that abstraction without AI assistance making the scaffolding fast enough to be worth doing.

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project (free tier works)
- [Anthropic API key](https://console.anthropic.com)
- [Google AI Studio API key](https://aistudio.google.com) (Gemini)
- [Serper API key](https://serper.dev) *(optional -- News Pulse is disabled without it)*

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
| `SERPER_API_KEY` | No | Serper key for live Google News (News Pulse disabled if unset) |
| `PORT` | No | HTTP port for Express (defaults to `3001`) |

Frontend environment (`frontend/.env.local`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://wingmanapi.priyankbagad.com` | Backend base URL |

---

## Demo

The live app is at [wingman.priyankbagad.com](https://wingman.priyankbagad.com).

**To try the demo:**

1. Open the app and pick a CRM from the landing screen (Salesforce, HubSpot, or Pipedrive).
2. Select an account from the dashboard. Each one is a different scenario:

| Account | Health | Scenario |
|---|---|---|
| Meridian Logistics | 3/10 | Churn risk. Best demo account -- lots of red flags in the notes. |
| Vantage Retail Co. | 1/10 | Critical. Win-back scenario, account is nearly gone. |
| Helix Biotech | 9/10 | Healthy expansion candidate. Good for showing the contrast. |
| Crestwood Media | 6/10 | Stable but with UX concerns surfacing in recent notes. |
| Pinnacle Legal Group | 4/10 | At-risk, low engagement. |

3. Click "Generate Brief" and wait 3 to 5 seconds.
4. The brief includes an account overview, a risk score with specific reasons, live news headlines, the five most relevant CRM notes ranked by semantic similarity, and three verbatim talk track lines.

To test the Supabase path directly without going through the CRM selection flow:
```bash
curl -X POST http://localhost:3001/api/brief \
  -H "Content-Type: application/json" \
  -d '{"company": "Meridian Logistics"}'
```

---

## Testing and Error Handling

Run the full test suite:
```bash
cd backend && npm test
```

There are 55 tests across four files, all passing with no live API calls required.

**Adapter tests** (`src/adapters/__tests__/`) cover each CRM normalization function: valid input, empty arrays, missing optional fields, and vendor-specific behavior like HubSpot's nested `properties.*` structure, Pipedrive's email array format, and HubSpot's engagement type lowercasing. These are pure unit tests with no mocking.

**Brief route tests** (`src/routes/__tests__/brief.test.js`) cover both execution paths with all four external services mocked (Supabase, Gemini, Claude, Serper). Error cases covered:

- Missing or whitespace-only company name (400)
- Account not found in database (404)
- Supabase connection failure on account lookup (500)
- Contacts fetch failure (500)
- pgvector search failure (500)
- Claude API failure on both the Supabase path and the CRM fast-path (500)
- Empty notes and empty news returning gracefully without errors
- CRM fast-path correctly skipping Supabase entirely

The main production failure mode worth flagging: since the three Claude calls run in `Promise.all`, one timeout takes down all three. This is intentional. A briefing missing its risk score is more confusing for a user than a clean error message with a retry option.

---

## Future Improvements

**Real CRM OAuth integrations.** The adapters are already built for live data, but the app currently uses mock records. Connecting to the actual Salesforce or HubSpot API would make this production-ready. The normalization layer does not need to change at all.

**Briefing length control.** A user preference (brief vs. detailed) passed into the Claude system prompt would make the output more useful across different rep styles. Some people want three bullet points; others want a full page.

**Embedding freshness.** The backfill script runs once at setup. A webhook or scheduled job that re-embeds new notes as they land in the CRM would keep the semantic search current without manual steps.

**Saved briefings.** Right now the briefing disappears when you navigate away. Storing generated briefings in Supabase would let reps review prep from past meetings and track how account health changes over time.

**Calendar or Slack integration.** The highest-value delivery for a pre-meeting brief is probably not a web app. Sending the brief automatically 30 minutes before a calendar event would make it truly zero-effort for the rep.

---

## API Reference

### `GET /health`

```json
{ "status": "ok" }
```

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

### `POST /api/brief`

Generates a complete pre-meeting briefing for an account.

**Request body**
```json
{
  "company": "Meridian Logistics",
  "crmAccount": {}
}
```

`company` (string, required) -- Account name to search.
`crmAccount` (object, optional) -- If provided from a CRM flow, skips Supabase lookup and uses this data directly.

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
    { "name": "Jordan Kim", "role": "VP Operations", "email": "jkim@meridian.com" }
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
    "Jordan, I saw the Q3 logistics report -- how did the Miami hub expansion land?",
    "...",
    "..."
  ],
  "news": [
    { "title": "...", "snippet": "...", "date": "2025-01-10", "url": "https://..." }
  ]
}
```

### `GET /api/crm/accounts/:crm`

Returns mock CRM accounts normalized through the adapter layer. `crm` is one of `salesforce`, `hubspot`, `pipedrive`.

---

## Database Schema

```sql
CREATE TABLE accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  industry       TEXT,
  contract_value INTEGER,
  renewal_date   DATE,
  health_score   INTEGER CHECK (health_score BETWEEN 1 AND 10),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT,
  email      TEXT
);

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

## Project Structure

```
wingman-ai/
+-- backend/
|   +-- src/
|   |   +-- index.js                  # Express entry point
|   |   +-- routes/
|   |   |   +-- accounts.js           # GET /api/accounts
|   |   |   +-- brief.js              # POST /api/brief (RAG pipeline)
|   |   |   +-- crm.js                # GET /api/crm/accounts/:crm
|   |   +-- services/
|   |   |   +-- claude.js             # Briefing, risk, talk track generation
|   |   |   +-- embed.js              # Gemini text embeddings
|   |   |   +-- news.js               # Serper live news
|   |   |   +-- supabase.js           # DB client
|   |   +-- adapters/
|   |   |   +-- salesforce.js
|   |   |   +-- hubspot.js
|   |   |   +-- pipedrive.js
|   |   +-- scripts/
|   |       +-- backfill-embeddings.js
|   +-- supabase/
|       +-- schema.sql
|       +-- seed.sql
+-- frontend/
    +-- src/
        +-- App.jsx                   # State management + routing
        +-- pages/
        |   +-- Landing.jsx
        |   +-- CrmSelect.jsx
        +-- components/ui/            # shadcn/ui primitives
        +-- ui/                       # Aceternity animated components
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

---

## Built by

**Priyank Bagad**
MS Computer Software Engineering, Northeastern University
[priyankbagad.com](https://priyankbagad.com) · [LinkedIn](https://linkedin.com/in/priyankbagad) · [GitHub](https://github.com/priyankbagad)
