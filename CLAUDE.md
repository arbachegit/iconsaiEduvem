# iconsaiEduven — O Interativo Mundo da NR

**Projeto:** iconsaiEduven
**Curso:** "O Interativo Mundo da NR" — Normas Regulamentadoras brasileiras (NR-1 a NR-38)
**Stack:** Next.js 15 / React 19 / TypeScript / Supabase + pgvector
**Repositório:** github.com/arbachegit/iconsaiEduven

---

## Descricao

Curso interativo sobre as 38 Normas Regulamentadoras (NR) do Ministério do Trabalho. Cada NR é ingerida em chunks vetorizados (pgvector) e o agente da aula consulta via RAG, gerando aulas canonicas de 6 secoes com citacao por item da norma `[NR-X, item Y.Z]`.

---

## REGRA DE OURO — Portabilidade (OBRIGATORIO)

Este projeto **compartilha temporariamente** infra com o iconsaiIcon:

- **Droplet:** `104.236.28.58` (mesmo do icon, porta 3010)
- **Banco:** Supabase `hvynozijedvjjhnrtpzs` (banco do icon)
- **Dominio:** `eduven.iconsai.ai` (Caddy do icon, virtual host novo)

**O codigo NUNCA deve depender desses valores.** Tudo via env vars (`.env.local`):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SCHEMA` (default `eduven`)
- `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_DOMAIN`, `DEPLOY_PATH`, `DEPLOY_SERVICE`
- `AUTH_MODE` (`tools` hoje, `standalone` no futuro)

Quando o projeto provar valor, migrar para droplet e banco proprios = trocar 5 env vars + `pg_dump -n eduven | psql NEW_DB`. **Zero codigo tocado.**

### Schema isolado

Todas as tabelas vivem em `eduven.*` (NUNCA em `public.*`). Migracao = `pg_dump -n eduven`. Reversao = `DROP SCHEMA eduven CASCADE`.

### Proibicoes absolutas

- NUNCA hardcodar `104.236.28.58`, `hvynozijedvjjhnrtpzs`, `3010`, ou `eduven.iconsai.ai` no codigo `.ts`/`.tsx`
- NUNCA criar FK de `eduven.*` para tabelas do icon (auto-suficiente)
- NUNCA modificar tabelas no schema `public` do banco do icon
- NUNCA usar `output: 'export'` (quebra standalone)
- NUNCA usar Vercel

---

## REGRA DE OURO — Aula Canonica

A aula tem **6 secoes fixas**, mesmo template do `iconsaiStats`:

1. Por que isso importa?
2. Entendendo na pratica
3. Passo a passo
4. Exemplo com dados reais (com exercicio)
5. Pontos fortes
6. Desafio Pratico (com exercicio)

**Profundidade adaptativa**, nao "aulas infinitas":

- "Nao entendi" → recap da mesma secao (nao gera nova aula)
- Click em termo → modal stacked com explicacao
- Difficulty `easier|same|harder` → reescrita no nivel certo
- Termo clicavel = `data-term-link="..."` no markdown

Renderizador unico = `LessonView.tsx` (portado do stats canonico). NUNCA criar segundo renderizador.

---

## REGRA DE OURO — Tom Canonico

Aplicado em prompts de geracao, recaps, modais de termos, agentes:

1. Direto sem ser frio. Frases curtas.
2. Honestidade intelectual: tradeoffs explicitos.
3. Posicionamento: sempre uma recomendacao, nunca "depende".
4. Concreto > abstrato.
5. Segunda pessoa quando faz sentido.
6. Sem fillers ("e importante destacar", "vale ressaltar").
7. Humor leve permitido em doses pequenas.
8. Reconhece incerteza ("isso e uma aproximacao").

Definido em `data/domain-configs/nr.ts` `pedagogyRules.lessonSystemPrompt`.

---

## REGRA DE OURO — RAG First

Para cada secao da aula, o agente DEVE:

1. Consultar `lib/nr-rag.ts` `queryNR(question, [nrId])` antes de gerar texto
2. Citar o item exato da norma no formato `[NR-X, item Y.Z]` em CADA paragrafo
3. Salvar IDs dos chunks usados em `eduven.lessons.rag_chunks_used` (rastreabilidade)

**Nao gerar texto sem RAG.** Aula sem citacao de item = invalida.

---

## REGRA DE OURO — Ingestao Idempotente

Pipeline em `scripts/ingest-nr.ts`:

1. Salva PDF bruto em `eduven.nr_raw_sources` (bytea + sha256)
2. Re-rodar so reprocessa NRs com sha256 diferente
3. Mudar parser_version forca re-chunking sem refetch (le do raw)
4. Mudar embedding model forca re-embed sem reparser

**Nunca depender do gov.br estar de pe** para reprocessar.

---

## Estrutura

```
iconsaiEduven/
├── CLAUDE.md
├── next.config.js              # standalone, BUILD_ID stamp
├── package.json                # scripts: dev (3010), build, ingest:nr, db:check
├── tsconfig.json               # strict, paths @/*
├── .env.example                # template, copiar para .env.local
├── middleware.ts               # tools-auth gate (cookie course_session_eduven)
├── start.sh                    # systemd entrypoint
├── eduven.service              # systemd unit (porta 3010)
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Home: grid das 38 NRs
│   ├── globals.css
│   ├── aulas/page.tsx          # Aula interativa (LessonView)
│   └── api/
│       ├── ai/lesson/route.ts  # Gera aula com RAG
│       ├── ai/exercise/route.ts
│       ├── ai/term-explain/route.ts
│       ├── nr/route.ts         # GET catalogo
│       └── build-info/route.ts
│
├── components/
│   ├── education/              # LessonView, ExerciseWindow, TermModal, ...
│   ├── NRCatalog.tsx           # Grid das 38 NRs
│   ├── FloatingButton.tsx      # URL absoluta para icon.iconsai.ai/icon
│   └── AppHeader.tsx
│
├── lib/
│   ├── db.ts                   # Supabase client (schema-aware via env)
│   ├── nr-parser.ts            # Parser hierarquico de NR (validado em 5 NRs)
│   ├── nr-rag.ts               # Query vetorial sobre eduven.nr_chunks
│   ├── llm-client.ts           # Anthropic + OpenAI fallback (do stats)
│   └── course-domain-config.ts
│
├── data/
│   ├── nr-index.ts             # Catalogo das 38 NRs com URLs canonicas
│   └── domain-configs/nr.ts    # NR_DOMAIN_CONFIG (tom + RAG + termos)
│
├── scripts/
│   ├── db-check.ts             # Verifica conexao + tabelas
│   ├── ingest-nr.ts            # Pipeline: fetch → parse → chunk → embed → DB
│   ├── deploy.sh               # Pipeline 8 fases (parametrizado por env)
│   └── post-deploy-verify.sh
│
├── supabase/migrations/
│   └── 20260409000000_eduven_init.sql   # CREATE SCHEMA eduven + 7 tabelas
│
└── public/
    └── build-id.txt            # SHA + timestamp (prebuild)
```

---

## Skills Globais Herdadas

- `/skill-floating-button` (REGRA DE OURO — img URL absoluta)
- `/skill-rag-ingestion` (lineage e PII)
- `/skill-rag-retrieval` (controle de acesso)
- `/skill-llm-prompt-safety`
- `/skill-mcp-guardrails`
- `/skill-design-audit`

---

## Convencoes

- **Idioma do codigo:** Ingles (variaveis, funcoes)
- **Idioma do conteudo:** Portugues BR (textos, labels)
- **Commits:** Conventional Commits em ingles
- **Branches:** `main` (producao), `feat/*`, `fix/*`
