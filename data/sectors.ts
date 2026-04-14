/**
 * 3 setores com relevância pré-calculada para cada NR.
 * Escala 0-5: 0=irrelevante, 1=tangencial, 2=ocasional, 3=relevante, 4=muito relevante, 5=crítica
 */

export interface Sector {
  slug: string
  name: string
  description: string
  relevance: Record<number, { score: number; rationale: string }>
}

export const SECTORS: Sector[] = [
  {
    slug: 'construcao_civil',
    name: 'Construção Civil',
    description: 'Canteiro de obra: prédios, infraestrutura, reformas. Risco alto, NRs em peso.',
    relevance: {
      1: { score: 5, rationale: 'Obrigatória — GRO/PGR fundacional para toda obra' },
      3: { score: 4, rationale: 'Embargo é instrumento central de fiscalização em canteiros' },
      4: { score: 5, rationale: 'SESMT obrigatório em construtoras com >50 empregados' },
      5: { score: 5, rationale: 'CIPA obrigatória — setor com alto índice de acidentes' },
      6: { score: 5, rationale: 'EPIs são a última barreira em construção (capacete, luvas, botas, arnês)' },
      7: { score: 5, rationale: 'PCMSO obrigatório — exames admissionais/periódicos' },
      8: { score: 5, rationale: 'NR-8 é a própria essência da construção de edifícios' },
      9: { score: 4, rationale: 'Exposição a poeira, ruído, vibrações' },
      10: { score: 4, rationale: 'Instalações elétricas provisórias em canteiro' },
      11: { score: 4, rationale: 'Transporte de materiais pesados — gruas, guindastes' },
      12: { score: 3, rationale: 'Máquinas de corte, furadeiras, serras' },
      13: { score: 1, rationale: 'Caldeiras raramente presentes em canteiros' },
      14: { score: 1, rationale: 'Fornos não são usados em construção civil' },
      15: { score: 4, rationale: 'Insalubridade por ruído, poeira, calor' },
      16: { score: 2, rationale: 'Periculosidade em situações específicas' },
      17: { score: 4, rationale: 'Ergonomia — levantamento de peso, postura' },
      18: { score: 5, rationale: 'NR-18 É A NR DA CONSTRUÇÃO — absolutamente central' },
      19: { score: 1, rationale: 'Explosivos apenas em demolições especiais' },
      20: { score: 2, rationale: 'Inflamáveis em pintura e impermeabilização' },
      21: { score: 4, rationale: 'Trabalho a céu aberto é rotina em canteiros' },
      23: { score: 4, rationale: 'Proteção contra incêndios em canteiros' },
      24: { score: 4, rationale: 'Condições sanitárias — banheiros, refeitórios' },
      25: { score: 2, rationale: 'Resíduos de construção (entulho)' },
      26: { score: 4, rationale: 'Sinalização em canteiros — rotas, perigos, EPIs' },
      28: { score: 4, rationale: 'Fiscalização do MTE frequente em obras' },
      33: { score: 3, rationale: 'Espaços confinados — caixas d\'água, fossas' },
      35: { score: 5, rationale: 'Trabalho em altura é rotina em construção' },
    },
  },
  {
    slug: 'industria_calcados',
    name: 'Fábrica de Calçados',
    description: 'Fábrica de calçados: corte, costura, montagem. Máquinas, química, ergonomia.',
    relevance: {
      1: { score: 5, rationale: 'GRO/PGR obrigatório para toda fábrica' },
      3: { score: 3, rationale: 'Embargo possível em caso de risco grave' },
      4: { score: 4, rationale: 'SESMT necessário — fábricas >100 empregados' },
      5: { score: 4, rationale: 'CIPA obrigatória — ambiente fabril com riscos' },
      6: { score: 4, rationale: 'EPIs: luvas, óculos, protetor auricular, máscara' },
      7: { score: 5, rationale: 'PCMSO obrigatório — exposição a solventes' },
      8: { score: 3, rationale: 'Edificações fabris — pisos, escadas, iluminação' },
      9: { score: 4, rationale: 'Exposição a solventes, colas, ruído de máquinas' },
      10: { score: 2, rationale: 'Manutenção elétrica de máquinas' },
      11: { score: 3, rationale: 'Movimentação de materiais — esteiras, carrinhos' },
      12: { score: 5, rationale: 'NR-12 central — máquinas de corte, costura, prensas' },
      15: { score: 4, rationale: 'Insalubridade — solventes orgânicos, ruído, calor' },
      16: { score: 2, rationale: 'Periculosidade — colas e solventes inflamáveis' },
      17: { score: 4, rationale: 'Ergonomia crítica — trabalho repetitivo, LER/DORT' },
      20: { score: 3, rationale: 'Inflamáveis — colas, solventes, tintas' },
      23: { score: 3, rationale: 'Proteção contra incêndios — solventes inflamáveis' },
      24: { score: 4, rationale: 'Condições sanitárias — refeitórios, vestiários' },
      25: { score: 3, rationale: 'Resíduos — sobras de couro, borracha, solventes' },
      26: { score: 3, rationale: 'Sinalização — rotas de fuga, áreas perigosas' },
      28: { score: 3, rationale: 'Fiscalização do MTE em fábricas' },
      35: { score: 2, rationale: 'Trabalho em altura — manutenção de galpão' },
    },
  },
  {
    slug: 'escritorio_contabilidade',
    name: 'Escritório de Contabilidade',
    description: 'Escritório contábil: mesa, computador, cliente. Risco físico baixo, NRs de conforto.',
    relevance: {
      1: { score: 4, rationale: 'GRO/PGR obrigatório mesmo para escritórios' },
      4: { score: 3, rationale: 'SESMT pode ser exigido conforme porte' },
      5: { score: 3, rationale: 'CIPA obrigatória se >20 empregados' },
      7: { score: 4, rationale: 'PCMSO obrigatório — exames admissionais' },
      8: { score: 2, rationale: 'Edificações — aplicável a qualquer local' },
      9: { score: 2, rationale: 'Agentes físicos — iluminação, temperatura' },
      17: { score: 5, rationale: 'ERGONOMIA É A NR CENTRAL — postura, monitor, cadeira, pausas' },
      23: { score: 3, rationale: 'Proteção contra incêndios — extintores, rotas de fuga' },
      24: { score: 4, rationale: 'Condições sanitárias — banheiros, copa, conforto' },
      26: { score: 2, rationale: 'Sinalização — rotas de fuga, saídas' },
      28: { score: 2, rationale: 'Fiscalização — possível mas rara' },
    },
  },
]

export const DEFAULT_SECTOR = 'construcao_civil'

export function getSector(slug: string): Sector | undefined {
  return SECTORS.find(s => s.slug === slug)
}

export function getNRsForSector(slug: string) {
  const sector = getSector(slug)
  if (!sector) return []
  return Object.entries(sector.relevance)
    .filter(([, r]) => r.score > 0)
    .map(([nrId, r]) => ({ nrId: Number(nrId), ...r }))
    .sort((a, b) => b.score - a.score)
}
