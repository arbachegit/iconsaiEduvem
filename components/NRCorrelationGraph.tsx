'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

/* ── types ── */
interface NRItem { id: number; code: string; title: string; relevance: number }
interface NRCorrelationGraphProps {
  nrs: NRItem[];
  sectorName: string;
  onClose: () => void;
}

type GNode = d3.SimulationNodeDatum & { id: number; code: string; title: string; relevance: number; group: string };
type GLink = d3.SimulationLinkDatum<GNode> & { strength: number };

/* ── group assignment ── */
const GROUPS: Record<string, number[]> = {
  gestao:   [1, 3, 4, 5, 28],
  saude:    [7, 9, 15, 17, 24, 32],
  protecao: [6, 8, 10, 16, 23, 26],
  setorial: [11,12,13,14,18,19,20,21,22,25,29,30,31,33,34,35,36,37,38],
};
const GROUP_STYLE: Record<string, { fill: string; stroke: string }> = {
  gestao:   { fill: '#E1F5EE', stroke: '#0F6E56' },
  saude:    { fill: '#EEEDFE', stroke: '#534AB7' },
  protecao: { fill: '#FAECE7', stroke: '#993C1D' },
  setorial: { fill: '#FAC775', stroke: '#854F0B' },
};
function getGroup(id: number): string {
  for (const [g, ids] of Object.entries(GROUPS)) if (ids.includes(id)) return g;
  return 'setorial';
}

/* ── raw link definitions ── */
const RAW_LINKS: { s: number; t: number; strength: number }[] = [
  /* NR-1 foundation */
  ...[3,4,5,6,7,9,10,12,15,16,17,18,23,24,26,28,33,35].map(t => ({ s: 1, t, strength: t <= 5 ? 0.72 : 0.65 })),
  /* admin safety trio */
  { s: 4, t: 5, strength: 0.92 }, { s: 5, t: 7, strength: 0.88 }, { s: 4, t: 7, strength: 0.85 },
  /* protection chain */
  { s: 6, t: 9, strength: 0.90 }, { s: 9, t: 15, strength: 0.93 }, { s: 6, t: 15, strength: 0.86 },
  /* electrical risk */
  { s: 10, t: 16, strength: 0.91 },
  /* construction trio */
  { s: 18, t: 35, strength: 0.94 }, { s: 18, t: 33, strength: 0.88 }, { s: 33, t: 35, strength: 0.90 },
  /* industrial */
  { s: 12, t: 15, strength: 0.58 },
  /* comfort */
  { s: 17, t: 24, strength: 0.85 },
  /* emergency */
  { s: 23, t: 26, strength: 0.89 },
  /* fiscalizacao */
  { s: 28, t: 3, strength: 0.87 }, { s: 28, t: 1, strength: 0.75 },
  /* cross-group extras */
  { s: 7, t: 15, strength: 0.55 }, { s: 9, t: 17, strength: 0.42 }, { s: 12, t: 18, strength: 0.48 },
];

/* ── Ella analysis ── */
function ellaText(node: GNode, neighbors: GNode[], links: GLink[]): string {
  const conns = links.length;
  const strongest = links.sort((a, b) => b.strength - a.strength)[0];
  const strongTarget = strongest
    ? neighbors.find(n => n.id === (typeof strongest.target === 'object' ? (strongest.target as GNode).id : strongest.target) ||
                          n.id === (typeof strongest.source === 'object' ? (strongest.source as GNode).id : strongest.source))
    : null;
  const pct = strongest ? Math.round(strongest.strength * 100) : 0;
  return `NR-${String(node.id).padStart(2, '0')} — ${node.title}\n\n` +
    `Possui ${conns} conexao(oes) neste setor. ` +
    (strongTarget ? `Correlacao mais forte (${pct}%) com NR-${String(strongTarget.id).padStart(2, '0')} (${strongTarget.title}). ` : '') +
    `Grupo: ${node.group}. Relevancia: ${node.relevance}/5.`;
}

/* ── Component ── */
export default function NRCorrelationGraph({ nrs, sectorName, onClose }: NRCorrelationGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showStrength, setShowStrength] = useState(false);
  const [ellaMsg, setEllaMsg] = useState('Clique em um no para analisar');
  const simRef = useRef<d3.Simulation<GNode, GLink> | null>(null);

  /* build nodes & links filtered to sector */
  const nrIds = new Set(nrs.map(n => n.id));
  const nodes: GNode[] = nrs.map(n => ({ ...n, group: getGroup(n.id), x: 0, y: 0, vx: 0, vy: 0 }));
  const links: GLink[] = RAW_LINKS
    .filter(l => nrIds.has(l.s) && nrIds.has(l.t))
    .map(l => ({ source: l.s, target: l.t, strength: l.strength }));

  const radius = (r: number) => 8 + r * 4;

  const resetHighlight = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('.link, .node-g, .link-label').attr('opacity', 1);
    setEllaMsg('Clique em um no para analisar');
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;
    svg.selectAll('*').remove();

    const g = svg.append('g');

    /* zoom */
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);
    svg.on('click', (e) => { if (e.target === svgRef.current) resetHighlight(); });

    /* simulation */
    const sim = d3.forceSimulation<GNode>(nodes)
      .force('link', d3.forceLink<GNode, GLink>(links).id(d => d.id).distance(d => 120 - (d as GLink).strength * 40).strength(d => (d as GLink).strength * 0.6))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<GNode>().radius(d => radius(d.relevance) + 6));
    simRef.current = sim;

    /* links */
    const linkSel = g.selectAll<SVGLineElement, GLink>('.link')
      .data(links).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#475569').attr('stroke-opacity', 0.5).attr('stroke-width', 2);

    /* link labels (hidden until toggle) */
    const linkLabel = g.selectAll<SVGTextElement, GLink>('.link-label')
      .data(links).enter().append('text')
      .attr('class', 'link-label')
      .attr('fill', '#94a3b8').attr('font-size', 10).attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .text(d => `${Math.round(d.strength * 100)}%`);

    /* node groups */
    const nodeG = g.selectAll<SVGGElement, GNode>('.node-g')
      .data(nodes).enter().append('g')
      .attr('class', 'node-g').attr('cursor', 'pointer');

    /* drag */
    const drag = d3.drag<SVGGElement, GNode>()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
    nodeG.call(drag);

    /* circles */
    nodeG.append('circle')
      .attr('r', d => radius(d.relevance))
      .attr('fill', d => GROUP_STYLE[d.group]?.fill ?? '#FAC775')
      .attr('stroke', d => GROUP_STYLE[d.group]?.stroke ?? '#854F0B')
      .attr('stroke-width', 2.5);

    /* labels inside circles */
    nodeG.append('text')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', d => GROUP_STYLE[d.group]?.stroke ?? '#854F0B')
      .attr('font-size', d => Math.max(10, radius(d.relevance) * 0.65))
      .attr('font-weight', 700)
      .text(d => String(d.id).padStart(2, '0'));

    /* tooltip */
    const tooltip = d3.select(svgRef.current.parentElement!)
      .append('div')
      .style('position', 'absolute').style('pointer-events', 'none')
      .style('background', '#0f172a').style('color', '#e2e8f0')
      .style('padding', '6px 10px').style('border-radius', '6px')
      .style('font-size', '12px').style('opacity', '0').style('z-index', '9999');

    nodeG.on('mouseenter', (e, d) => {
      tooltip.style('opacity', '1').html(`<b>NR-${String(d.id).padStart(2, '0')}</b>: ${d.title}`);
    }).on('mousemove', (e) => {
      const rect = svgRef.current!.parentElement!.getBoundingClientRect();
      tooltip.style('left', `${e.clientX - rect.left + 14}px`).style('top', `${e.clientY - rect.top - 10}px`);
    }).on('mouseleave', () => tooltip.style('opacity', '0'));

    /* click highlight */
    nodeG.on('click', (e, d) => {
      e.stopPropagation();
      const neighborIds = new Set<number>();
      const connLinks: GLink[] = [];
      links.forEach(l => {
        const sid = typeof l.source === 'object' ? (l.source as GNode).id : l.source as number;
        const tid = typeof l.target === 'object' ? (l.target as GNode).id : l.target as number;
        if (sid === d.id) { neighborIds.add(tid); connLinks.push(l); }
        if (tid === d.id) { neighborIds.add(sid); connLinks.push(l); }
      });
      neighborIds.add(d.id);
      nodeG.attr('opacity', n => neighborIds.has(n.id) ? 1 : 0.12);
      linkSel.attr('opacity', l => {
        const sid = typeof l.source === 'object' ? (l.source as GNode).id : l.source as number;
        const tid = typeof l.target === 'object' ? (l.target as GNode).id : l.target as number;
        return sid === d.id || tid === d.id ? 1 : 0.12;
      });
      linkLabel.attr('opacity', l => {
        if (!showStrength) return 0;
        const sid = typeof l.source === 'object' ? (l.source as GNode).id : l.source as number;
        const tid = typeof l.target === 'object' ? (l.target as GNode).id : l.target as number;
        return sid === d.id || tid === d.id ? 1 : 0.12;
      });
      const neighborNodes = nodes.filter(n => neighborIds.has(n.id) && n.id !== d.id);
      setEllaMsg(ellaText(d, neighborNodes, connLinks));
    });

    /* tick */
    sim.on('tick', () => {
      linkSel.attr('x1', d => (d.source as GNode).x!).attr('y1', d => (d.source as GNode).y!)
             .attr('x2', d => (d.target as GNode).x!).attr('y2', d => (d.target as GNode).y!);
      linkLabel.attr('x', d => ((d.source as GNode).x! + (d.target as GNode).x!) / 2)
               .attr('y', d => ((d.source as GNode).y! + (d.target as GNode).y!) / 2);
      nodeG.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    /* zoom controls stored in data attribute for buttons */
    (svg.node() as any).__zoom_obj = zoom;

    return () => { sim.stop(); tooltip.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nrs]);

  /* strength toggle effect */
  useEffect(() => {
    if (!svgRef.current) return;
    const g = d3.select(svgRef.current).select('g');
    g.selectAll<SVGLineElement, GLink>('.link')
      .attr('stroke-width', d => showStrength ? 1 + d.strength * 8 : 2)
      .attr('stroke', d => {
        if (!showStrength) return '#475569';
        if (d.strength > 0.8) return '#22d3ee';
        if (d.strength >= 0.5) return '#f59e0b';
        return '#f87171';
      })
      .attr('stroke-opacity', showStrength ? 0.8 : 0.5);
    g.selectAll<SVGTextElement, GLink>('.link-label').attr('opacity', showStrength ? 1 : 0);
  }, [showStrength]);

  const zoomBy = (factor: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const z = (svg.node() as any).__zoom_obj;
    if (z) svg.transition().duration(300).call(z.scaleBy, factor);
  };
  const zoomFit = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const z = (svg.node() as any).__zoom_obj;
    if (z) svg.transition().duration(400).call(z.transform, d3.zoomIdentity);
  };

  /* ── legend ── */
  const legendItems = Object.entries(GROUP_STYLE).map(([key, val]) => ({
    key, label: key.charAt(0).toUpperCase() + key.slice(1), ...val,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,7,13,0.92)', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(100,116,139,0.25)' }}>
        <div>
          <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: 15 }}>Grafo de Correlacao NRs</span>
          <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 12 }}>{sectorName}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowStrength(v => !v)} style={{ background: showStrength ? '#164e63' : '#1e293b', color: showStrength ? '#22d3ee' : '#94a3b8', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
            {showStrength ? 'Ocultar Forca' : 'Mostrar Forca'}
          </button>
          <button onClick={onClose} style={{ background: '#1e293b', color: '#f87171', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
            Fechar
          </button>
        </div>
      </div>

      {/* graph area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%', background: 'transparent' }} />

        {/* zoom buttons */}
        <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ label: '+', fn: () => zoomBy(1.4) }, { label: '−', fn: () => zoomBy(0.7) }, { label: 'fit', fn: zoomFit }].map(b => (
            <button key={b.label} onClick={b.fn} style={{ width: 32, height: 32, background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              {b.label}
            </button>
          ))}
        </div>

        {/* legend */}
        <div style={{ position: 'absolute', top: 12, left: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {legendItems.map(l => (
            <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.fill, border: `2px solid ${l.stroke}`, display: 'inline-block' }} />
              <span style={{ color: '#94a3b8', fontSize: 11 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ella footer */}
      <div style={{ height: 120, borderTop: '1px solid rgba(100,116,139,0.25)', padding: '14px 20px', background: '#0c1220', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Ella</span>
          <span style={{ color: '#cbd5e1', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{ellaMsg}</span>
        </div>
      </div>
    </div>
  );
}
