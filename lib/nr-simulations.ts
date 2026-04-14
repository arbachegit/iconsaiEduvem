/**
 * nr-simulations — registro de simulacoes interativas por NR.
 *
 * Todas as NRs vigentes usam o template WorkerLab parametrizado via
 * config de nr-sim-configs.ts. Cada NR tem seu proprio conjunto de 4
 * niveis descrevendo a progressao do trabalhador ganhando EPIs.
 */
import { createElement, type ComponentType } from 'react'
import WorkerLab from '@/components/simulations/WorkerLab'
import {
  CFG_NR01, CFG_NR03, CFG_NR04, CFG_NR05, CFG_NR06, CFG_NR07, CFG_NR08,
  CFG_NR09, CFG_NR10, CFG_NR11, CFG_NR12, CFG_NR13, CFG_NR14, CFG_NR15,
  CFG_NR16, CFG_NR17, CFG_NR18, CFG_NR19, CFG_NR20, CFG_NR21, CFG_NR22,
  CFG_NR23, CFG_NR24, CFG_NR25, CFG_NR26, CFG_NR28, CFG_NR29, CFG_NR30,
  CFG_NR31, CFG_NR32, CFG_NR33, CFG_NR34, CFG_NR35, CFG_NR36, CFG_NR37,
  CFG_NR38,
} from './nr-sim-configs'
import type { WorkerLabConfig } from '@/components/simulations/WorkerLab'

export interface SimulationDefinition {
  id: string
  nrId: number
  title: string
  subtitle: string
  Component: ComponentType
}

function makeSim(nrId: number, title: string, subtitle: string, config: WorkerLabConfig): SimulationDefinition {
  // Componente "aplicado" — config fechada via closure. Ref estavel.
  const Component: ComponentType = () => createElement(WorkerLab, { config, nrId })
  Component.displayName = `WorkerLabNR${nrId}`
  return { id: `nr${nrId}-lab`, nrId, title, subtitle, Component }
}

// Titulos/subtitulos curtos pra header do LabBanner. Descricao completa
// vem dos textos do Ella em cada nivel.
const SIMULATIONS: Record<number, SimulationDefinition | undefined> = {
  1:  makeSim(1,  'Como o PGR evita acidentes', 'Mexa no slider e veja como o gerenciamento de riscos muda a segurança da operação.', CFG_NR01),
  3:  makeSim(3,  'Quando a fiscalização embarga', 'Veja como descumprimentos levam a embargo e como a conformidade reverte.', CFG_NR03),
  4:  makeSim(4,  'SESMT em ação', 'Arraste o slider e veja o impacto da equipe de segurança na redução de acidentes.', CFG_NR04),
  5:  makeSim(5,  'CIPA funcional vs formal', 'Veja a diferença entre CIPA só no papel e CIPA que realmente previne.', CFG_NR05),
  6:  makeSim(6,  'O que muda com EPI', 'Arraste o slider e veja o trabalhador ganhando proteção — risco caindo, multa zerando, expectativa de vida subindo.', CFG_NR06),
  7:  makeSim(7,  'PCMSO — saúde no trabalho', 'Mexa no slider e veja como o controle médico detecta doenças ocupacionais antes que virem invalidez.', CFG_NR07),
  8:  makeSim(8,  'Edificações seguras', 'Veja como escadas, pisos e circulação bem projetados reduzem quedas.', CFG_NR08),
  9:  makeSim(9,  'Exposição a agentes', 'Arraste o slider e veja como a monitoração de agentes químicos, físicos e biológicos muda o risco.', CFG_NR09),
  10: makeSim(10, 'Segurança em eletricidade', 'Arraste o slider e veja o trabalhador indo de circuito energizado sem proteção até bloqueio completo com EPI dielétrico.', CFG_NR10),
  11: makeSim(11, 'Movimentação de materiais', 'Veja o impacto do procedimento de içamento e amarração na segurança da carga.', CFG_NR11),
  12: makeSim(12, 'Proteção de máquinas', 'Arraste o slider e veja a máquina ganhando guardas, sensores e intertravamentos — dedos salvos, mãos intactas.', CFG_NR12),
  13: makeSim(13, 'Caldeiras e vasos de pressão', 'Veja o impacto da inspeção periódica e do operador habilitado na prevenção de explosões.', CFG_NR13),
  14: makeSim(14, 'Fornos industriais', 'Arraste e veja a proteção térmica evitando queimaduras graves.', CFG_NR14),
  15: makeSim(15, 'Insalubridade — químico, ruído, calor', 'Arraste o slider e veja o trabalhador exposto ganhando máscara, abafador, proteção térmica — risco caindo.', CFG_NR15),
  16: makeSim(16, 'Periculosidade', 'Veja como a identificação de atividade perigosa muda o salário e a proteção.', CFG_NR16),
  17: makeSim(17, 'Ergonomia — LER/DORT', 'Arraste o slider e veja o posto de trabalho ganhando cadeira ajustável, iluminação, pausas — coluna e punho agradecem.', CFG_NR17),
  18: makeSim(18, 'Obra conforme NR-18', 'Arraste o slider e veja a obra saindo do caos até PCMAT completo.', CFG_NR18),
  19: makeSim(19, 'Explosivos', 'Veja o impacto do armazenamento e transporte corretos na prevenção de explosões.', CFG_NR19),
  20: makeSim(20, 'Inflamáveis e combustíveis', 'Arraste e veja o risco de incêndio caindo com procedimentos e contenção adequados.', CFG_NR20),
  21: makeSim(21, 'Trabalho a céu aberto', 'Arraste o slider e veja proteção contra sol, calor e raios reduzindo insolação e acidentes.', CFG_NR21),
  22: makeSim(22, 'Mineração', 'Veja como ventilação, escoramento e EPI respiratório mudam o risco na mina.', CFG_NR22),
  23: makeSim(23, 'Proteção contra incêndios', 'Arraste o slider e veja saídas, sinalização e brigada bem dimensionadas salvando vidas.', CFG_NR23),
  24: makeSim(24, 'Condições sanitárias', 'Veja como instalações adequadas reduzem doenças e reclamações trabalhistas.', CFG_NR24),
  25: makeSim(25, 'Resíduos industriais', 'Arraste e veja como o descarte correto evita contaminação de trabalhadores e ambiente.', CFG_NR25),
  26: makeSim(26, 'Sinalização de segurança', 'Veja como placas, cores e sinais corretos guiam o trabalhador em emergência.', CFG_NR26),
  28: makeSim(28, 'Fiscalização e penalidades', 'Mexa no slider e veja a diferença entre empresa com e sem conformidade quando o fiscal chega.', CFG_NR28),
  29: makeSim(29, 'Trabalho portuário', 'Arraste e veja contêineres, guindastes e carregamento com procedimentos corretos.', CFG_NR29),
  30: makeSim(30, 'Trabalho aquaviário', 'Veja como proteção individual e coletiva reduz quedas ao mar e asfixia em porão.', CFG_NR30),
  31: makeSim(31, 'Trabalho rural', 'Arraste o slider e veja a proteção contra agrotóxicos e máquinas agrícolas.', CFG_NR31),
  32: makeSim(32, 'Serviços de saúde', 'Arraste e veja paramentação completa reduzindo contaminação biológica e acidentes com perfurocortantes.', CFG_NR32),
  33: makeSim(33, 'Espaços confinados', 'Arraste o slider e veja o trabalhador entrando seguro — medição de gases, ventilação forçada, vigia externo, plano de resgate.', CFG_NR33),
  34: makeSim(34, 'Construção naval', 'Veja proteção para trabalho a quente em ambiente confinado.', CFG_NR34),
  35: makeSim(35, 'Trabalho em altura', 'Arraste o slider e veja o sistema antiqueda saindo do zero até cinto + trava-queda + ancoragem certificada.', CFG_NR35),
  36: makeSim(36, 'Frigoríficos', 'Arraste e veja como ergonomia e proteção cortante reduzem LER/DORT e acidentes com faca.', CFG_NR36),
  37: makeSim(37, 'Plataformas de petróleo', 'Veja proteção em alto-mar contra explosões e vazamentos.', CFG_NR37),
  38: makeSim(38, 'Limpeza urbana', 'Arraste o slider e veja proteção contra cortes, contaminação biológica e acidentes de trânsito.', CFG_NR38),
}

export function getSimulation(nrId: number): SimulationDefinition | undefined {
  return SIMULATIONS[nrId]
}

export function hasSimulation(nrId: number): boolean {
  return !!SIMULATIONS[nrId]
}

export function listSimulationNRs(): number[] {
  return Object.keys(SIMULATIONS).map(Number)
}
