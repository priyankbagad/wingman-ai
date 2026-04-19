# Wingman AI

AI meeting prep agent for sales reps. Type a company name → get a structured briefing built from CRM notes, contacts, and semantic context.

## Architecture

```
Sales rep types company name
        ↓
  Express backend
        ↓
  Supabase (accounts, contacts, notes)
        ↓
  Gemini API → embed query → pgvector similarity search
        ↓
  Claude API → structured briefing
```

## Tech stack

| Layer | Tech |
|-------|------|
| Database | Supabase (PostgreSQL + pgvector) |
| Backend | Node.js / Express |
| Embeddings | Gemini `text-embedding-004` (768 dims) |
| Briefing | Claude claude-sonnet-4-6 |

---

## Day 1 Setup — Database

### Prerequisites
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Run the schema

Open your Supabase project → **SQL Editor** → paste and run `backend/supabase/schema.sql`.

This creates:
- `accounts` — company CRM records
- `contacts` — people at each account
- `notes` — call summaries and observations, with a `vector(768)` column for semantic search
- `match_notes()` — SQL function for cosine similarity search
- ivfflat index on `notes.embedding`

### 2. Seed mock data

In the same SQL Editor, paste and run `backend/supabase/seed.sql`.

Seeds 5 accounts:

| Account | Industry | Health | Story |
|---------|----------|--------|-------|
| **Meridian Logistics** | Supply Chain | 3/10 | **Hero demo** — renewal in 18 days, API bug, frustrated VP |
| Helix Biotech | Life Sciences | 9/10 | Healthy, wants EU expansion |
| Crestwood Media | Media | 6/10 | Stable, UX concerns |
| Pinnacle Legal Group | Legal | 4/10 | At-risk, low seat utilization |
| Vantage Retail Co. | Retail | 1/10 | Churned, win-back candidate |

### 3. Get your Supabase keys

**Project Settings → API** → copy:
- `Project URL` → `SUPABASE_URL`
- `anon / public` key → `SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure environment

```bash
cd backend
cp .env.example .env
# fill in your keys
```

---

## Day 2 Preview — Backend API

- `POST /api/brief` — accepts `{ company }`, returns structured briefing
- Gemini embeds the company name query
- pgvector `match_notes()` retrieves the 5 most semantically relevant notes
- Claude generates a briefing: deal health, key contacts, risks, talking points

## Day 3 Preview — Frontend

Minimal React UI: search box → briefing card.

---

## Project structure

```
wingman-ai/
  backend/
    package.json
    .env.example
    supabase/
      schema.sql      ← run first
      seed.sql        ← run second
    src/              ← Day 2
  frontend/           ← Day 3
  README.md
```
