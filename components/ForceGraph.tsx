'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { X, Search, Plus, RotateCcw, Volume2, Pause, Loader2, VolumeX, ArrowRight, ChevronDown } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ForceGraph — componente generico force-directed com camada bayesiana
   Spec: skill Force-Directed Graph com Camada Bayesiana
   ═══════════════════════════════════════════════════════════════ */

export interface ForceGraphNode {
  id: string;
  group: string;
  label?: string;
  r?: number;
  bayesianWeight?: number;
}

export interface ForceGraphLink {
  source: string;
  target: string;
  strength: number;
  label?: string;
}

export interface CategoryStyle {
  fill: string;
  stroke: string;
  text: string;
}

export interface AgentResponseObject {
  text: string;
  suggestion?: string;
  /** Id do no que deve ser selecionado quando o usuario clicar na sugestao. */
  suggestionTarget?: string;
  /** Texto a ser enviado pro TTS. Default: text + (suggestion || ''). */
  audioText?: string;
}

export type AgentResponse = string | AgentResponseObject;

export interface AgentFooterConfig {
  label: string;
  placeholder?: string;
  onNodeSelect: (
    node: ForceGraphNode,
    neighbors: Array<{ node: ForceGraphNode; strength: number; label?: string }>
  ) => Promise<AgentResponse>;
  /** Endpoint TTS (POST text → audio/mpeg blob). Se omitido, audio nao e ativado. */
  ttsEndpoint?: string;
  /** Toca audio automaticamente quando a resposta do agente termina. Default: true. */
  autoPlayAudio?: boolean;
  /** Velocidade do typewriter em chars/segundo. Default: 42. */
  typewriterCps?: number;
}

export interface ForceGraphProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
  categoryColors: Record<string, CategoryStyle>;
  agentFooter?: AgentFooterConfig;
}

type SimNode = d3.SimulationNodeDatum & ForceGraphNode;
type SimLink = d3.SimulationLinkDatum<SimNode> & { strength: number; label?: string };

const FORCE_COLORS = { high: '#1D9E75', mid: '#BA7517', low: '#D85A30' };
const SELECTED_STROKE = '#E24B4A';
const LABELS_HIDDEN_THRESHOLD = 100;

function forceStrokeColor(s: number) {
  if (s >= 0.8) return FORCE_COLORS.high;
  if (s >= 0.5) return FORCE_COLORS.mid;
  return FORCE_COLORS.low;
}

function cloneNode(n: ForceGraphNode): SimNode {
  return { ...n };
}
function cloneLink(l: ForceGraphLink): SimLink {
  return { source: l.source, target: l.target, strength: l.strength, label: l.label };
}

export default function ForceGraph({
  isOpen, onClose, title, subtitle, nodes: nodesProp, links: linksProp, categoryColors, agentFooter,
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);

  // State
  const [nodesVersion, setNodesVersion] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForce, setShowForce] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chargeStrength, setChargeStrength] = useState(-200);
  const [linkDistance, setLinkDistance] = useState(80);
  const [agentText, setAgentText] = useState('');
  const [agentSuggestion, setAgentSuggestion] = useState('');
  const [agentSuggestionTarget, setAgentSuggestionTarget] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [typedSuggestion, setTypedSuggestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [addedCount, setAddedCount] = useState(0);

  const showLabels = nodesRef.current.length <= LABELS_HIDDEN_THRESHOLD;

  // ── Esc fecha ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  // ── Bloqueia scroll ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, [isOpen]);

  // ── Reset agent state quando fecha ───────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setAgentText(''); setAgentSuggestion('');
      setTypedText(''); setTypedSuggestion('');
      setIsTyping(false);
      setSearchQuery('');
      stopAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioState('idle');
  }, []);

  // ── (Re)inicializa dados originais quando props mudam ou reset ───
  const resetData = useCallback(() => {
    nodesRef.current = nodesProp.map(cloneNode);
    linksRef.current = linksProp.map(cloneLink);
    setAddedCount(0);
    setSelectedId(null);
    setAgentText(''); setAgentSuggestion('');
    setTypedText(''); setTypedSuggestion('');
    setSearchQuery('');
    setNodesVersion(v => v + 1);
  }, [nodesProp, linksProp]);

  useEffect(() => {
    nodesRef.current = nodesProp.map(cloneNode);
    linksRef.current = linksProp.map(cloneLink);
    setNodesVersion(v => v + 1);
  }, [nodesProp, linksProp]);

  // ── d3 render principal ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !svgRef.current) return;
    const svgEl = svgRef.current;
    const svg = d3.select(svgEl);
    const width = svgEl.clientWidth || 800;
    const height = svgEl.clientHeight || 600;

    svg.selectAll('*').remove();

    const g = svg.append('g');
    gRef.current = g.node();

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);
    zoomRef.current = zoom;

    // Click canvas vazio → desfaz foco
    svg.on('click', e => { if (e.target === svgEl || e.target === g.node()) setSelectedId(null); });

    // Simulation
    const simNodes = nodesRef.current;
    const simLinks = linksRef.current;

    // Posiciona nos ja centralizados numa espiral philotactica pra
    // simulacao comecar proxima da posicao final — ninguem "entra" antes
    // de outro, evitando o efeito de "arestas aparecendo antes dos nos".
    const initR = 40;
    simNodes.forEach((n, i) => {
      if (n.x == null || Number.isNaN(n.x)) n.x = width / 2 + initR * Math.sqrt(0.5 + i) * Math.cos(i * 2.3998);
      if (n.y == null || Number.isNaN(n.y)) n.y = height / 2 + initR * Math.sqrt(0.5 + i) * Math.sin(i * 2.3998);
      n.vx = 0; n.vy = 0;
    });

    const sim = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks)
        .id(d => d.id)
        .distance(() => linkDistance)
        .strength(l => (l as SimLink).strength * 0.6))
      .force('charge', d3.forceManyBody().strength(chargeStrength).distanceMax(400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.06))
      .force('y', d3.forceY(height / 2).strength(0.06))
      .force('collide', d3.forceCollide<SimNode>().radius(d => (d.r ?? 16) + 8));
    simRef.current = sim;

    // Freeze on end
    sim.on('end', () => {
      simNodes.forEach(n => { n.fx = n.x; n.fy = n.y; });
    });

    // CANON (determinístico): nós entram PRIMEIRO, arestas entram DEPOIS com animação.
    // É proibido renderizar arestas antes dos nós estarem visíveis.
    // Ordem de append (z-order): linkLayer abaixo, nodeLayer acima.
    const linkLayer = g.append('g').attr('class', 'link-layer');
    const nodeLayer = g.append('g').attr('class', 'node-layer');
    linkLayer.attr('opacity', 0).style('transition', 'opacity 0.55s ease');
    nodeLayer.attr('opacity', 0).style('transition', 'opacity 0.4s ease');

    const EDGE_DELAY_MS = 650;  // atraso entre entrada dos nós e entrada das arestas

    let revealedNodes = false;
    let revealedLinks = false;
    const revealNodesFirst = () => {
      if (revealedNodes) return;
      revealedNodes = true;
      requestAnimationFrame(() => {
        nodeLayer.attr('opacity', 1);
        // Schedule link reveal — nós precisam estar visíveis antes.
        setTimeout(() => {
          if (revealedLinks) return;
          revealedLinks = true;
          linkLayer.attr('opacity', 1);
          // Animação de "desenho" em cada linha — stroke-dasharray decrescente.
          linkLayer.selectAll<SVGLineElement, SimLink>('line.link').each(function() {
            const el = this as SVGLineElement;
            let len = 0;
            try { len = el.getTotalLength(); } catch { len = 200; }
            el.style.transition = 'none';
            el.setAttribute('stroke-dasharray', String(len));
            el.setAttribute('stroke-dashoffset', String(len));
            // Force reflow
            void el.getBoundingClientRect();
            el.style.transition = 'stroke-dashoffset 0.7s ease-out';
            el.setAttribute('stroke-dashoffset', '0');
            setTimeout(() => {
              el.style.transition = '';
              el.removeAttribute('stroke-dasharray');
              el.removeAttribute('stroke-dashoffset');
            }, 900);
          });
        }, EDGE_DELAY_MS);
      });
    };

    const linkSel = linkLayer.selectAll<SVGLineElement, SimLink>('line.link')
      .data(simLinks).enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'var(--color-border-tertiary, #475569)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1);

    const linkLabelGroup = linkLayer.selectAll<SVGGElement, SimLink>('g.link-label')
      .data(simLinks).enter().append('g')
      .attr('class', 'link-label')
      .attr('opacity', 0);

    linkLabelGroup.append('rect')
      .attr('fill', '#ffffff')
      .attr('rx', 3)
      .attr('ry', 3);
    linkLabelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#1e293b')
      .attr('font-size', 10)
      .attr('font-weight', 700);

    // Nodes
    const nodeG = nodeLayer.selectAll<SVGGElement, SimNode>('g.node-g')
      .data(simNodes, (d: SimNode) => d.id).enter().append('g')
      .attr('class', 'node-g')
      .attr('cursor', 'pointer')
      .style('transition', 'opacity 0.25s ease, transform 0.25s ease');

    // Drag
    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = e.x; d.fy = e.y; });
    nodeG.call(drag);

    nodeG.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => d.r ?? 16)
      .attr('fill', d => categoryColors[d.group]?.fill ?? '#FAC775')
      .attr('fill-opacity', d => 0.4 + 0.6 * (d.bayesianWeight ?? 1))
      .attr('stroke', d => categoryColors[d.group]?.stroke ?? '#854F0B')
      .attr('stroke-width', 2.5);

    if (showLabels) {
      nodeG.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', d => categoryColors[d.group]?.text ?? '#854F0B')
        .attr('font-size', d => Math.max(10, (d.r ?? 16) * 0.65))
        .attr('font-weight', 700)
        .attr('pointer-events', 'none')
        .text(d => d.label ?? d.id);
    }

    // Tooltip (simple via title)
    nodeG.append('title').text(d => `${d.label ?? d.id} (${d.group})`);

    // Click no no
    nodeG.on('click', (e, d) => { e.stopPropagation(); setSelectedId(d.id); });

    // Tick
    sim.on('tick', () => {
      linkSel
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!);

      linkLabelGroup.attr('transform', d => {
        const s = d.source as SimNode, t = d.target as SimNode;
        return `translate(${(s.x! + t.x!) / 2},${(s.y! + t.y!) / 2})`;
      });
      linkLabelGroup.select('text').text(d => `${Math.round(d.strength * 100)}%`);
      linkLabelGroup.each(function() {
        const gEl = this as SVGGElement;
        const rect = gEl.querySelector('rect');
        const txt = gEl.querySelector('text');
        if (!rect || !txt) return;
        const bb = (txt as SVGTextElement).getBBox();
        rect.setAttribute('x', String(bb.x - 3));
        rect.setAttribute('y', String(bb.y - 1));
        rect.setAttribute('width', String(bb.width + 6));
        rect.setAttribute('height', String(bb.height + 2));
      });

      nodeG.attr('transform', d => `translate(${d.x},${d.y})`);

      revealNodesFirst();
    });

    return () => { sim.stop(); };
  }, [isOpen, nodesVersion, categoryColors, showLabels]);

  // ── Sync charge/distance sliders → sim ───────────────────────────
  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    const charge = sim.force<d3.ForceManyBody<SimNode>>('charge');
    if (charge) charge.strength(chargeStrength);
    const link = sim.force<d3.ForceLink<SimNode, SimLink>>('link');
    if (link) link.distance(linkDistance);
    // Soltar fixacao pra reassentar
    nodesRef.current.forEach(n => { n.fx = null; n.fy = null; });
    sim.alpha(0.3).restart();
  }, [chargeStrength, linkDistance]);

  // ── Sync showForce toggle → estilos das arestas ──────────────────
  useEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const sel = d3.select(g);
    sel.selectAll<SVGLineElement, SimLink>('line.link')
      .attr('stroke-width', d => showForce ? 1 + d.strength * 8 : 1)
      .attr('stroke', d => showForce
        ? forceStrokeColor(d.strength)
        : 'var(--color-border-tertiary, #475569)')
      .attr('stroke-opacity', showForce ? 0.9 : 0.5);
    sel.selectAll<SVGGElement, SimLink>('g.link-label').attr('opacity', showForce ? 1 : 0);
  }, [showForce, nodesVersion]);

  // ── Sync selectedId / searchQuery → opacity/transform ────────────
  useEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const sel = d3.select(g);
    const simLinks = linksRef.current;

    const neighborIds = new Set<string>();
    if (selectedId) {
      neighborIds.add(selectedId);
      simLinks.forEach(l => {
        const sid = typeof l.source === 'object' ? (l.source as SimNode).id : l.source as string;
        const tid = typeof l.target === 'object' ? (l.target as SimNode).id : l.target as string;
        if (sid === selectedId) neighborIds.add(tid);
        if (tid === selectedId) neighborIds.add(sid);
      });
    }

    const q = searchQuery.trim().toLowerCase();

    sel.selectAll<SVGGElement, SimNode>('g.node-g')
      .attr('opacity', d => {
        if (q) {
          const label = (d.label ?? d.id).toLowerCase();
          return label.includes(q) || d.group.toLowerCase().includes(q) ? 1 : 0.2;
        }
        if (selectedId) return neighborIds.has(d.id) ? 1 : 0.12;
        return 1;
      })
      .style('transform-origin', 'center')
      .style('transform-box', 'fill-box');

    sel.selectAll<SVGCircleElement, SimNode>('circle.node-circle')
      .attr('stroke', d => d.id === selectedId
        ? SELECTED_STROKE
        : (categoryColors[d.group]?.stroke ?? '#854F0B'))
      .attr('stroke-width', d => d.id === selectedId ? 3 : 2.5)
      .attr('transform', d => (selectedId && !neighborIds.has(d.id)) ? 'scale(0.85)' : 'scale(1)');

    sel.selectAll<SVGLineElement, SimLink>('line.link')
      .attr('opacity', l => {
        if (!selectedId) return 1;
        const sid = typeof l.source === 'object' ? (l.source as SimNode).id : l.source as string;
        const tid = typeof l.target === 'object' ? (l.target as SimNode).id : l.target as string;
        return sid === selectedId || tid === selectedId ? 1 : 0.05;
      });

    sel.selectAll<SVGGElement, SimLink>('g.link-label')
      .attr('opacity', l => {
        if (!showForce) return 0;
        if (!selectedId) return 1;
        const sid = typeof l.source === 'object' ? (l.source as SimNode).id : l.source as string;
        const tid = typeof l.target === 'object' ? (l.target as SimNode).id : l.target as string;
        return sid === selectedId || tid === selectedId ? 1 : 0.15;
      });
  }, [selectedId, searchQuery, categoryColors, showForce, nodesVersion]);

  // ── Agent onNodeSelect trigger ───────────────────────────────────
  useEffect(() => {
    if (!selectedId || !agentFooter) return;
    const node = nodesRef.current.find(n => n.id === selectedId);
    if (!node) return;
    const neighbors: Array<{ node: ForceGraphNode; strength: number; label?: string }> = [];
    linksRef.current.forEach(l => {
      const sid = typeof l.source === 'object' ? (l.source as SimNode).id : l.source as string;
      const tid = typeof l.target === 'object' ? (l.target as SimNode).id : l.target as string;
      if (sid === selectedId) {
        const n = nodesRef.current.find(x => x.id === tid);
        if (n) neighbors.push({ node: n, strength: l.strength, label: l.label });
      } else if (tid === selectedId) {
        const n = nodesRef.current.find(x => x.id === sid);
        if (n) neighbors.push({ node: n, strength: l.strength, label: l.label });
      }
    });

    let cancelled = false;
    stopAudio();
    setAgentLoading(true);
    setAgentText(''); setAgentSuggestion(''); setAgentSuggestionTarget(null);
    setTypedText(''); setTypedSuggestion('');
    setIsTyping(false);
    agentFooter.onNodeSelect(node, neighbors)
      .then(r => {
        if (cancelled) return;
        if (typeof r === 'string') {
          setAgentText(r); setAgentSuggestion(''); setAgentSuggestionTarget(null);
        } else {
          setAgentText(r.text || '');
          setAgentSuggestion(r.suggestion || '');
          setAgentSuggestionTarget(r.suggestionTarget ?? null);
        }
      })
      .catch(e => {
        if (!cancelled) {
          setAgentText(`erro: ${(e as Error).message}`);
          setAgentSuggestion(''); setAgentSuggestionTarget(null);
        }
      })
      .finally(() => { if (!cancelled) setAgentLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId, agentFooter, stopAudio]);

  const handleSuggestionClick = useCallback(() => {
    if (!agentSuggestionTarget) return;
    const exists = nodesRef.current.some(n => n.id === agentSuggestionTarget);
    if (exists) setSelectedId(agentSuggestionTarget);
  }, [agentSuggestionTarget]);

  // ── Typewriter: digita text e depois suggestion ──────────────────
  useEffect(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (!agentText) { setTypedText(''); setTypedSuggestion(''); setIsTyping(false); return; }
    const cps = Math.max(10, agentFooter?.typewriterCps ?? 42);
    const intervalMs = Math.max(6, Math.floor(1000 / cps));
    const full = agentText;
    const suggestionFull = agentSuggestion;
    let i = 0;
    let phase: 'text' | 'pause' | 'suggestion' | 'done' = 'text';
    let pauseTicks = 0;
    setTypedText(''); setTypedSuggestion(''); setIsTyping(true);
    typingTimerRef.current = setInterval(() => {
      if (phase === 'text') {
        i++;
        setTypedText(full.slice(0, i));
        if (i >= full.length) {
          phase = suggestionFull ? 'pause' : 'done';
          pauseTicks = 0; i = 0;
        }
      } else if (phase === 'pause') {
        pauseTicks++;
        if (pauseTicks > 12) phase = 'suggestion';
      } else if (phase === 'suggestion') {
        i++;
        setTypedSuggestion(suggestionFull.slice(0, i));
        if (i >= suggestionFull.length) phase = 'done';
      }
      if (phase === 'done') {
        if (typingTimerRef.current) { clearInterval(typingTimerRef.current); typingTimerRef.current = null; }
        setIsTyping(false);
      }
    }, intervalMs);
    return () => {
      if (typingTimerRef.current) { clearInterval(typingTimerRef.current); typingTimerRef.current = null; }
    };
  }, [agentText, agentSuggestion, agentFooter?.typewriterCps]);

  // ── Audio: carrega TTS quando resposta chega ────────────────────
  useEffect(() => {
    if (!agentText || !agentFooter?.ttsEndpoint) return;
    const autoplay = agentFooter.autoPlayAudio !== false;
    const endpoint = agentFooter.ttsEndpoint;
    const audioText = (agentText + (agentSuggestion ? `\n\n${agentSuggestion}` : '')).trim();
    if (!audioText) return;

    let cancelled = false;
    stopAudio();
    setAudioState('loading');

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: audioText, voice: 'nova' }),
    })
      .then(r => r.ok ? r.blob() : Promise.reject(new Error(`tts ${r.status}`)))
      .then(blob => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = () => { setAudioState('idle'); };
        a.onerror = () => { setAudioState('error'); };
        a.onplay = () => setAudioState('playing');
        a.onpause = () => { if (!a.ended) setAudioState('idle'); };
        if (autoplay) a.play().catch(() => setAudioState('idle'));
        else setAudioState('idle');
      })
      .catch(() => { if (!cancelled) setAudioState('error'); });

    return () => { cancelled = true; };
  }, [agentText, agentSuggestion, agentFooter?.ttsEndpoint, agentFooter?.autoPlayAudio, stopAudio]);

  const toggleAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    if (audioState === 'playing') a.pause();
    else a.play().catch(() => setAudioState('error'));
  };

  // ── Scroll hint no footer do agente ─────────────────────────────
  const agentScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const checkScrollHint = useCallback(() => {
    const el = agentScrollRef.current;
    if (!el) return;
    const overflow = el.scrollHeight - el.clientHeight;
    const remaining = overflow - el.scrollTop;
    setShowScrollHint(overflow > 8 && remaining > 12);
  }, []);
  useEffect(() => {
    // Re-avalia o hint a cada atualizacao do typewriter (conteudo cresce).
    const id = requestAnimationFrame(checkScrollHint);
    return () => cancelAnimationFrame(id);
  }, [checkScrollHint, typedText, typedSuggestion, agentLoading]);
  useEffect(() => {
    const el = agentScrollRef.current;
    if (!el) return;
    const h = () => checkScrollHint();
    el.addEventListener('scroll', h, { passive: true });
    return () => el.removeEventListener('scroll', h);
  }, [checkScrollHint]);
  const scrollAgentToBottom = useCallback(() => {
    const el = agentScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  // ── Zoom controls ────────────────────────────────────────────────
  const zoomBy = (factor: number) => {
    const svg = d3.select(svgRef.current!);
    if (zoomRef.current) svg.transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };
  const zoomFit = () => {
    const svgEl = svgRef.current;
    const g = gRef.current;
    if (!svgEl || !g || !zoomRef.current) return;
    const bbox = (g as SVGGraphicsElement).getBBox();
    if (!bbox.width || !bbox.height) return;
    const pad = 40;
    const w = svgEl.clientWidth, h = svgEl.clientHeight;
    const k = Math.min((w - 2 * pad) / bbox.width, (h - 2 * pad) / bbox.height, 5);
    const tx = (w - k * (bbox.x * 2 + bbox.width)) / 2;
    const ty = (h - k * (bbox.y * 2 + bbox.height)) / 2;
    d3.select(svgEl).transition().duration(400).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(tx, ty).scale(k)
    );
  };

  // ── Add random node ──────────────────────────────────────────────
  const addRandomNode = () => {
    if (nodesRef.current.length === 0) return;
    const groups = Object.keys(categoryColors);
    const group = groups[Math.floor(Math.random() * groups.length)] ?? 'default';
    const target = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
    const id = `gen-${Date.now()}-${addedCount}`;
    const newNode: SimNode = {
      id, group, label: `+${addedCount + 1}`, r: 14,
      bayesianWeight: 0.5 + Math.random() * 0.5,
      x: target.x, y: target.y,
    };
    const newLink: SimLink = {
      source: id, target: target.id,
      strength: 0.3 + Math.random() * 0.6,
    };
    nodesRef.current = [...nodesRef.current, newNode];
    linksRef.current = [...linksRef.current, newLink];
    setAddedCount(c => c + 1);
    setNodesVersion(v => v + 1);
  };

  if (!isOpen) return null;

  const agentInitial = agentFooter?.label?.charAt(0).toUpperCase() ?? '?';
  const hasResponse = agentText.length > 0;
  const displayPlaceholder = agentFooter?.placeholder || 'Clique em um nó para analisar.';
  const AudioIcon = audioState === 'loading' ? Loader2
    : audioState === 'playing' ? Pause
    : audioState === 'error' ? VolumeX
    : Volume2;
  const audioEnabled = !!agentFooter?.ttsEndpoint;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4vh 4vw',
        fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
      }}
    >
      <div style={{
        width: '92vw', height: '92vh',
        maxWidth: '92vw', maxHeight: '92vh',
        background: 'var(--color-background-primary, #050d1a)',
        border: '1px solid var(--color-border-tertiary, rgba(100,116,139,0.4))',
        borderRadius: 'var(--border-radius-lg, 16px)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* ═══ HEADER ═══ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          padding: '12px 20px', borderBottom: '1px solid var(--color-border-tertiary, rgba(100,116,139,0.25))',
          background: 'var(--color-background-secondary, #0c1220)',
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ color: '#22d3ee', fontWeight: 700, fontSize: 15 }}>{title ?? 'Force Graph'}</div>
            {subtitle && <div style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: 12 }}>{subtitle}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            {/* Slider Repulsão */}
            <SliderCtl label="Repulsão" value={chargeStrength} min={-600} max={-30} step={10}
              onChange={setChargeStrength} width={100} />
            {/* Slider Distância */}
            <SliderCtl label="Distância" value={linkDistance} min={30} max={200} step={5}
              onChange={setLinkDistance} width={100} />

            {/* Busca */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, color: 'var(--color-text-secondary, #94a3b8)' }} />
              <input
                type="text" placeholder="Buscar…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '5px 10px 5px 28px', width: 140, fontSize: 12,
                  background: 'rgba(15,23,42,0.6)',
                  color: 'var(--color-text-primary, #e2e8f0)',
                  border: '1px solid var(--color-border-tertiary, rgba(100,116,139,0.3))',
                  borderRadius: 'var(--border-radius-md, 8px)', outline: 'none',
                }}
              />
            </div>

            <button onClick={() => setShowForce(v => !v)}
              style={btnStyle(showForce ? '#164e63' : '#1e293b', showForce ? '#22d3ee' : '#94a3b8')}>
              {showForce ? 'Ocultar Força' : 'Mostrar Força'}
            </button>

            <button onClick={addRandomNode} title="Adicionar nó aleatório"
              style={{ ...btnStyle('#1e293b', '#94a3b8'), display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12} /> Nó
            </button>

            <button onClick={resetData} title="Restaurar dados originais"
              style={{ ...btnStyle('#1e293b', '#94a3b8'), display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <RotateCcw size={12} /> Resetar
            </button>
          </div>

          <button onClick={onClose} aria-label="Fechar"
            style={{ ...btnStyle('transparent', '#94a3b8'), padding: 6, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* ═══ BODY (canvas) ═══ */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <svg ref={svgRef} style={{ width: '100%', height: '100%', background: 'transparent', display: 'block' }} />

          {/* Legenda de categorias */}
          <div style={{ position: 'absolute', top: 12, left: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(categoryColors).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.fill, border: `2px solid ${v.stroke}`, display: 'inline-block' }} />
                <span style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: 11 }}>{k}</span>
              </div>
            ))}
          </div>

          {/* Legenda de força (quando ativo) */}
          {showForce && (
            <div style={{
              position: 'absolute', bottom: 12, left: 16, display: 'flex', gap: 10,
              padding: '6px 10px',
              background: 'var(--color-background-secondary, rgba(15,23,42,0.85))',
              border: '1px solid var(--color-border-tertiary, rgba(100,116,139,0.3))',
              borderRadius: 'var(--border-radius-md, 8px)',
            }}>
              <LegItem color={FORCE_COLORS.high} label="≥ 80%" />
              <LegItem color={FORCE_COLORS.mid} label="50–80%" />
              <LegItem color={FORCE_COLORS.low} label="< 50%" />
            </div>
          )}

          {/* Zoom controls */}
          <div style={{ position: 'absolute', bottom: 12, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { k: '+', fn: () => zoomBy(1.4) },
              { k: '−', fn: () => zoomBy(0.7) },
              { k: 'fit', fn: zoomFit },
            ].map(b => (
              <button key={b.k} onClick={b.fn}
                style={{ width: 32, height: 32, background: '#1e293b', color: '#e2e8f0',
                  border: '1px solid var(--color-border-tertiary, rgba(100,116,139,0.3))',
                  borderRadius: 'var(--border-radius-md, 6px)', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                {b.k}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ FOOTER (agent slot) ═══ */}
        {agentFooter && (
          <div style={{
            height: 160, flexShrink: 0, position: 'relative',
            borderTop: '1px solid var(--color-border-tertiary, rgba(100,116,139,0.25))',
            background: 'var(--color-background-secondary, #0c1220)',
          }}>
            <div
              ref={agentScrollRef}
              style={{
                height: '100%', overflowY: 'auto', padding: '14px 20px',
                display: 'flex', gap: 12,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#22d3ee,#0a84ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#050d1a', fontWeight: 800, fontSize: 14,
              }}>{agentInitial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#22d3ee', fontWeight: 700, fontSize: 13 }}>{agentFooter.label}</span>
                  {audioEnabled && hasResponse && (
                    <button
                      onClick={toggleAudio}
                      disabled={audioState === 'loading' || audioState === 'error'}
                      aria-label={audioState === 'playing' ? 'Pausar audio' : 'Ouvir audio'}
                      title={audioState === 'error' ? 'TTS indisponivel'
                        : audioState === 'playing' ? 'Pausar'
                        : audioState === 'loading' ? 'Carregando audio...'
                        : 'Ouvir em voz alta'}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: '50%',
                        border: `1.5px solid ${audioState === 'playing' ? '#ec4899'
                          : audioState === 'error' ? 'rgba(100,116,139,0.4)' : '#fbbf24'}`,
                        background: audioState === 'playing'
                          ? 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(168,85,247,0.15))'
                          : audioState === 'error'
                          ? 'rgba(100,116,139,0.1)'
                          : 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(236,72,153,0.10))',
                        color: audioState === 'playing' ? '#ec4899'
                          : audioState === 'error' ? '#64748b' : '#fbbf24',
                        cursor: audioState === 'error' ? 'not-allowed' : 'pointer',
                        padding: 0, flexShrink: 0,
                      }}
                    >
                      <AudioIcon size={12} style={audioState === 'loading' ? { animation: 'spin 1s linear infinite' } : undefined} />
                    </button>
                  )}
                </div>
                {agentLoading && !hasResponse ? (
                  <LoadingDots />
                ) : (
                  <>
                    <div style={{
                      color: 'var(--color-text-primary, #cbd5e1)',
                      fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                    }}>
                      {typedText || (hasResponse ? '' : displayPlaceholder)}
                      {isTyping && typedSuggestion.length === 0 && <span className="fg-caret">▍</span>}
                    </div>
                    {(typedSuggestion || (!isTyping && agentSuggestion)) && (() => {
                      const suggestionText = typedSuggestion || agentSuggestion;
                      const isClickable = !!agentSuggestionTarget && !isTyping;
                      const Tag = isClickable ? 'button' : 'div';
                      return (
                        <Tag
                          {...(isClickable
                            ? { onClick: handleSuggestionClick, type: 'button' as const, 'aria-label': `Selecionar ${agentSuggestionTarget}` }
                            : {})}
                          style={{
                            marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6,
                            padding: '8px 12px', width: '100%',
                            textAlign: 'left', fontFamily: 'inherit',
                            background: 'rgba(34,211,238,0.08)',
                            border: '1px solid rgba(34,211,238,0.3)',
                            borderRadius: 8, fontSize: 12,
                            color: '#22d3ee',
                            cursor: isClickable ? 'pointer' : 'default',
                            transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
                          }}
                          onMouseEnter={isClickable ? (e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,238,0.18)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.6)';
                          }) : undefined}
                          onMouseLeave={isClickable ? (e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,238,0.08)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.3)';
                          }) : undefined}
                        >
                          <ArrowRight size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{suggestionText}{isTyping && typedSuggestion.length < agentSuggestion.length && <span className="fg-caret">▍</span>}</span>
                        </Tag>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Scroll hint — botao branco centralizado horizontalmente, proximo a borda inferior */}
            {showScrollHint && (
              <button
                onClick={scrollAgentToBottom}
                aria-label="Rolar para ver mais"
                title="Há mais conteúdo — clique para rolar"
                style={{
                  position: 'absolute', left: '50%', bottom: 8,
                  transform: 'translateX(-50%)',
                  width: 30, height: 30, borderRadius: '50%',
                  background: '#ffffff', color: '#0c1220',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.08)',
                  animation: 'fg-scroll-bob 1.4s ease-in-out infinite',
                  zIndex: 2,
                  padding: 0,
                }}
              >
                <ChevronDown size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fg-dot { 0%, 100% { opacity: 0.3 } 50% { opacity: 1 } }
        @keyframes fg-caret { 0%, 50% { opacity: 1 } 51%, 100% { opacity: 0 } }
        .fg-caret { display: inline-block; margin-left: 1px; color: #22d3ee;
          font-weight: 700; animation: fg-caret 0.9s steps(1) infinite; }
        @keyframes fg-scroll-bob {
          0%, 100% { transform: translateX(-50%) translateY(0); box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.08); }
          50%      { transform: translateX(-50%) translateY(4px); box-shadow: 0 3px 14px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.08); }
        }
      `}</style>
    </div>
  );
}

/* ── helpers ────────────────────────────────────────────────────── */

function btnStyle(bg: string, color: string) {
  return {
    background: bg, color, cursor: 'pointer',
    border: '1px solid var(--color-border-tertiary, rgba(100,116,139,0.3))',
    borderRadius: 'var(--border-radius-md, 6px)',
    padding: '5px 10px', fontSize: 12, fontFamily: 'inherit',
  } as const;
}

function SliderCtl({
  label, value, min, max, step, onChange, width,
}: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; width: number }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-secondary, #94a3b8)' }}>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width }} />
      <span style={{ minWidth: 36, textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: 'var(--color-text-primary, #e2e8f0)' }}>{value}</span>
    </label>
  );
}

function LegItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 18, height: 3, background: color, borderRadius: 2 }} />
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #94a3b8)' }}>{label}</span>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }} aria-label="carregando">
      {[0, 0.2, 0.4].map(d => (
        <span key={d} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--color-text-secondary, #94a3b8)',
          animation: `fg-dot 1s ease-in-out ${d}s infinite`,
        }} />
      ))}
    </div>
  );
}
