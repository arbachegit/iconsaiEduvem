'use client';

import { useMemo } from 'react';
import ForceGraph, {
  type ForceGraphNode, type ForceGraphLink, type CategoryStyle, type AgentFooterConfig, type AgentResponseObject,
} from './ForceGraph';

/* ═══════════════════════════════════════════════════════════════
   NRCorrelationGraph — adapter que plugga dados de NR no ForceGraph
   generico. Mantem a API antiga usada por app/page.tsx.
   ═══════════════════════════════════════════════════════════════ */

interface NRItem { id: number; code: string; title: string; relevance: number }

type NeighborEntry = { node: ForceGraphNode; strength: number; label?: string }

interface NRCorrelationGraphProps {
  nrs: NRItem[];
  sectorName: string;
  onClose: () => void;
}

const NR_GROUPS: Record<string, number[]> = {
  gestao:   [1, 3, 4, 5, 28],
  saude:    [7, 9, 15, 17, 24, 32],
  protecao: [6, 8, 10, 16, 23, 26],
  setorial: [11,12,13,14,18,19,20,21,22,25,29,30,31,33,34,35,36,37,38],
};

const NR_GROUP_COLORS: Record<string, CategoryStyle> = {
  gestao:   { fill: '#E1F5EE', stroke: '#0F6E56', text: '#0F6E56' },
  saude:    { fill: '#EEEDFE', stroke: '#534AB7', text: '#534AB7' },
  protecao: { fill: '#FAECE7', stroke: '#993C1D', text: '#993C1D' },
  setorial: { fill: '#FAC775', stroke: '#854F0B', text: '#854F0B' },
};

function getGroup(id: number): string {
  for (const [g, ids] of Object.entries(NR_GROUPS)) if (ids.includes(id)) return g;
  return 'setorial';
}

// Links de correlacao entre NRs (strength = P(target|source) aproximada).
const RAW_LINKS: { s: number; t: number; strength: number; label?: string }[] = [
  ...[3,4,5,6,7,9,10,12,15,16,17,18,23,24,26,28,33,35].map(t => ({ s: 1, t, strength: t <= 5 ? 0.72 : 0.65, label: 'NR-01 base' })),
  { s: 4, t: 5, strength: 0.92, label: 'SESMT ↔ CIPA' },
  { s: 5, t: 7, strength: 0.88 }, { s: 4, t: 7, strength: 0.85 },
  { s: 6, t: 9, strength: 0.90 }, { s: 9, t: 15, strength: 0.93 }, { s: 6, t: 15, strength: 0.86 },
  { s: 10, t: 16, strength: 0.91 },
  { s: 18, t: 35, strength: 0.94 }, { s: 18, t: 33, strength: 0.88 }, { s: 33, t: 35, strength: 0.90 },
  { s: 12, t: 15, strength: 0.58 },
  { s: 17, t: 24, strength: 0.85 },
  { s: 23, t: 26, strength: 0.89 },
  { s: 28, t: 3, strength: 0.87 }, { s: 28, t: 1, strength: 0.75 },
  { s: 7, t: 15, strength: 0.55 }, { s: 9, t: 17, strength: 0.42 }, { s: 12, t: 18, strength: 0.48 },
];

function nrId(n: number) { return `nr-${n}`; }
function nrLabel(n: number) { return String(n).padStart(2, '0'); }

function fallbackEllaAnalysis(
  node: ForceGraphNode,
  neighbors: Array<{ node: ForceGraphNode; strength: number; label?: string }>,
): AgentResponseObject {
  const nrNumber = Number(node.id.replace('nr-', ''));
  const conns = neighbors.length;
  const sorted = [...neighbors].sort((a, b) => b.strength - a.strength);
  const strongest = sorted[0];
  const next = sorted[1];
  const pct = strongest ? Math.round(strongest.strength * 100) : 0;
  const strongLine = strongest
    ? `Conexão mais forte (${pct}%) com NR-${nrLabel(Number(strongest.node.id.replace('nr-', '')))}.`
    : 'Sem correlações registradas neste setor.';
  const bayes = Math.round((node.bayesianWeight ?? 0) * 100);
  const suggestionTarget = next ?? strongest;
  const suggestion = suggestionTarget
    ? `Tente apertar o nó da NR-${nrLabel(Number(suggestionTarget.node.id.replace('nr-', '')))} que te conto a importância dela.`
    : '';
  return {
    text: `NR-${nrLabel(nrNumber)}.\n\n` +
      `Conexões neste setor: ${conns}. ${strongLine} ` +
      `Grupo: ${node.group}. Relevância setorial (peso a priori bayesiano): ${bayes}%.`,
    suggestion,
  };
}

export default function NRCorrelationGraph({ nrs, sectorName, onClose }: NRCorrelationGraphProps) {
  const nrTitleById = useMemo(() => {
    const m = new Map<number, string>();
    nrs.forEach(n => m.set(n.id, n.title));
    return m;
  }, [nrs]);

  const { nodes, links } = useMemo(() => {
    const nrIds = new Set(nrs.map(n => n.id));
    const nodes: ForceGraphNode[] = nrs.map(n => ({
      id: nrId(n.id),
      group: getGroup(n.id),
      label: nrLabel(n.id),
      r: 10 + n.relevance * 3.5,
      bayesianWeight: Math.max(0, Math.min(1, n.relevance / 5)),
    }));
    const links: ForceGraphLink[] = RAW_LINKS
      .filter(l => nrIds.has(l.s) && nrIds.has(l.t))
      .map(l => ({ source: nrId(l.s), target: nrId(l.t), strength: l.strength, label: l.label }));
    return { nodes, links };
  }, [nrs]);

  const agentFooter: AgentFooterConfig = useMemo(() => ({
    label: 'Ella',
    placeholder: 'Clique em um nó pra Ella analisar as correlações.',
    ttsEndpoint: '/api/eduven/tts',
    autoPlayAudio: true,
    typewriterCps: 75,
    onNodeSelect: async (node, neighbors) => callEllaAnalysis(node, neighbors, sectorName, nrTitleById),
  }), [sectorName, nrTitleById]);

  return (
    <ForceGraph
      isOpen={true}
      onClose={onClose}
      title="Grafo de Correlação NRs"
      subtitle={sectorName}
      nodes={nodes}
      links={links}
      categoryColors={NR_GROUP_COLORS}
      agentFooter={agentFooter}
    />
  );
}

async function callEllaAnalysis(
  node: ForceGraphNode,
  neighbors: NeighborEntry[],
  sectorName: string,
  nrTitleById: Map<number, string>,
): Promise<AgentResponseObject> {
  const nrNumber = Number(node.id.replace('nr-', ''));
  const title = nrTitleById.get(nrNumber) ?? `NR-${nrLabel(nrNumber)}`;
  const payload = {
    sectorName,
    node: {
      code: `NR-${nrLabel(nrNumber)}`,
      title,
      group: node.group,
      relevance: Math.round((node.bayesianWeight ?? 0) * 5),
    },
    neighbors: neighbors.map(nb => {
      const nNum = Number(nb.node.id.replace('nr-', ''));
      return {
        code: `NR-${nrLabel(nNum)}`,
        title: nrTitleById.get(nNum) ?? '',
        group: nb.node.group,
        strength: nb.strength,
        label: nb.label,
      };
    }),
  };

  try {
    const res = await fetch('/api/eduven/graph-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    if (!data?.text) throw new Error('resposta sem text');
    return { text: String(data.text), suggestion: data.suggestion ? String(data.suggestion) : '' };
  } catch {
    return fallbackEllaAnalysis(node, neighbors);
  }
}
