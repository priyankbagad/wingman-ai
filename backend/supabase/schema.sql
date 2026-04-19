-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  industry        TEXT,
  contract_value  INTEGER,
  renewal_date    DATE,
  health_score    INTEGER CHECK (health_score BETWEEN 1 AND 10),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT,
  email       TEXT
);

-- Notes table with vector embedding for semantic search
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  embedding   vector(768)
);

-- ivfflat index for fast approximate nearest-neighbor search
-- lists=100 is a good default for up to ~1M rows; tune as data grows
CREATE INDEX IF NOT EXISTS notes_embedding_idx
  ON notes
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Match notes function used by the backend for semantic search
CREATE OR REPLACE FUNCTION match_notes(
  query_embedding vector(768),
  filter_account_id UUID DEFAULT NULL,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id          UUID,
  account_id  UUID,
  content     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE,
  similarity  FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    n.id,
    n.account_id,
    n.content,
    n.created_at,
    1 - (n.embedding <=> query_embedding) AS similarity
  FROM notes n
  WHERE
    (filter_account_id IS NULL OR n.account_id = filter_account_id)
    AND n.embedding IS NOT NULL
  ORDER BY n.embedding <=> query_embedding
  LIMIT match_count;
$$;
