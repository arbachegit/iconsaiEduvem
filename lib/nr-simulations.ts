/**
 * nr-simulations — registro de simulacoes interativas por NR.
 */
import type { ComponentType } from 'react'
import SimEpiNR06 from '@/components/simulations/SimEpiNR06'

export interface SimulationDefinition {
  id: string
  nrId: number
  title: string
  subtitle: string
  Component: ComponentType
}

const SIMULATIONS: Record<number, SimulationDefinition | undefined> = {
  6: {
    id: 'epi',
    nrId: 6,
    title: 'O que muda com EPI',
    subtitle: 'Arrasta o slider e veja o trabalhador ganhando proteção — risco caindo, multa zerando, ai.tutor explicando cada passo.',
    Component: SimEpiNR06,
  },
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
