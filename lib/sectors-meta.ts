/**
 * sectors-meta — metadados visuais dos 4 setores POC.
 *
 * Cor, icone, descricao curta. Slug bate com eduven.sectors.slug.
 * Quando integrar com CNPJ→CNAE, este arquivo continua valido.
 */

export interface SectorMeta {
  slug: string
  shortDesc: string         // 1 frase pra card
  color: string             // cor primaria (CSS hex)
  colorSoft: string         // versao com alpha pra background
  borderColor: string       // borda do card
  iconName: string          // nome do icone Lucide
}

export const SECTORS_META: Record<string, SectorMeta> = {
  construcao_civil: {
    slug: 'construcao_civil',
    shortDesc: 'Canteiro de obra: predios, infraestrutura, reformas. Risco alto, NRs em peso.',
    color: '#f97316',         // laranja
    colorSoft: 'rgba(249,115,22,0.10)',
    borderColor: 'rgba(249,115,22,0.40)',
    iconName: 'HardHat',
  },
  engenharia_civil: {
    slug: 'engenharia_civil',
    shortDesc: 'Escritorio de projeto, calculo estrutural, fiscalizacao. Risco predominantemente ergonomico.',
    color: '#3b82f6',         // azul
    colorSoft: 'rgba(59,130,246,0.10)',
    borderColor: 'rgba(59,130,246,0.40)',
    iconName: 'Ruler',
  },
  industria_calcados: {
    slug: 'industria_calcados',
    shortDesc: 'Fabrica de calcados: corte, costura, montagem. Maquinas, quimica, ergonomia.',
    color: '#ef4444',         // vermelho
    colorSoft: 'rgba(239,68,68,0.10)',
    borderColor: 'rgba(239,68,68,0.40)',
    iconName: 'Factory',
  },
  escritorio_contabilidade: {
    slug: 'escritorio_contabilidade',
    shortDesc: 'Escritorio contabil: mesa, computador, cliente. Risco fisico baixo, NRs de conforto.',
    color: '#94a3b8',         // cinza
    colorSoft: 'rgba(148,163,184,0.10)',
    borderColor: 'rgba(148,163,184,0.40)',
    iconName: 'FileText',
  },
}

export function getSectorMeta(slug: string): SectorMeta | undefined {
  return SECTORS_META[slug]
}
