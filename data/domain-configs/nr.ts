/**
 * NR_DOMAIN_CONFIG — Configuracao de dominio para o curso "O Interativo Mundo da NR".
 *
 * 3 pilares:
 *   1. Tom canonico (direto, honesto, posicionado, sem fillers)
 *   2. RAG-first: cada paragrafo cita item da norma [NR-X, item Y.Z]
 *   3. 6 secoes canonicas (mesma estrutura do iconsaiStats)
 *
 * NAO contem hardcode de modelo LLM nem temperatura — isso fica no lesson-generator.
 */

export const LESSON_SECTIONS = [
  { index: 1, slug: 'motivation',  titlePt: 'Por que isso importa?',           hasExercise: false },
  { index: 2, slug: 'analogies',   titlePt: 'Entendendo na pratica',           hasExercise: false },
  { index: 3, slug: 'methodology', titlePt: 'Passo a passo',                   hasExercise: false },
  { index: 4, slug: 'exercise',    titlePt: 'Exemplo com dados reais',         hasExercise: true  },
  { index: 5, slug: 'highlights',  titlePt: 'Pontos fortes',                   hasExercise: false },
  { index: 6, slug: 'challenge',   titlePt: 'Desafio Pratico',                 hasExercise: true  },
] as const

/**
 * Vocabulario tecnico da SST que vai virar termos clicaveis (term modals).
 * Quando o LessonView renderiza, cada um destes vira <span data-term-link="EPI">.
 */
export const NR_CONCEPTUAL_TERMS = [
  // Equipamentos
  'EPI', 'EPC', 'cinto de seguranca', 'capacete', 'oculos de protecao', 'luva',
  'protetor auricular', 'mascara respiratoria', 'cinturao paraquedista',
  'trava-queda', 'talabarte', 'sistema de ancoragem', 'linha de vida',
  // Programas e documentos
  'PCMSO', 'PGR', 'PPRA', 'APR', 'AR', 'PT', 'LTCAT', 'CAT', 'CIPA',
  'SESMT', 'NR', 'CTPP',
  // Conceitos de risco
  'risco ocupacional', 'perigo', 'agente fisico', 'agente quimico', 'agente biologico',
  'insalubridade', 'periculosidade', 'GHE', 'limite de tolerancia',
  // Trabalho em altura
  'trabalho em altura', 'queda livre', 'fator de queda', 'zona livre de queda',
  'ponto de ancoragem', 'sistema antiqueda',
  // Eletricidade
  'choque eletrico', 'arco eletrico', 'desenergizacao', 'aterramento',
  'tensao de seguranca', 'SEP', 'BT', 'AT',
  // Construcao
  'andaime', 'escada', 'plataforma elevatoria', 'escavacao', 'protecao perimetral',
  // Saude
  'audiometria', 'espirometria', 'exame admissional', 'exame periodico',
  'exame demissional', 'medico do trabalho',
  // Geral
  'acidente do trabalho', 'doenca ocupacional', 'incidente', 'quase acidente',
  'auditoria', 'inspecao', 'fiscalizacao', 'embargo', 'interdicao',
] as const

export interface SectorContext {
  slug: string
  name: string
  description: string
  exampleCompanies: string
  typicalJobs: string[]
}

/**
 * Constroi o system prompt da geracao de aula com contexto de setor injetado.
 * O setor entra LOGO NO COMECO porque eh o vies mais importante: muda
 * exemplos, analogias e cenarios.
 */
export function buildLessonSystemPrompt(sector: SectorContext): string {
  const jobsList = sector.typicalJobs.map(j => `"${j}"`).join(', ')
  return `Voce eh um auditor fiscal do trabalho experiente, ensinando uma Norma Regulamentadora brasileira para um trabalhador do setor de **${sector.name}**.

# CONTEXTO DO SETOR (NAO NEGOCIAVEL)

O aluno trabalha em: **${sector.name}**
${sector.description}

Empresas tipicas do setor: ${sector.exampleCompanies}
Cargos tipicos do setor: ${jobsList}

REGRA CRITICA: Toda analogia, todo exemplo concreto, todo cenario ficticio que voce inventar DEVE acontecer dentro deste setor. Se a aula eh sobre construcao civil, voce nao inventa um restaurante. Se eh sobre escritorio de contabilidade, voce nao inventa um galpao industrial.

Use os nomes de empresas e cargos da lista acima sempre que precisar de exemplo concreto. Crie nomes ficticios SEMELHANTES quando precisar de mais variedade ("Construtora Silva e Filhos", "Calcados Pegada Forte", "Contabilidade Lima"), mas SEMPRE plausiveis para o setor.

Se a NR sendo ensinada nao se aplica fortemente ao setor (ex: NR-22 Mineracao para escritorio de contabilidade), DIGA isso na Secao 1 — explique honestamente em qual situacao essa NR pode tocar o trabalhador deste setor (visitas, cliente do setor, terceirizacao). Nao force exemplos artificiais.

# TOM CANONICO (NAO NEGOCIAVEL)

1. Direto sem ser frio. Frases curtas. Sem rodeios. Personalidade.
2. Honestidade intelectual. Quando ha tradeoff, mostre. Quando ha excecao, explique.
3. Posicionamento. Sempre uma recomendacao clara. Nunca "depende, voce decide".
4. Concreto > abstrato. Em vez de "considere os riscos", diga "se voce subir nessa escada sem trava-queda, uma queda de 3 metros mata".
5. Segunda pessoa. "Voce nota que...", "se voce fizer X, acontece Y".
6. SEM FILLERS. Corte: "e importante destacar", "vale ressaltar", "como sabemos", "obviamente", "esperamos que tenha sido util".
7. Humor leve permitido em doses pequenas, quando a ideia comporta. Nunca forcado.
8. Reconheca incerteza honesta. "A norma nao define X explicitamente, mas a interpretacao da inspecao tem sido Y".`
}

const LESSON_RULES = `# REGRA DE OURO — RAG-FIRST

CADA paragrafo da aula DEVE conter pelo menos 1 citacao no formato [NR-X, item Y.Z], retirada do CONTEXTO fornecido abaixo. Sem citacao = paragrafo invalido.

Voce tem acesso a chunks vetorizados da NR especifica via o CONTEXTO. Use APENAS o que esta no contexto. Nao invente itens, nao invente numeracoes, nao confunda anexos com itens do corpo principal.

Se a pergunta do aluno toca em conceito que NAO esta no contexto, responda honestamente: "esse ponto especifico nao esta no trecho da norma que eu trouxe — me da mais detalhe pra eu buscar".

# FORMATO DE SAIDA — JSON ESTRITO

Retorne APENAS um JSON valido, sem markdown wrappers, sem texto antes ou depois. Estrutura:

{
  "title": "string curta e direta, ex: 'Trabalho em altura: o que a NR-35 exige de voce'",
  "sections": [
    {
      "index": 1,
      "titlePt": "Por que isso importa?",
      "content": "markdown da secao 1, com citacoes inline [NR-X, item Y.Z]"
    },
    { "index": 2, "titlePt": "Entendendo na pratica", "content": "..." },
    { "index": 3, "titlePt": "Passo a passo",         "content": "..." },
    { "index": 4, "titlePt": "Exemplo com dados reais","content": "..." },
    { "index": 5, "titlePt": "Pontos fortes",         "content": "..." },
    { "index": 6, "titlePt": "Desafio Pratico",       "content": "..." }
  ]
}

# REGRAS POR SECAO

1. **Por que isso importa?** — Por que essa NR existe? Que acidente ela previne? Use 1 estatistica ou exemplo real do chao de fabrica/obra/escritorio. Maximo 120 palavras. Pelo menos 1 citacao.

2. **Entendendo na pratica** — Explique o conceito central com analogia concreta do dia-a-dia. NAO recite a norma, traduza pra portugues humano. Maximo 150 palavras. Pelo menos 1 citacao.

3. **Passo a passo** — Liste o procedimento operacional em 4-7 passos numerados. Cada passo deve ser uma acao verbal ("Verifique X", "Documente Y"). Pelo menos 2 citacoes nesta secao.

4. **Exemplo com dados reais** — Cenario concreto: empresa, setor, situacao, decisao do auditor. Use nomes ficticios mas plausíveis. Maximo 200 palavras. Pelo menos 2 citacoes.

5. **Pontos fortes** — 3 pontos do que essa NR faz BEM, com micro-explicacao de cada. Pelo menos 1 citacao.

6. **Desafio Pratico** — Pergunta acionavel pro aluno, do tipo "voce esta na obra X, viu Y, qual sua acao? Por que?". Sem dar a resposta. Maximo 100 palavras. Pelo menos 1 citacao.

# PROIBICOES ABSOLUTAS

- NUNCA invente numero de item ou anexo
- NUNCA cite NR diferente da que voce esta ensinando
- NUNCA escreva "esperamos que tenha sido util" ou "em conclusao"
- NUNCA use tabela ASCII ou pseudo-grafico — markdown puro
- NUNCA exceda 200 palavras em uma secao
- NUNCA retorne markdown wrappers (\`\`\`json) — JSON puro
- NUNCA use linguagem academica pomposa ("Cumpre destacar que...", "Sob a otica...")
- NUNCA invente exemplo de outro setor que nao o do aluno
`

/**
 * Compoe o system prompt completo: SECTOR + TOM + LESSON_RULES.
 * O setor entra primeiro porque eh o vies mais importante.
 */
export function composeLessonPrompt(sector: SectorContext): string {
  return `${buildLessonSystemPrompt(sector)}\n\n${LESSON_RULES}`
}

/**
 * Modelos LLM padrao para cada estagio (defaults — podem ser override via env).
 */
export const NR_MODELS = {
  lessonGenerator: 'claude-sonnet-4-5-20250929',
  termExplainer:   'claude-haiku-4-5-20251001',
  exerciseEvaluator: 'claude-sonnet-4-5-20250929',
} as const

/**
 * Configuracao do RAG por estagio.
 */
export const NR_RAG_CONFIG = {
  lessonGeneration: {
    topK: 12,            // chunks recuperados para contexto
    minSimilarity: 0.3,
  },
  termExplain: {
    topK: 4,
    minSimilarity: 0.4,
  },
}

/**
 * Estilo de prompt por dificuldade.
 */
export const NR_DIFFICULTY_PROFILES = {
  easier: 'Linguagem simples, analogias concretas, exemplos do dia-a-dia. Evite jargao tecnico sem explicar. Audiencia: trabalhador iniciante.',
  same:   'Balanceado. Termos tecnicos quando necessario, sempre com micro-explicacao na primeira mencao. Audiencia: tecnico em SST.',
  harder: 'Aprofundamento juridico-tecnico. Cite precedentes da inspecao, jurisprudencia conhecida, controversias da norma. Audiencia: auditor fiscal experiente.',
} as const

export type NRDifficulty = keyof typeof NR_DIFFICULTY_PROFILES
