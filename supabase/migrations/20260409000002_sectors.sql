-- =====================================================================
-- iconsaiEduven — Setores e relevancia NR x Setor
-- Aplicar APOS 20260409000001_match_nr_chunks_rpc.sql
--
-- Cria 4 setores POC + tabela N:M de relevancia + adiciona sector_id
-- na tabela lessons.
-- =====================================================================

-- 1. SETORES (catalogo POC)
CREATE TABLE IF NOT EXISTS eduven.sectors (
  id                smallint     PRIMARY KEY,
  slug              text         UNIQUE NOT NULL,
  name              text         NOT NULL,
  description       text         NOT NULL,         -- contexto pedagogico
  example_companies text         NOT NULL,         -- ex: "Construtora Tegra, MRV, OAS"
  typical_jobs      jsonb        NOT NULL,         -- ['pedreiro', 'mestre de obras', ...]
  cnae_codes        jsonb        NOT NULL DEFAULT '[]'::jsonb,  -- futuro: lookup por CNPJ
  created_at        timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sectors_slug ON eduven.sectors(slug);

-- Seed dos 4 setores POC
INSERT INTO eduven.sectors (id, slug, name, description, example_companies, typical_jobs, cnae_codes) VALUES
(1, 'construcao_civil',
   'Construcao Civil',
   'Empresas que executam obras: predios residenciais, comerciais, infraestrutura, reformas. Trabalho intensivo no canteiro de obras com riscos de queda de altura, eletricidade, maquinas pesadas, escavacao e materiais perigosos. Equipe rotativa, alta incidencia de terceirizacao.',
   'Construtora MRV, Tegra, Cyrela, OAS, empreiteira de bairro, autonomo de reforma',
   '["pedreiro","servente","mestre de obras","carpinteiro","armador","operador de grua","eletricista de obra","encanador","gesseiro","encarregado","engenheiro residente","tecnico em seguranca do trabalho"]'::jsonb,
   '["41.10-7","41.20-4","42.11-1","42.21-9","43.30-4"]'::jsonb),
(2, 'engenharia_civil',
   'Engenharia Civil (Escritorio de Projetos)',
   'Empresas e profissionais que projetam estruturas, calculam fundacoes, elaboram memoriais, fiscalizam obras de fora. Trabalho majoritariamente em escritorio, com visitas ocasionais ao canteiro. Riscos sao predominantemente ergonomicos (postura prolongada, tela) e ocasionalmente fisicos durante vistorias.',
   'Escritorio de projeto estrutural, consultoria em geotecnia, gerenciadora de obras, autonomo CREA',
   '["engenheiro civil","engenheiro de projeto","calculista","desenhista","estagiario de engenharia","gestor de obras","fiscal de obras","perito"]'::jsonb,
   '["71.11-1","71.12-0","71.19-7"]'::jsonb),
(3, 'industria_calcados',
   'Industria de Calcados',
   'Fabricas que produzem calcados: corte de couro/sintetico, costura, montagem, acabamento. Linhas de producao com maquinas industriais, alta exposicao a agentes quimicos (colas, solventes, tintas), ruido elevado e movimentos repetitivos. Concentrada no Vale dos Sinos (RS), Franca (SP) e Nova Serrana (MG).',
   'Grendene, Azaleia, Beira Rio, Democrata, fabricas de Franca e Nova Serrana',
   '["cortador de couro","costureira industrial","montador de calcado","operador de maquina","auxiliar de producao","supervisor de linha","tecnico em seguranca","quimico responsavel"]'::jsonb,
   '["15.31-9","15.32-7","15.33-5","15.39-4"]'::jsonb),
(4, 'escritorio_contabilidade',
   'Escritorio de Contabilidade',
   'Pequenos e medios escritorios contabeis. Equipe administrativa em mesa o dia inteiro, computador, telefone, contato com cliente. Riscos predominantemente ergonomicos (postura, LER/DORT, vista cansada) e psicossociais (prazo, atendimento). Risco fisico baixo, mas obrigacoes de NR de incendio, sanitarias e sinalizacao se aplicam.',
   'Escritorio Contabil Silva e Souza, Contabilizei, escritorio de bairro, autonomo CRC',
   '["contador","tecnico em contabilidade","auxiliar contabil","analista fiscal","analista trabalhista","atendente","estagiario","socio diretor"]'::jsonb,
   '["69.20-6"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. RELEVANCIA NR x SETOR
CREATE TABLE IF NOT EXISTS eduven.nr_sector_relevance (
  nr_id     smallint NOT NULL REFERENCES eduven.nrs(id) ON DELETE CASCADE,
  sector_id smallint NOT NULL REFERENCES eduven.sectors(id) ON DELETE CASCADE,
  relevance smallint NOT NULL CHECK (relevance BETWEEN 0 AND 5),
                                                -- 0=irrelevante, 1=tangencial, 5=critica
  rationale text     NOT NULL,                  -- explicacao curta
  classified_by text NOT NULL DEFAULT 'llm',    -- 'llm' | 'human' | 'override'
  classified_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (nr_id, sector_id)
);
CREATE INDEX IF NOT EXISTS idx_nrsector_sector ON eduven.nr_sector_relevance(sector_id);
CREATE INDEX IF NOT EXISTS idx_nrsector_relevance ON eduven.nr_sector_relevance(relevance DESC);

-- 3. LESSONS ganha sector_id
ALTER TABLE eduven.lessons
  ADD COLUMN IF NOT EXISTS sector_id smallint REFERENCES eduven.sectors(id);
CREATE INDEX IF NOT EXISTS idx_lessons_sector ON eduven.lessons(sector_id);

-- 4. Reload do schema cache
NOTIFY pgrst, 'reload schema';

COMMENT ON TABLE eduven.sectors IS
  'Setores POC para aulas adaptativas. 4 entradas iniciais. Futuro: lookup por CNPJ via cnae_codes.';
COMMENT ON TABLE eduven.nr_sector_relevance IS
  'Relevancia (0-5) de cada NR para cada setor. Populado por LLM, revisado por humano.';
