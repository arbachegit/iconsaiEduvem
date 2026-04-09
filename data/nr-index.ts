/**
 * Catálogo das 38 Normas Regulamentadoras brasileiras (gov.br).
 *
 * Capturado em 2026-04-08 do índice oficial:
 * https://www.gov.br/trabalho-e-emprego/.../normas-regulamentadoras-vigentes
 *
 * source_url = landing page da NR (NÃO o PDF). O scraper Fase 1 do
 * pipeline lê esta URL para extrair o link do PDF "atualizado".
 *
 * status:
 *   - 'vigente'  : em vigor
 *   - 'revogada' : revogada formalmente (NR-2, NR-27)
 */

export type NRStatus = 'vigente' | 'revogada' | 'suspensa'

export interface NRIndexEntry {
  id: number
  code: string         // 'NR-01' (padronizado com zero à esquerda)
  title: string
  status: NRStatus
  source_url: string
}

const BASE = 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes'

export const NR_INDEX: NRIndexEntry[] = [
  { id: 1,  code: 'NR-01', status: 'vigente',  title: 'Disposicoes Gerais e Gerenciamento de Riscos Ocupacionais',                                          source_url: `${BASE}/nr-1` },
  { id: 2,  code: 'NR-02', status: 'revogada', title: 'Inspecao Previa',                                                                                    source_url: `${BASE}/norma-regulamentadora-no-2-nr-2` },
  { id: 3,  code: 'NR-03', status: 'vigente',  title: 'Embargo e Interdicao',                                                                               source_url: `${BASE}/norma-regulamentadora-no-3-nr-3` },
  { id: 4,  code: 'NR-04', status: 'vigente',  title: 'Servicos Especializados em Seguranca e em Medicina do Trabalho',                                    source_url: `${BASE}/norma-regulamentadora-no-4-nr-4` },
  { id: 5,  code: 'NR-05', status: 'vigente',  title: 'Comissao Interna de Prevencao de Acidentes e de Assedio - CIPA',                                    source_url: `${BASE}/norma-regulamentadora-no-5-nr-5` },
  { id: 6,  code: 'NR-06', status: 'vigente',  title: 'Equipamento de Protecao Individual - EPI',                                                           source_url: `${BASE}/norma-regulamentadora-no-6-nr-6` },
  { id: 7,  code: 'NR-07', status: 'vigente',  title: 'Programa de Controle Medico de Saude Ocupacional',                                                  source_url: `${BASE}/norma-regulamentadora-no-7-nr-7` },
  { id: 8,  code: 'NR-08', status: 'vigente',  title: 'Edificacoes',                                                                                        source_url: `${BASE}/norma-regulamentadora-no-8-nr-8` },
  { id: 9,  code: 'NR-09', status: 'vigente',  title: 'Avaliacao e Controle das Exposicoes Ocupacionais a Agentes Fisicos, Quimicos e Biologicos',          source_url: `${BASE}/norma-regulamentadora-no-9-nr-9` },
  { id: 10, code: 'NR-10', status: 'vigente',  title: 'Seguranca em Instalacoes e Servicos em Eletricidade',                                                source_url: `${BASE}/norma-regulamentadora-no-10-nr-10` },
  { id: 11, code: 'NR-11', status: 'vigente',  title: 'Transporte, Movimentacao, Armazenagem e Manuseio de Materiais',                                     source_url: `${BASE}/norma-regulamentadora-no-11-nr-11` },
  { id: 12, code: 'NR-12', status: 'vigente',  title: 'Seguranca no Trabalho em Maquinas e Equipamentos',                                                  source_url: `${BASE}/norma-regulamentadora-no-12-nr-12` },
  { id: 13, code: 'NR-13', status: 'vigente',  title: 'Caldeiras, Vasos de Pressao e Tubulacoes e Tanques Metalicos de Armazenamento',                     source_url: `${BASE}/norma-regulamentadora-no-13-nr-13` },
  { id: 14, code: 'NR-14', status: 'vigente',  title: 'Fornos',                                                                                             source_url: `${BASE}/norma-regulamentadora-no-14-nr-14` },
  { id: 15, code: 'NR-15', status: 'vigente',  title: 'Atividades e Operacoes Insalubres',                                                                  source_url: `${BASE}/norma-regulamentadora-no-15-nr-15` },
  { id: 16, code: 'NR-16', status: 'vigente',  title: 'Atividades e Operacoes Perigosas',                                                                   source_url: `${BASE}/norma-regulamentadora-no-16-nr-16` },
  { id: 17, code: 'NR-17', status: 'vigente',  title: 'Ergonomia',                                                                                          source_url: `${BASE}/norma-regulamentadora-no-17-nr-17` },
  { id: 18, code: 'NR-18', status: 'vigente',  title: 'Seguranca e Saude no Trabalho na Industria da Construcao',                                          source_url: `${BASE}/norma-regulamentadora-no-18-nr-18` },
  { id: 19, code: 'NR-19', status: 'vigente',  title: 'Explosivos',                                                                                         source_url: `${BASE}/norma-regulamentadora-no-19-nr-19` },
  { id: 20, code: 'NR-20', status: 'vigente',  title: 'Seguranca e Saude no Trabalho com Inflamaveis e Combustiveis',                                      source_url: `${BASE}/norma-regulamentadora-no-20-nr-20` },
  { id: 21, code: 'NR-21', status: 'vigente',  title: 'Trabalhos a Ceu Aberto',                                                                             source_url: `${BASE}/norma-regulamentadora-no-21-nr-21` },
  { id: 22, code: 'NR-22', status: 'vigente',  title: 'Seguranca e Saude Ocupacional na Mineracao',                                                         source_url: `${BASE}/norma-regulamentadora-no-22-nr-22` },
  { id: 23, code: 'NR-23', status: 'vigente',  title: 'Protecao Contra Incendios',                                                                          source_url: `${BASE}/norma-regulamentadora-no-23-nr-23` },
  { id: 24, code: 'NR-24', status: 'vigente',  title: 'Condicoes Sanitarias e de Conforto nos Locais de Trabalho',                                         source_url: `${BASE}/norma-regulamentadora-no-24-nr-24` },
  { id: 25, code: 'NR-25', status: 'vigente',  title: 'Residuos Industriais',                                                                               source_url: `${BASE}/norma-regulamentadora-no-25-nr-25` },
  { id: 26, code: 'NR-26', status: 'vigente',  title: 'Sinalizacao de Seguranca',                                                                           source_url: `${BASE}/norma-regulamentadora-no-26-nr-26` },
  { id: 27, code: 'NR-27', status: 'revogada', title: 'Registro Profissional do Tecnico de Seguranca do Trabalho',                                          source_url: `${BASE}/norma-regulamentadora-no-27-nr-27` },
  { id: 28, code: 'NR-28', status: 'vigente',  title: 'Fiscalizacao e Penalidades',                                                                         source_url: `${BASE}/norma-regulamentadora-no-28-nr-28` },
  { id: 29, code: 'NR-29', status: 'vigente',  title: 'Norma Regulamentadora de Seguranca e Saude no Trabalho Portuario',                                  source_url: `${BASE}/norma-regulamentadora-no-29-nr-29` },
  { id: 30, code: 'NR-30', status: 'vigente',  title: 'Seguranca e Saude no Trabalho Aquaviario',                                                           source_url: `${BASE}/norma-regulamentadora-no-30-nr-30` },
  { id: 31, code: 'NR-31', status: 'vigente',  title: 'Seguranca e Saude no Trabalho na Agricultura, Pecuaria, Silvicultura, Exploracao Florestal e Aquicultura', source_url: `${BASE}/norma-regulamentadora-no-31-nr-31` },
  { id: 32, code: 'NR-32', status: 'vigente',  title: 'Seguranca e Saude no Trabalho em Servicos de Saude',                                                source_url: `${BASE}/norma-regulamentadora-no-32-nr-32` },
  { id: 33, code: 'NR-33', status: 'vigente',  title: 'Seguranca e Saude nos Trabalhos em Espacos Confinados',                                              source_url: `${BASE}/norma-regulamentadora-no-33-nr-33` },
  { id: 34, code: 'NR-34', status: 'vigente',  title: 'Condicoes e Meio Ambiente de Trabalho na Industria da Construcao, Reparacao e Desmonte Naval',      source_url: `${BASE}/norma-regulamentadora-no-34-nr-34` },
  { id: 35, code: 'NR-35', status: 'vigente',  title: 'Trabalho em Altura',                                                                                 source_url: `${BASE}/norma-regulamentadora-no-35-nr-35` },
  { id: 36, code: 'NR-36', status: 'vigente',  title: 'Seguranca e Saude no Trabalho em Empresas de Abate e Processamento de Carnes e Derivados',          source_url: `${BASE}/norma-regulamentadora-no-36-nr-36` },
  { id: 37, code: 'NR-37', status: 'vigente',  title: 'Seguranca e Saude em Plataformas de Petroleo',                                                       source_url: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/norma-regulamentadora-no-37-nr-37' },
  { id: 38, code: 'NR-38', status: 'vigente',  title: 'Seguranca e Saude no Trabalho nas Atividades de Limpeza Urbana e Manejo de Residuos Solidos',       source_url: `${BASE}/norma-regulamentadora-no-38-nr-38` },
]

export const PILOT_NRS = [1, 5, 6, 10, 35]

export function getNR(id: number): NRIndexEntry | undefined {
  return NR_INDEX.find(n => n.id === id)
}

export function pilotNRs(): NRIndexEntry[] {
  return NR_INDEX.filter(n => PILOT_NRS.includes(n.id))
}
