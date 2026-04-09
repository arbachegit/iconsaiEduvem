'use client';

import { useEffect, useRef, useState } from 'react';
import { Atom } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   LabBanner — Banner do Laboratório.
   Portado 1:1 do iconsaiStats. EmbeddedSimulation placeholder
   (eduven ainda nao tem simulacoes registradas). Quando a
   primeira NR-6 EPI for criada, o `simulation` prop vira dado
   real e o EmbeddedSimulation vira um render inline.
   ═══════════════════════════════════════════════════════════ */

const LOADING_MESSAGES = [
  'Seu laboratório tá ficando pronto…',
  'Estamos quase lá, fique de olho…',
  'Carregando os sliders interativos…',
  'Calibrando o gráfico pra você mexer…',
  'Preparando o ambiente, segura aí…',
  'Mais um segundo e você manda nele…',
  'Quase pronto pra você quebrar tudo…',
];

// Shape usada pelo LabBanner. Componente vem do registro em lib/nr-simulations.ts.
export interface NRSimulationConfig {
  title: string;
  subtitle?: string;
  Component: React.ComponentType;
}

interface Props {
  laboratoryRef: React.RefObject<HTMLDivElement | null>;
  simulation: NRSimulationConfig | null;
  isLoading: boolean;
  elapsed: number;
  /** True quando esta NR NAO tem simulacao registrada em lib/nr-simulations.ts.
   *  Mostra mensagem honesta 'laboratorio em breve' em vez de loading forever. */
  simulationNotAvailable?: boolean;
}

export default function LabBanner({
  laboratoryRef, simulation, isLoading, elapsed, simulationNotAvailable = false,
}: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const justArrivedRef = useRef(false);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (!isLoading || simulation) return;
    const id = setInterval(() => setMsgIdx(i => i + 1), 1800);
    return () => clearInterval(id);
  }, [isLoading, simulation]);

  useEffect(() => {
    if (simulation && !justArrivedRef.current) {
      justArrivedRef.current = true;
      setGlow(true);
      const t = setTimeout(() => setGlow(false), 4000);
      return () => clearTimeout(t);
    }
  }, [simulation]);

  const ready = !!simulation;
  const currentMsg = LOADING_MESSAGES[msgIdx % LOADING_MESSAGES.length];

  return (
    <div ref={laboratoryRef} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 24px' }}>
      <div style={{
        background: '#0c1320',
        border: `1px solid ${ready ? 'rgba(34,211,238,0.6)' : 'rgba(34,211,238,0.3)'}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: glow
          ? '0 0 48px rgba(34,211,238,0.5), inset 0 0 32px rgba(34,211,238,0.08)'
          : ready
          ? '0 0 32px rgba(34,211,238,0.15), inset 0 0 24px rgba(34,211,238,0.04)'
          : '0 0 16px rgba(34,211,238,0.08)',
        position: 'relative',
        transition: 'box-shadow 0.5s, border-color 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: ready ? 16 : 0, flexWrap: 'wrap' }}>
          <Atom size={28} style={{
            color: '#22d3ee',
            animation: ready
              ? 'atomSpin 4s linear infinite, labPulse 2s ease-in-out infinite'
              : 'atomSpin 4s linear infinite',
            transformOrigin: 'center', transformBox: 'fill-box',
            filter: ready
              ? 'drop-shadow(0 0 8px rgba(34,211,238,0.8))'
              : 'drop-shadow(0 0 4px rgba(34,211,238,0.4))',
            flexShrink: 0, marginTop: 2,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              background: 'linear-gradient(90deg, #22d3ee, #a855f7, #ec4899, #22d3ee)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 3s linear infinite',
            }}>
              Laboratório interativo
            </div>
            {ready && simulation ? (
              <>
                <div style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                  {simulation.title}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  {simulation.subtitle || 'Mexa nos parâmetros. Toda mexida ensina algo.'}
                </div>
              </>
            ) : simulationNotAvailable ? (
              <>
                <div style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                  Laboratório desta NR está em desenvolvimento.
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  A primeira simulação pronta é a da <strong style={{ color: '#22d3ee' }}>NR-06 EPI</strong>. Abra-a pra ver o trabalhador ganhando proteção em tempo real, com ai.tutor explicando cada passo. Mais simulações vêm em breve.
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, marginTop: 2, minHeight: 24 }}>
                  {currentMsg}
                </div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                  {isLoading ? `pensando há ${elapsed}s` : 'aguardando…'}
                </div>
              </>
            )}
          </div>
        </div>
        {ready && simulation && (
          <div style={{ marginTop: 6 }}>
            <simulation.Component />
          </div>
        )}
      </div>
    </div>
  );
}
