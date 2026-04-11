'use client';

import { useState, useRef, useCallback } from 'react';

const C = {
  bg: '#05070d', bg2: '#0c1220', text: '#eaf0f6', muted: '#94a3b8', dim: '#64748b',
  cyan: '#00d4ff', border: 'rgba(100,116,139,0.25)', mono: "'JetBrains Mono', monospace",
};

const TABLE_COLORS: Record<string, string> = {
  nrs: '#a855f7',
  nr_chunks: '#22d3ee',
  nr_raw_sources: '#22c55e',
  sectors: '#ef4444',
  nr_sector_relevance: '#fb923c',
  lessons: '#eab308',
  exercises: '#3b82f6',
  submissions: '#ec4899',
  llm_call_logs: '#64748b',
  user_events: '#8b5cf6',
};

interface TableNode {
  name: string;
  pk: string[];
  fks: { col: string; ref_table: string; ref_col: string }[];
  x: number;
  y: number;
}

const TABLES: TableNode[] = [
  { name: 'nrs', pk: ['id'], fks: [], x: 350, y: 20 },
  { name: 'nr_chunks', pk: ['id'], fks: [
    { col: 'nr_id', ref_table: 'nrs', ref_col: 'id' },
  ], x: 30, y: 170 },
  { name: 'nr_raw_sources', pk: ['id'], fks: [
    { col: 'nr_id', ref_table: 'nrs', ref_col: 'id' },
  ], x: 670, y: 170 },
  { name: 'sectors', pk: ['id'], fks: [], x: 670, y: 20 },
  { name: 'nr_sector_relevance', pk: ['id'], fks: [
    { col: 'nr_id', ref_table: 'nrs', ref_col: 'id' },
    { col: 'sector_id', ref_table: 'sectors', ref_col: 'id' },
  ], x: 500, y: 170 },
  { name: 'lessons', pk: ['id'], fks: [
    { col: 'nr_id', ref_table: 'nrs', ref_col: 'id' },
  ], x: 200, y: 320 },
  { name: 'exercises', pk: ['id'], fks: [
    { col: 'lesson_id', ref_table: 'lessons', ref_col: 'id' },
  ], x: 30, y: 470 },
  { name: 'submissions', pk: ['id'], fks: [
    { col: 'exercise_id', ref_table: 'exercises', ref_col: 'id' },
  ], x: 250, y: 470 },
  { name: 'llm_call_logs', pk: ['id'], fks: [], x: 500, y: 470 },
  { name: 'user_events', pk: ['id'], fks: [], x: 500, y: 320 },
];

const BOX_W = 200;

const btnStyle: React.CSSProperties = {
  background: 'none', border: `1px solid ${C.border}`, borderRadius: '0.25rem',
  color: C.muted, cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.625rem',
  fontFamily: "'Inter', sans-serif",
};

const STORAGE_KEY = 'eduven_er_diagram_positions';

function loadPositions(): Record<string, { x: number; y: number }> {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const allExist = TABLES.every(t => parsed[t.name]?.x !== undefined);
        if (allExist) return parsed;
      }
    } catch { /* ignore */ }
  }
  const p: Record<string, { x: number; y: number }> = {};
  TABLES.forEach(t => { p[t.name] = { x: t.x, y: t.y }; });
  return p;
}

export default function ERDiagram() {
  const [positions, setPositions] = useState(loadPositions);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = useCallback((name: string, e: React.MouseEvent) => {
    e.preventDefault();
    const pos = positions[name];
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setDragging(name);
  }, [positions]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPositions(prev => ({
      ...prev,
      [dragging]: {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      },
    }));
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setPositions(prev => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
        return prev;
      });
    }
    setDragging(null);
  }, [dragging]);

  const boxH = (t: TableNode) => 32 + (t.pk.length + t.fks.length) * 22 + 8;

  const getAnchor = (fromName: string, toName: string) => {
    const from = positions[fromName];
    const to = positions[toName];
    const fromT = TABLES.find(t => t.name === fromName)!;
    const fromH = boxH(fromT);

    const fcx = from.x + BOX_W / 2;
    const fcy = from.y + fromH / 2;
    const tcx = to.x + BOX_W / 2;
    const toT = TABLES.find(t => t.name === toName)!;
    const toH = boxH(toT);
    const tcy = to.y + toH / 2;

    if (fromName === toName) {
      return { fx: from.x + BOX_W, fy: from.y + 40, tx: from.x + BOX_W, ty: from.y + 60, self: true };
    }

    let fx: number, fy: number, tx: number, ty: number;
    const dx = tcx - fcx;
    const dy = tcy - fcy;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) { fx = from.x + BOX_W; tx = to.x; }
      else { fx = from.x; tx = to.x + BOX_W; }
      fy = fcy; ty = tcy;
    } else {
      if (dy > 0) { fy = from.y + fromH; ty = to.y; }
      else { fy = from.y; ty = to.y + toH; }
      fx = fcx; tx = tcx;
    }

    return { fx, fy, tx, ty, self: false };
  };

  const edges: Array<{ from: string; to: string; fkCol: string; pkCol: string }> = [];
  TABLES.forEach(t => {
    t.fks.forEach(fk => {
      edges.push({ from: t.name, to: fk.ref_table, fkCol: fk.col, pkCol: fk.ref_col });
    });
  });

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', position: 'relative', overflow: 'hidden', backgroundColor: C.bg }}>
      {/* Legend */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, padding: '0.5rem 0.75rem',
        backgroundColor: C.bg2, border: `1px solid ${C.border}`, borderRadius: '0.375rem',
        fontSize: '0.6875rem', color: C.dim, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>Arraste as tabelas para reorganizar</span>
        <button onClick={() => {
          const container = svgRef.current?.parentElement;
          if (!container) return;
          const cw = container.clientWidth - 40;
          const ch = container.clientHeight - 60;
          const cols = Math.ceil(Math.sqrt(TABLES.length));
          const rows = Math.ceil(TABLES.length / cols);
          const cellW = Math.floor(cw / cols);
          const cellH = Math.floor(ch / rows);
          const p: Record<string, { x: number; y: number }> = {};
          TABLES.forEach((t, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            p[t.name] = {
              x: 20 + col * cellW + (cellW - BOX_W) / 2,
              y: 40 + row * cellH + 10,
            };
          });
          setPositions(p);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
        }} style={btnStyle}>Encaixar tudo</button>
        <button onClick={() => {
          localStorage.removeItem(STORAGE_KEY);
          const p: Record<string, { x: number; y: number }> = {};
          TABLES.forEach(t => { p[t.name] = { x: t.x, y: t.y }; });
          setPositions(p);
        }} style={btnStyle}>Resetar</button>
      </div>

      <svg ref={svgRef} width="100%" height="100%"
        onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" fill={C.dim} />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const a = getAnchor(edge.from, edge.to);
          const color = TABLE_COLORS[edge.to] || C.dim;

          if (a.self) {
            return (
              <g key={i}>
                <path d={`M ${a.fx} ${a.fy} C ${a.fx + 60} ${a.fy - 30}, ${a.tx + 60} ${a.ty + 30}, ${a.tx} ${a.ty}`}
                  fill="none" stroke={C.dim} strokeWidth={1.5} strokeDasharray="4 2" markerEnd="url(#arrow)" />
                <text x={a.fx + 65} y={(a.fy + a.ty) / 2 + 4}
                  fill={C.muted} fontSize={10} fontFamily={C.mono} textAnchor="middle">
                  {edge.fkCol} &rarr; {edge.pkCol}(PK)
                </text>
              </g>
            );
          }

          const dx = a.tx - a.fx;
          const dy = a.ty - a.fy;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const flip = angle > 90 || angle < -90;
          const textAngle = flip ? angle + 180 : angle;

          const fkX = a.fx + dx * 0.35;
          const fkY = a.fy + dy * 0.35;
          const pkX = a.fx + dx * 0.65;
          const pkY = a.fy + dy * 0.65;

          return (
            <g key={i}>
              <line x1={a.fx} y1={a.fy} x2={a.tx} y2={a.ty}
                stroke={color} strokeWidth={1.5} strokeOpacity={0.5} markerEnd="url(#arrow)" />
              <g transform={`translate(${fkX},${fkY}) rotate(${textAngle})`}>
                <rect x={-2} y={-10} width={edge.fkCol.length * 6 + 4} height={13} rx={2}
                  fill={C.bg} fillOpacity={0.85} />
                <text x={0} y={0} fill={color} fontSize={10} fontFamily={C.mono} fontWeight={600}>
                  {edge.fkCol}
                </text>
              </g>
              <g transform={`translate(${pkX},${pkY}) rotate(${textAngle})`}>
                <rect x={-2} y={-10} width={(edge.pkCol.length + 4) * 6 + 4} height={13} rx={2}
                  fill={C.bg} fillOpacity={0.85} />
                <text x={0} y={0} fill={color} fontSize={10} fontFamily={C.mono} fontWeight={700}>
                  {edge.pkCol}(PK)
                </text>
              </g>
            </g>
          );
        })}

        {/* Table boxes */}
        {TABLES.map(t => {
          const pos = positions[t.name];
          const color = TABLE_COLORS[t.name] || C.cyan;
          const h = boxH(t);
          return (
            <g key={t.name} onMouseDown={e => handleMouseDown(t.name, e)}
              style={{ cursor: dragging === t.name ? 'grabbing' : 'grab' }}>
              <rect x={pos.x + 2} y={pos.y + 2} width={BOX_W} height={h} rx={8}
                fill="rgba(0,0,0,0.3)" />
              <rect x={pos.x} y={pos.y} width={BOX_W} height={h} rx={8}
                fill={C.bg2} stroke={color} strokeWidth={1.5} />
              <rect x={pos.x} y={pos.y} width={BOX_W} height={28} rx={8}
                fill={`${color}25`} />
              <rect x={pos.x} y={pos.y + 20} width={BOX_W} height={8}
                fill={`${color}25`} />
              <text x={pos.x + 10} y={pos.y + 18} fill={color} fontSize={11}
                fontFamily={C.mono} fontWeight={700}>
                {t.name}
              </text>
              {t.pk.map((col, ci) => (
                <g key={`pk-${ci}`}>
                  <text x={pos.x + 10} y={pos.y + 48 + ci * 22} fill="#eab308" fontSize={9}
                    fontFamily={C.mono} fontWeight={700}>
                    PK {col}
                  </text>
                  <text x={pos.x + BOX_W - 10} y={pos.y + 48 + ci * 22} fill={C.dim} fontSize={8}
                    fontFamily={C.mono} textAnchor="end">PK</text>
                </g>
              ))}
              {t.fks.map((fk, fi) => (
                <g key={`fk-${fi}`}>
                  <text x={pos.x + 10} y={pos.y + 48 + (t.pk.length + fi) * 22}
                    fill={TABLE_COLORS[fk.ref_table] || C.muted} fontSize={9} fontFamily={C.mono}>
                    FK {fk.col}
                  </text>
                  <text x={pos.x + BOX_W - 10} y={pos.y + 48 + (t.pk.length + fi) * 22}
                    fill={C.dim} fontSize={8} fontFamily={C.mono} textAnchor="end">
                    FK
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
