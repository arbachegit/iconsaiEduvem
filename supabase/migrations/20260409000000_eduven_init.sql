-- =====================================================================
-- iconsaiEduven — Init migration
-- Schema isolado 'eduven' no banco do iconsaiIcon (hvynozijedvjjhnrtpzs)
-- Idempotente: pode rodar múltiplas vezes sem efeito colateral.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS eduven;
COMMENT ON SCHEMA eduven IS 'iconsaiEduven — curso interativo sobre Normas Regulamentadoras (NR). Schema isolado, portavel via pg_dump -n eduven.';

-- 1. CATÁLOGO DAS NRS
CREATE TABLE IF NOT EXISTS eduven.nrs (
  id              smallint     PRIMARY KEY,
  code            text         UNIQUE NOT NULL,
  title           text         NOT NULL,
  status          text         NOT NULL DEFAULT 'vigente'
                  CHECK (status IN ('vigente','revogada','suspensa')),
  current_portaria text,
  current_portaria_date date,
  source_url      text         NOT NULL,
  pdf_url         text,
  pdf_sha256      text,
  full_text       text,
  metadata        jsonb        NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nrs_status ON eduven.nrs(status);
CREATE INDEX IF NOT EXISTS idx_nrs_code   ON eduven.nrs(code);

-- 2. PDFs BRUTOS
CREATE TABLE IF NOT EXISTS eduven.nr_raw_sources (
  id              bigserial    PRIMARY KEY,
  nr_id           smallint     NOT NULL REFERENCES eduven.nrs(id) ON DELETE CASCADE,
  fetched_at      timestamptz  NOT NULL DEFAULT now(),
  pdf_url         text         NOT NULL,
  pdf_bytes       bytea        NOT NULL,
  pdf_sha256      text         NOT NULL,
  extracted_text  text,
  parser_version  text         NOT NULL DEFAULT 'v1'
);
CREATE INDEX IF NOT EXISTS idx_raw_nr_id ON eduven.nr_raw_sources(nr_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_raw_sha ON eduven.nr_raw_sources(nr_id, pdf_sha256);

-- 3. CHUNKS VETORIZADOS
CREATE TABLE IF NOT EXISTS eduven.nr_chunks (
  id              bigserial    PRIMARY KEY,
  nr_id           smallint     NOT NULL REFERENCES eduven.nrs(id) ON DELETE CASCADE,
  chapter         text         NOT NULL,
  breadcrumb      jsonb        NOT NULL DEFAULT '[]'::jsonb,
  section_type    text         NOT NULL DEFAULT 'item'
                  CHECK (section_type IN ('item','annex','table','header')),
  chunk_index     int          NOT NULL,
  content         text         NOT NULL,
  token_count     int          NOT NULL,
  embedding       vector(1536),
  parser_version  text         NOT NULL DEFAULT 'v1',
  created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON eduven.nr_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chunks_nr ON eduven.nr_chunks(nr_id);
CREATE INDEX IF NOT EXISTS idx_chunks_chapter ON eduven.nr_chunks(chapter);
CREATE INDEX IF NOT EXISTS idx_chunks_content_trgm
  ON eduven.nr_chunks USING gin (content gin_trgm_ops);

-- 4. AULAS GERADAS
CREATE TABLE IF NOT EXISTS eduven.lessons (
  id              bigserial    PRIMARY KEY,
  nr_id           smallint     NOT NULL REFERENCES eduven.nrs(id) ON DELETE CASCADE,
  user_id         text,
  title           text         NOT NULL,
  difficulty      text         NOT NULL DEFAULT 'same'
                  CHECK (difficulty IN ('easier','same','harder')),
  sections        jsonb        NOT NULL,
  rag_chunks_used jsonb        NOT NULL DEFAULT '[]'::jsonb,
  liked           boolean      NOT NULL DEFAULT false,
  favorited       boolean      NOT NULL DEFAULT false,
  archived        boolean      NOT NULL DEFAULT false,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lessons_nr      ON eduven.lessons(nr_id);
CREATE INDEX IF NOT EXISTS idx_lessons_user    ON eduven.lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_favorit ON eduven.lessons(favorited) WHERE favorited;

-- 5. EXERCÍCIOS E SUBMISSÕES
CREATE TABLE IF NOT EXISTS eduven.exercises (
  id                     bigserial    PRIMARY KEY,
  lesson_id              bigint       NOT NULL REFERENCES eduven.lessons(id) ON DELETE CASCADE,
  section_index          int          NOT NULL,
  exercise_type          text         NOT NULL,
  prompt_text            text         NOT NULL,
  expected_solution_json jsonb        NOT NULL,
  hints_json             jsonb        NOT NULL DEFAULT '[]'::jsonb,
  difficulty_score       real,
  created_at             timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON eduven.exercises(lesson_id);

CREATE TABLE IF NOT EXISTS eduven.submissions (
  id              bigserial    PRIMARY KEY,
  exercise_id     bigint       NOT NULL REFERENCES eduven.exercises(id) ON DELETE CASCADE,
  user_id         text,
  user_input      text         NOT NULL,
  is_correct      boolean      NOT NULL,
  score           real,
  error_type      text,
  error_detail    text,
  attempt_number  int          NOT NULL DEFAULT 1,
  created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_submissions_exercise ON eduven.submissions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user     ON eduven.submissions(user_id);

-- 6. LOGS LLM
CREATE TABLE IF NOT EXISTS eduven.llm_call_logs (
  id              bigserial    PRIMARY KEY,
  provider        text         NOT NULL CHECK (provider IN ('anthropic','openai')),
  model_req       text         NOT NULL,
  model_used      text         NOT NULL,
  route           text         NOT NULL,
  latency_ms      int,
  input_tok       int,
  output_tok      int,
  success         boolean      NOT NULL,
  error_msg       text,
  circuit_open    boolean      NOT NULL DEFAULT false,
  created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_llm_logs_route ON eduven.llm_call_logs(route);
CREATE INDEX IF NOT EXISTS idx_llm_logs_created ON eduven.llm_call_logs(created_at DESC);

-- 7. TRIGGERS
CREATE OR REPLACE FUNCTION eduven.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_nrs_updated     ON eduven.nrs;
DROP TRIGGER IF EXISTS trg_lessons_updated ON eduven.lessons;
CREATE TRIGGER trg_nrs_updated     BEFORE UPDATE ON eduven.nrs     FOR EACH ROW EXECUTE FUNCTION eduven.touch_updated_at();
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON eduven.lessons FOR EACH ROW EXECUTE FUNCTION eduven.touch_updated_at();

COMMENT ON TABLE eduven.nrs              IS 'Catalogo das 38 Normas Regulamentadoras brasileiras.';
COMMENT ON TABLE eduven.nr_raw_sources   IS 'PDFs brutos versionados — permite reprocessamento sem refetch.';
COMMENT ON TABLE eduven.nr_chunks        IS 'Chunks vetorizados para RAG. ~1600 chunks totais para as 38 NRs.';
COMMENT ON TABLE eduven.lessons          IS 'Aulas geradas por NR (6 secoes canonicas).';
COMMENT ON TABLE eduven.exercises        IS 'Exercicios estruturados das aulas.';
COMMENT ON TABLE eduven.submissions      IS 'Respostas dos alunos aos exercicios.';
COMMENT ON TABLE eduven.llm_call_logs    IS 'Logs de chamadas LLM (Anthropic/OpenAI fallback).';
