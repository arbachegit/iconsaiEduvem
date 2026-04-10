-- =====================================================================
-- iconsaiEduven — Pre-geracao de aulas
-- Aplicar APOS 20260409000002_sectors.sql
--
-- Adiciona colunas pra suportar 5 variacoes pre-geradas por (NR, setor,
-- difficulty). O API lesson-fast vai preferir buscar uma variacao
-- random do cache antes de gerar ao vivo. Isso garante:
--   - Zero custo LLM em aulas ja cobertas (99% dos casos apos populacao)
--   - Zero risco de erro de geracao (ja foram validadas)
--   - Resposta rapida (DB query instead of 30s de Claude)
--   - Variedade (5 versoes por par → aluno ve diferente se voltar)
-- =====================================================================

ALTER TABLE eduven.lessons
  ADD COLUMN IF NOT EXISTS variation_index int,
  ADD COLUMN IF NOT EXISTS is_pregenerated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count int NOT NULL DEFAULT 0;

-- Index pra lookup rapido: por NR + sector + difficulty + pregenerated
CREATE INDEX IF NOT EXISTS idx_lessons_cache
  ON eduven.lessons (nr_id, sector_id, difficulty, is_pregenerated)
  WHERE is_pregenerated = true;

-- Unique constraint: nao duplicar variacao (nr, sector, difficulty, variation_index)
-- quando is_pregenerated = true. Isso evita rerun do script gerando duplicatas.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_lessons_variation
  ON eduven.lessons (nr_id, sector_id, difficulty, variation_index)
  WHERE is_pregenerated = true;

-- RPC pra selecionar uma aula pre-gerada random
CREATE OR REPLACE FUNCTION eduven.pick_random_pregenerated_lesson(
  p_nr_id smallint,
  p_sector_id smallint,
  p_difficulty text
)
RETURNS TABLE (
  id bigint,
  nr_id smallint,
  sector_id smallint,
  title text,
  difficulty text,
  sections jsonb,
  rag_chunks_used jsonb,
  variation_index int
)
LANGUAGE sql STABLE AS $$
  SELECT
    l.id, l.nr_id, l.sector_id, l.title, l.difficulty,
    l.sections, l.rag_chunks_used, l.variation_index
  FROM eduven.lessons l
  WHERE l.nr_id = p_nr_id
    AND l.sector_id = p_sector_id
    AND l.difficulty = p_difficulty
    AND l.is_pregenerated = true
    AND jsonb_array_length(l.sections) >= 6
  ORDER BY random()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION eduven.pick_random_pregenerated_lesson(smallint, smallint, text)
  TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

COMMENT ON COLUMN eduven.lessons.variation_index IS
  '0-4 = variacao pre-gerada (5 por NR/setor/difficulty). NULL = aula live gerada sob demanda.';
COMMENT ON COLUMN eduven.lessons.is_pregenerated IS
  'True = aula criada pelo script scripts/pregenerate-lessons.ts. False = gerada live pelo usuario.';
COMMENT ON COLUMN eduven.lessons.view_count IS
  'Incrementa sempre que a aula eh servida (cache hit). Metrica de uso.';
