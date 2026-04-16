/**
 * uf-meta.ts — metadados oficiais das 27 UFs brasileiras.
 *
 * Codigo IBGE de UF (campo `codarea` no GeoJSON public/data/br-uf.geojson).
 * Divisao Regional do Brasil (Grandes Regioes) — IBGE oficial.
 *
 * accentInstructions: descricao do sotaque pra alimentar o TTS gpt-4o-mini-tts.
 * Tom canonico: paulistano descontraido como BASE; aqui sobrescrevemos a
 * variante regional. Mantem ritmo de conversa, sem locucao formal.
 */

export type RegionSlug = 'norte' | 'nordeste' | 'centro_oeste' | 'sudeste' | 'sul'

export interface UFMeta {
  codarea: string  // codigo IBGE (string, com zero a esquerda quando aplicavel)
  sigla: string    // 'SP', 'RJ', etc
  nome: string     // 'Sao Paulo', etc
  regiao: RegionSlug
  /** Sotaque do estado pra TTS — usado como `instructions` no gpt-4o-mini-tts */
  accentInstructions: string
}

const TOM_BASE = `Tom descontraido, ritmo de conversa, sem locucao formal. Pausas naturais. Personalidade. Cite numeros por extenso quando aparecerem.`

export const UF_META: Record<string, UFMeta> = {
  // ── Norte ──────────────────────────────────────────────────────
  '11': { codarea: '11', sigla: 'RO', nome: 'Rondonia',  regiao: 'norte',
    accentInstructions: `Fale em portugues brasileiro com sotaque do norte do Brasil, especificamente Rondonia. Tom amigavel, calmo, com vogais um pouco abertas. ${TOM_BASE}` },
  '12': { codarea: '12', sigla: 'AC', nome: 'Acre',      regiao: 'norte',
    accentInstructions: `Fale em portugues brasileiro com sotaque acreano. Cadencia tranquila, vogais suaves, sem pressa. ${TOM_BASE}` },
  '13': { codarea: '13', sigla: 'AM', nome: 'Amazonas',  regiao: 'norte',
    accentInstructions: `Fale com sotaque amazonense (Manaus). Cadencia cantada, melodia ondulante, com toques do nortista classico. ${TOM_BASE}` },
  '14': { codarea: '14', sigla: 'RR', nome: 'Roraima',   regiao: 'norte',
    accentInstructions: `Fale com sotaque roraimense — fala clara, ritmo moderado, sem alongar muito as vogais. ${TOM_BASE}` },
  '15': { codarea: '15', sigla: 'PA', nome: 'Para',      regiao: 'norte',
    accentInstructions: `Fale com sotaque paraense (Belem). Cadencia musical, "ma-rinheiro" ao inves de "marinheiro", muito caracteristico. ${TOM_BASE}` },
  '16': { codarea: '16', sigla: 'AP', nome: 'Amapa',     regiao: 'norte',
    accentInstructions: `Fale com sotaque amapaense, semelhante ao paraense porem mais brando. ${TOM_BASE}` },
  '17': { codarea: '17', sigla: 'TO', nome: 'Tocantins', regiao: 'norte',
    accentInstructions: `Fale com sotaque tocantinense — meio termo entre nortista e nordestino, vogais alongadas. ${TOM_BASE}` },

  // ── Nordeste ───────────────────────────────────────────────────
  '21': { codarea: '21', sigla: 'MA', nome: 'Maranhao',          regiao: 'nordeste',
    accentInstructions: `Fale com sotaque maranhense (Sao Luis). Pronuncia clara e classica, mais "lusitana" que o nordeste tipico, com tu/voce alternados. ${TOM_BASE}` },
  '22': { codarea: '22', sigla: 'PI', nome: 'Piaui',             regiao: 'nordeste',
    accentInstructions: `Fale com sotaque piauiense — vogais abertas, cadencia melodica, tom acolhedor. ${TOM_BASE}` },
  '23': { codarea: '23', sigla: 'CE', nome: 'Ceara',             regiao: 'nordeste',
    accentInstructions: `Fale com sotaque cearense (Fortaleza). Pronuncia "ti" como "tchi", vogais alongadas, ritmo brincalhao, jeito praieiro. ${TOM_BASE}` },
  '24': { codarea: '24', sigla: 'RN', nome: 'Rio Grande do Norte', regiao: 'nordeste',
    accentInstructions: `Fale com sotaque potiguar — leve, com pronuncia das vogais bem marcada, ritmo tranquilo. ${TOM_BASE}` },
  '25': { codarea: '25', sigla: 'PB', nome: 'Paraiba',           regiao: 'nordeste',
    accentInstructions: `Fale com sotaque paraibano (Joao Pessoa) — vogais marcadas, "rr" forte no comeco de palavras, jeito acolhedor. ${TOM_BASE}` },
  '26': { codarea: '26', sigla: 'PE', nome: 'Pernambuco',        regiao: 'nordeste',
    accentInstructions: `Fale com sotaque pernambucano (Recife). "Ti" e "di" suavizados, vogais marcadas, ritmo cadenciado, jeito recifense classico. ${TOM_BASE}` },
  '27': { codarea: '27', sigla: 'AL', nome: 'Alagoas',           regiao: 'nordeste',
    accentInstructions: `Fale com sotaque alagoano (Maceio) — semelhante ao pernambucano, vogais ainda mais alongadas. ${TOM_BASE}` },
  '28': { codarea: '28', sigla: 'SE', nome: 'Sergipe',           regiao: 'nordeste',
    accentInstructions: `Fale com sotaque sergipano (Aracaju) — entre o pernambucano e o baiano, ritmo praieiro, vogais arredondadas. ${TOM_BASE}` },
  '29': { codarea: '29', sigla: 'BA', nome: 'Bahia',             regiao: 'nordeste',
    accentInstructions: `Fale com sotaque baiano (Salvador). Cadencia marcante, vogais bem abertas, jeito praieiro e acolhedor, ritmo do "deboiar" baiano. ${TOM_BASE}` },

  // ── Sudeste ────────────────────────────────────────────────────
  '31': { codarea: '31', sigla: 'MG', nome: 'Minas Gerais',     regiao: 'sudeste',
    accentInstructions: `Fale com sotaque mineiro classico (BH/Triangulo). "Ce" no lugar de "voce", "uai", vogais cortadas no final ("trem bao"), jeito acolhedor. ${TOM_BASE}` },
  '32': { codarea: '32', sigla: 'ES', nome: 'Espirito Santo',   regiao: 'sudeste',
    accentInstructions: `Fale com sotaque capixaba — proximo do mineiro mas com toque litoraneo, vogais um pouco mais arredondadas. ${TOM_BASE}` },
  '33': { codarea: '33', sigla: 'RJ', nome: 'Rio de Janeiro',   regiao: 'sudeste',
    accentInstructions: `Fale com sotaque carioca classico. "S" chiado ("oxhh"), "rr" forte e arrastado, jeito praieiro, expressoes como "mermao", "morou". ${TOM_BASE}` },
  '35': { codarea: '35', sigla: 'SP', nome: 'Sao Paulo',        regiao: 'sudeste',
    accentInstructions: `Fale com sotaque paulistano descontraido. Ritmo direto, "rr" leve, vogais neutras, jeito de balcao de cafe. ${TOM_BASE}` },

  // ── Sul ────────────────────────────────────────────────────────
  '41': { codarea: '41', sigla: 'PR', nome: 'Parana',           regiao: 'sul',
    accentInstructions: `Fale com sotaque curitibano — pronuncia clara, vogais bem articuladas, "rr" de garganta no estilo paranaense, ritmo moderado. ${TOM_BASE}` },
  '42': { codarea: '42', sigla: 'SC', nome: 'Santa Catarina',   regiao: 'sul',
    accentInstructions: `Fale com sotaque catarinense (Florianopolis/manezinho). "Ti" e "di" suaves, "s" levemente chiado, jeito praieiro do sul. ${TOM_BASE}` },
  '43': { codarea: '43', sigla: 'RS', nome: 'Rio Grande do Sul', regiao: 'sul',
    accentInstructions: `Fale com sotaque gaucho (Porto Alegre). "Tu" no lugar de "voce", vogais abertas, "rr" forte, "tche" como expressao, jeito serrano e seguro. ${TOM_BASE}` },

  // ── Centro-Oeste ───────────────────────────────────────────────
  '50': { codarea: '50', sigla: 'MS', nome: 'Mato Grosso do Sul', regiao: 'centro_oeste',
    accentInstructions: `Fale com sotaque sul-mato-grossense — proximo do paulista interiorano com toques pantaneiros, ritmo calmo. ${TOM_BASE}` },
  '51': { codarea: '51', sigla: 'MT', nome: 'Mato Grosso',       regiao: 'centro_oeste',
    accentInstructions: `Fale com sotaque mato-grossense — tom tranquilo do centro-oeste, vogais um pouco alongadas, sem pressa. ${TOM_BASE}` },
  '52': { codarea: '52', sigla: 'GO', nome: 'Goias',             regiao: 'centro_oeste',
    accentInstructions: `Fale com sotaque goiano (sertanejo) — "rr" cortado, "ei" como "e", jeito caipira solar e acolhedor. ${TOM_BASE}` },
  '53': { codarea: '53', sigla: 'DF', nome: 'Distrito Federal',  regiao: 'centro_oeste',
    accentInstructions: `Fale com sotaque candango/brasiliense — relativamente neutro, mistura do migrante de varias regioes, ritmo moderado. ${TOM_BASE}` },
}

export const UF_LIST = Object.values(UF_META)

export function getUFByCodarea(codarea: string): UFMeta | undefined {
  return UF_META[codarea]
}

export function getUFBySigla(sigla: string): UFMeta | undefined {
  return UF_LIST.find(u => u.sigla === sigla.toUpperCase())
}

export const REGION_NAMES: Record<RegionSlug, string> = {
  norte: 'Norte',
  nordeste: 'Nordeste',
  centro_oeste: 'Centro-Oeste',
  sudeste: 'Sudeste',
  sul: 'Sul',
}

export const REGION_COLORS: Record<RegionSlug, string> = {
  norte:        '#22c55e',  // verde — Amazonia
  nordeste:     '#f59e0b',  // dourado — sertao
  centro_oeste: '#a855f7',  // roxo — cerrado
  sudeste:      '#0ea5e9',  // azul — economia
  sul:          '#ef4444',  // vermelho — pampa
}
