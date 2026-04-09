/**
 * nr-simulations — registro de simulacoes interativas por NR.
 *
 * Cada simulacao tem:
 *   - id: 'epi' | 'altura-ancoragem' | etc
 *   - nrId: numero da NR
 *   - title: titulo curto pro header do laboratorio
 *   - subtitle: 1 frase explicando o que o aluno vai mexer
 *   - kind: tipo de UI ('binary'|'slider'|'multi-slider')
 *   - params: definicao dos controles
 *   - Component: componente React que renderiza a sim
 *
 * Pra adicionar uma nova simulacao:
 *   1. Cria um arquivo `components/simulations/SimNomeXxx.tsx`
 *   2. Importa aqui
 *   3. Adiciona ao SIMULATIONS map
 *   4. Done — Lab button aparece automaticamente nas NRs com sim
 */
import type { ComponentType } from 'react'

export interface SimulationDefinition {
  id: string
  nrId: number
  title: string
  subtitle: string
  kind: 'binary' | 'slider' | 'multi-slider'
  Component: ComponentType<{ accentColor: string }>
}

// Registry: nrId → simulacao (ou undefined se ainda nao implementada)
const SIMULATIONS: Record<number, SimulationDefinition | undefined> = {
  // 6: { id: 'epi', nrId: 6, title: 'O que muda com EPI', ... } — proxima rodada
  // Outras viraao aqui
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
