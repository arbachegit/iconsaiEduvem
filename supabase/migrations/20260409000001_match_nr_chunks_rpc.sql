-- =====================================================================
-- iconsaiEduven — RPC function para busca vetorial
-- Aplicar APOS 20260409000000_eduven_init.sql
-- =====================================================================

CREATE OR REPLACE FUNCTION eduven.match_nr_chunks(
  query_embedding vector(1536),
  nr_filter       smallint DEFAULT NULL,    -- filtra por uma NR especifica (1, 5, 10, ...)
  match_count     int      DEFAULT 6,       -- top-K
  min_similarity  float    DEFAULT 0.3      -- limiar minimo de similaridade
)
RETURNS TABLE (
  id           bigint,
  nr_id        smallint,
  chapter      text,
  section_type text,
  content      text,
  token_count  int,
  breadcrumb   jsonb,
  similarity   float
)
LANGUAGE sql STABLE AS $$
  SELECT
    c.id,
    c.nr_id,
    c.chapter,
    c.section_type,
    c.content,
    c.token_count,
    c.breadcrumb,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM eduven.nr_chunks c
  WHERE
    c.embedding IS NOT NULL
    AND (nr_filter IS NULL OR c.nr_id = nr_filter)
    AND (1 - (c.embedding <=> query_embedding)) >= min_similarity
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Grant para que service_role possa chamar via PostgREST RPC
GRANT EXECUTE ON FUNCTION eduven.match_nr_chunks(vector, smallint, int, float)
  TO anon, authenticated, service_role;

-- Reload schema cache para o PostgREST enxergar a nova funcao
NOTIFY pgrst, 'reload schema';

COMMENT ON FUNCTION eduven.match_nr_chunks IS
  'Busca vetorial cosine em eduven.nr_chunks. Retorna top-K chunks mais similares ao embedding fornecido, opcionalmente filtrando por nr_id.';
