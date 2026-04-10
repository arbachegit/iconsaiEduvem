'use client'

/* ═══════════════════════════════════════════════════════════
   WorkerSVG — componente humano reutilizavel pros laboratorios.

   Props controlam:
   - Humor (mood 0..1): boca triste → sorriso, com transicao suave
   - Equipamentos: helmet, gloves, boots, harness, mask, goggles,
     earProtection, apron, welding
   - Riscos visuais: headImpact, handCuts, fallRisk, shock, chemical,
     breathing, noise, heatExposure, bodyImpact

   Cada prop e opcional. A figura eh ~300x360 viewBox.
   ═══════════════════════════════════════════════════════════ */

export interface WorkerRisks {
  headImpact?: boolean
  handCuts?: boolean
  fallRisk?: boolean
  shock?: boolean
  chemical?: boolean
  breathing?: boolean
  noise?: boolean
  heatExposure?: boolean
  bodyImpact?: boolean
}

export interface WorkerProps {
  mood: number                 // 0 (infeliz) a 1 (feliz) — interpola suavemente
  helmet?: boolean
  gloves?: boolean
  boots?: boolean
  harness?: boolean
  mask?: boolean               // mascara respiratoria
  goggles?: boolean            // oculos de protecao
  earProtection?: boolean
  apron?: boolean              // avental de couro (frigorifico, soldadura)
  risks?: WorkerRisks
  backgroundHint?: 'scaffold' | 'factory' | 'office' | 'outdoor' | 'none'
    | 'electrical' | 'fire' | 'confined' | 'maritime' | 'hospital' | 'noise'
}

export default function WorkerSVG({
  mood, helmet, gloves, boots, harness, mask, goggles, earProtection, apron,
  risks = {}, backgroundHint = 'scaffold',
}: WorkerProps) {
  return (
    <svg viewBox="0 0 300 360" width="100%" height="100%" style={{ maxHeight: 340 }}>
      <defs>
        <linearGradient id="danger-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* ═══ BACKGROUNDS — cenas DOMINANTES (60%+ do visual) ═══ */}

      {/* ANDAIME/CONSTRUCAO — estrutura metalica alta, plataformas, tela de protecao */}
      {backgroundHint === 'scaffold' && (
        <g>
          {/* Estrutura metalica */}
          <rect x="15" y="30" width="8" height="310" fill="#334155"/>
          <rect x="277" y="30" width="8" height="310" fill="#334155"/>
          <rect x="15" y="30" width="270" height="6" fill="#475569"/>
          <rect x="15" y="120" width="270" height="4" fill="#475569"/>
          <rect x="15" y="210" width="270" height="4" fill="#475569"/>
          {/* Diagonais de suporte */}
          <line x1="15" y1="30" x2="285" y2="120" stroke="#334155" strokeWidth="2"/>
          <line x1="285" y1="120" x2="15" y2="210" stroke="#334155" strokeWidth="2"/>
          {/* Plataformas com textura */}
          <rect x="23" y="120" width="254" height="8" fill="#1e293b" stroke="#475569" strokeWidth="1"/>
          <rect x="23" y="210" width="254" height="8" fill="#1e293b" stroke="#475569" strokeWidth="1"/>
          {/* Tela de protecao (rede) */}
          <g stroke="#22d3ee" strokeWidth="0.5" opacity="0.25">
            {[0,1,2,3,4,5,6,7,8].map(i => <line key={`v${i}`} x1={23+i*28} y1="30" x2={23+i*28} y2="120"/>)}
            {[0,1,2,3].map(i => <line key={`h${i}`} x1="23" y1={30+i*23} x2="277" y2={30+i*23}/>)}
          </g>
          {/* Bandeja salva-vidas */}
          <rect x="23" y="300" width="254" height="6" fill="#f97316" opacity="0.5"/>
          {/* Seta "AREA DE OBRA" */}
          <text x="150" y="25" fontSize="8" fill="#f97316" textAnchor="middle" fontWeight="700" fontFamily="monospace" opacity="0.7">⚠ ÁREA DE OBRA</text>
        </g>
      )}

      {/* FABRICA — maquina grande, engrenagem rotando, esteira, tubulacoes */}
      {backgroundHint === 'factory' && (
        <g>
          {/* Maquina grande a esquerda */}
          <rect x="5" y="80" width="80" height="200" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
          <rect x="12" y="90" width="66" height="40" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          {/* Engrenagem rotando */}
          <g className="nrA-gear" style={{ transformOrigin: '45px 200px' }}>
            <circle cx="45" cy="200" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2.5"/>
            <circle cx="45" cy="200" r="8" fill="#475569"/>
            <rect x="43" y="175" width="4" height="10" fill="#64748b"/>
            <rect x="43" y="215" width="4" height="10" fill="#64748b"/>
            <rect x="20" y="198" width="10" height="4" fill="#64748b"/>
            <rect x="60" y="198" width="10" height="4" fill="#64748b"/>
          </g>
          {/* Esteira transportadora embaixo */}
          <rect x="5" y="300" width="290" height="12" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
          <g stroke="#475569" strokeWidth="1">
            {[0,1,2,3,4,5,6,7,8,9].map(i => <line key={`e${i}`} x1={10+i*29} y1="300" x2={10+i*29} y2="312"/>)}
          </g>
          {/* Tubulacoes no teto */}
          <line x1="0" y1="40" x2="300" y2="40" stroke="#475569" strokeWidth="6"/>
          <line x1="0" y1="55" x2="300" y2="55" stroke="#334155" strokeWidth="4"/>
          <circle cx="80" cy="40" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <circle cx="220" cy="40" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          {/* Alerta no topo */}
          <text x="150" y="30" fontSize="7" fill="#fbbf24" textAnchor="middle" fontWeight="700" fontFamily="monospace" opacity="0.7">⚠ ZONA DE MÁQUINAS</text>
        </g>
      )}

      {/* ESCRITORIO — mesa, monitor, cadeira, relogio, planta */}
      {backgroundHint === 'office' && (
        <g>
          {/* Mesa grande */}
          <rect x="30" y="220" width="240" height="8" rx="1" fill="#334155"/>
          <rect x="50" y="228" width="8" height="100" fill="#1e293b"/>
          <rect x="242" y="228" width="8" height="100" fill="#1e293b"/>
          {/* Monitor */}
          <rect x="55" y="165" width="70" height="50" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <rect x="60" y="170" width="60" height="38" rx="1" fill="#1e293b"/>
          <rect x="82" y="215" width="6" height="5" fill="#475569"/>
          <rect x="72" y="218" width="26" height="3" fill="#475569"/>
          {/* Texto no monitor */}
          <line x1="65" y1="180" x2="108" y2="180" stroke="#22d3ee" strokeWidth="1" opacity="0.5"/>
          <line x1="65" y1="186" x2="100" y2="186" stroke="#22d3ee" strokeWidth="1" opacity="0.3"/>
          <line x1="65" y1="192" x2="112" y2="192" stroke="#22d3ee" strokeWidth="1" opacity="0.4"/>
          {/* Cadeira a direita */}
          <path d="M 210 240 Q 210 200 225 195 Q 240 200 240 240" fill="none" stroke="#475569" strokeWidth="2"/>
          <ellipse cx="225" cy="280" rx="20" ry="3" fill="#334155"/>
          <line x1="225" y1="245" x2="225" y2="275" stroke="#475569" strokeWidth="2"/>
          {/* Relogio na parede */}
          <circle cx="250" cy="80" r="18" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <line x1="250" y1="80" x2="250" y2="68" stroke="#e2e8f0" strokeWidth="1.5"/>
          <line x1="250" y1="80" x2="260" y2="85" stroke="#e2e8f0" strokeWidth="1"/>
          <circle cx="250" cy="80" r="2" fill="#e2e8f0"/>
          {/* Plantinha */}
          <rect x="15" y="190" width="16" height="20" fill="#78350f" rx="1"/>
          <circle cx="23" cy="185" r="10" fill="#16a34a" opacity="0.6"/>
          <circle cx="18" cy="180" r="7" fill="#22c55e" opacity="0.5"/>
        </g>
      )}

      {/* SOL/CAMPO — sol grande, colinas, vegetacao, ceu */}
      {backgroundHint === 'outdoor' && (
        <g>
          {/* Ceu gradiente */}
          <rect x="0" y="0" width="300" height="200" fill="#0c2d48" opacity="0.5"/>
          {/* Sol grande */}
          <circle cx="250" cy="60" r="35" fill="#fbbf24" opacity="0.6"/>
          <g stroke="#fbbf24" strokeWidth="2" opacity="0.4">
            <line x1="250" y1="15" x2="250" y2="5"/>
            <line x1="250" y1="105" x2="250" y2="115"/>
            <line x1="205" y1="60" x2="195" y2="60"/>
            <line x1="295" y1="60" x2="300" y2="60"/>
            <line x1="220" y1="30" x2="213" y2="23"/>
            <line x1="280" y1="90" x2="287" y2="97"/>
            <line x1="220" y1="90" x2="213" y2="97"/>
            <line x1="280" y1="30" x2="287" y2="23"/>
          </g>
          {/* Colinas */}
          <path d="M 0 280 Q 50 230 120 260 Q 180 240 220 270 Q 260 250 300 260 L 300 340 L 0 340 Z" fill="#1a3a2a" opacity="0.7"/>
          {/* Terreno */}
          <path d="M 0 300 Q 80 285 150 295 Q 220 280 300 300 L 300 340 L 0 340 Z" fill="#2d1b0e" opacity="0.5"/>
          {/* Arvores */}
          <g opacity="0.6">
            <rect x="30" y="240" width="4" height="30" fill="#78350f"/>
            <circle cx="32" cy="230" r="12" fill="#166534"/>
            <rect x="270" y="230" width="4" height="35" fill="#78350f"/>
            <circle cx="272" cy="220" r="14" fill="#166534"/>
          </g>
          {/* Nuvem */}
          <g opacity="0.3" fill="#94a3b8">
            <ellipse cx="80" cy="45" rx="25" ry="10"/>
            <ellipse cx="95" cy="40" rx="15" ry="8"/>
            <ellipse cx="70" cy="40" rx="12" ry="7"/>
          </g>
        </g>
      )}

      {/* PAINEL ELETRICO — quadro de disjuntores, fios, aviso de tensao */}
      {backgroundHint === 'electrical' && (
        <g>
          {/* Painel grande */}
          <rect x="5" y="50" width="100" height="220" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="2.5"/>
          <rect x="12" y="58" width="86" height="20" rx="1" fill="#0f172a"/>
          <text x="55" y="72" fontSize="7" fill="#ef4444" textAnchor="middle" fontWeight="700" fontFamily="monospace">⚡ 380V ⚡</text>
          {/* Disjuntores */}
          {[0,1,2,3,4,5].map(i => (
            <g key={`dj${i}`}>
              <rect x={18+i*13} y="90" width="10" height="20" rx="1" fill={i < 3 ? '#22c55e' : '#64748b'} stroke="#475569" strokeWidth="1"/>
              <rect x={20+i*13} y={i < 3 ? 90 : 100} width="6" height="4" fill="#0f172a"/>
            </g>
          ))}
          {/* Fios saindo do painel — coloridos */}
          <path d="M 105 80 Q 140 60 170 90 Q 200 120 150 140" stroke="#ef4444" strokeWidth="2.5" fill="none"/>
          <path d="M 105 110 Q 160 85 190 120 Q 210 150 160 155" stroke="#3b82f6" strokeWidth="2.5" fill="none"/>
          <path d="M 105 140 Q 150 125 175 160" stroke="#22c55e" strokeWidth="2.5" fill="none"/>
          {/* Triangulo de perigo GRANDE */}
          <polygon points="250,60 220,110 280,110" fill="none" stroke="#fbbf24" strokeWidth="3"/>
          <text x="250" y="100" fontSize="18" fill="#fbbf24" textAnchor="middle" fontWeight="900">⚡</text>
          <text x="250" y="125" fontSize="7" fill="#fbbf24" textAnchor="middle" fontWeight="700" fontFamily="monospace">RISCO DE CHOQUE</text>
          {/* Aterramento */}
          <g stroke="#22c55e" strokeWidth="2" opacity="0.6">
            <line x1="55" y1="270" x2="55" y2="310"/>
            <line x1="40" y1="310" x2="70" y2="310"/>
            <line x1="44" y1="316" x2="66" y2="316"/>
            <line x1="48" y1="322" x2="62" y2="322"/>
          </g>
        </g>
      )}

      {/* INCENDIO — chamas, fumaca, saida de emergencia, extintor */}
      {backgroundHint === 'fire' && (
        <g>
          {/* Chamas a direita */}
          <g opacity="0.7">
            <path d="M 230 340 Q 225 280 240 250 Q 250 220 240 200 Q 260 230 270 260 Q 280 290 275 340 Z" fill="#ef4444"/>
            <path d="M 245 340 Q 242 300 250 270 Q 258 300 255 340 Z" fill="#f97316"/>
            <path d="M 250 340 Q 248 310 252 290 Q 256 310 254 340 Z" fill="#fbbf24"/>
          </g>
          {/* Fumaca (nuvens cinza subindo) */}
          <g opacity="0.35" fill="#64748b">
            <ellipse cx="240" cy="170" rx="30" ry="15">
              <animate attributeName="cy" values="170;130;90;50" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0.25;0.1;0" dur="4s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="260" cy="140" rx="20" ry="10">
              <animate attributeName="cy" values="140;100;60;20" dur="3.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.35;0.2;0.08;0" dur="3.5s" repeatCount="indefinite"/>
            </ellipse>
          </g>
          {/* Extintor na parede */}
          <rect x="12" y="160" width="22" height="55" rx="4" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5"/>
          <rect x="18" y="150" width="10" height="12" rx="1" fill="#64748b"/>
          <path d="M 23 150 L 10 140" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
          {/* Placa SAIDA */}
          <rect x="10" y="40" width="60" height="25" rx="2" fill="#16a34a" stroke="#15803d" strokeWidth="1.5"/>
          <text x="40" y="57" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="700">SAÍDA →</text>
          {/* Detector de fumaca no teto */}
          <circle cx="150" cy="20" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="1.5"/>
          <circle cx="150" cy="20" r="3" fill="#ef4444">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}

      {/* ESPACO CONFINADO — paredes de tanque, escuridao, detector de gas */}
      {backgroundHint === 'confined' && (
        <g>
          {/* Paredes do tanque/silo */}
          <rect x="30" y="20" width="240" height="310" rx="8" fill="#0a0e17" stroke="#475569" strokeWidth="3"/>
          <rect x="40" y="30" width="220" height="290" rx="4" fill="#050810"/>
          {/* Abertura (boca do tanque) */}
          <ellipse cx="150" cy="30" rx="80" ry="12" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          {/* Escada de acesso */}
          <line x1="60" y1="42" x2="60" y2="300" stroke="#64748b" strokeWidth="2"/>
          <line x1="72" y1="42" x2="72" y2="300" stroke="#64748b" strokeWidth="2"/>
          {[0,1,2,3,4,5,6,7,8].map(i => <line key={`r${i}`} x1="60" y1={50+i*28} x2="72" y2={50+i*28} stroke="#64748b" strokeWidth="1.5"/>)}
          {/* Detector de gas */}
          <rect x="220" y="80" width="30" height="40" rx="3" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5"/>
          <text x="235" y="96" fontSize="6" fill="#22c55e" textAnchor="middle" fontFamily="monospace">O₂</text>
          <text x="235" y="108" fontSize="9" fill="#22c55e" textAnchor="middle" fontWeight="700" fontFamily="monospace">19.5%</text>
          {/* Alerta CONFINED */}
          <text x="150" y="16" fontSize="7" fill="#f97316" textAnchor="middle" fontWeight="700" fontFamily="monospace">⚠ ESPAÇO CONFINADO</text>
          {/* Escuridao gradient */}
          <rect x="40" y="200" width="220" height="120" fill="url(#confined-dark)" rx="4"/>
          <defs>
            <linearGradient id="confined-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#050810" stopOpacity="0"/>
              <stop offset="100%" stopColor="#050810" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
        </g>
      )}

      {/* MARITIMO — ondas, convés de navio, boia, cordas */}
      {backgroundHint === 'maritime' && (
        <g>
          {/* Convés do navio */}
          <rect x="0" y="260" width="300" height="80" fill="#334155" stroke="#475569" strokeWidth="2"/>
          <rect x="0" y="258" width="300" height="6" fill="#475569"/>
          {/* Guarda-corpo */}
          <line x1="0" y1="230" x2="300" y2="230" stroke="#64748b" strokeWidth="3"/>
          <line x1="20" y1="230" x2="20" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="80" y1="230" x2="80" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="220" y1="230" x2="220" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="280" y1="230" x2="280" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="0" y1="245" x2="300" y2="245" stroke="#64748b" strokeWidth="1.5"/>
          {/* Oceano com ondas */}
          <rect x="0" y="0" width="300" height="230" fill="#0c2d48" opacity="0.5"/>
          <path d="M 0 180 Q 40 165 80 180 T 160 180 T 240 180 T 320 180" stroke="#22d3ee" strokeWidth="2" fill="none" opacity="0.4">
            <animate attributeName="d" values="M 0 180 Q 40 165 80 180 T 160 180 T 240 180 T 320 180;M 0 185 Q 40 170 80 185 T 160 185 T 240 185 T 320 185;M 0 180 Q 40 165 80 180 T 160 180 T 240 180 T 320 180" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M 0 200 Q 50 185 100 200 T 200 200 T 300 200" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.3">
            <animate attributeName="d" values="M 0 200 Q 50 185 100 200 T 200 200 T 300 200;M 0 205 Q 50 190 100 205 T 200 205 T 300 205;M 0 200 Q 50 185 100 200 T 200 200 T 300 200" dur="3.5s" repeatCount="indefinite"/>
          </path>
          {/* Boia salva-vidas */}
          <circle cx="262" cy="270" r="14" fill="none" stroke="#ef4444" strokeWidth="4"/>
          <circle cx="262" cy="270" r="14" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 10"/>
          {/* Corda */}
          <path d="M 248 270 L 230 250 L 220 260" stroke="#d4a574" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
          {/* Bandeira */}
          <line x1="10" y1="100" x2="10" y2="230" stroke="#64748b" strokeWidth="2"/>
          <rect x="10" y="100" width="25" height="18" fill="#22d3ee"/>
        </g>
      )}

      {/* HOSPITAL — maca, cortina, monitor cardiaco, seringa */}
      {backgroundHint === 'hospital' && (
        <g>
          {/* Parede + faixa colorida */}
          <rect x="0" y="0" width="300" height="340" fill="#0c1320" opacity="0.4"/>
          <rect x="0" y="0" width="300" height="4" fill="#22d3ee"/>
          {/* Maca/leito */}
          <rect x="170" y="200" width="120" height="50" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
          <rect x="175" y="195" width="110" height="10" rx="1" fill="#334155"/>
          <line x1="180" y1="250" x2="180" y2="280" stroke="#64748b" strokeWidth="2"/>
          <line x1="280" y1="250" x2="280" y2="280" stroke="#64748b" strokeWidth="2"/>
          <circle cx="180" cy="282" r="5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          <circle cx="280" cy="282" r="5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          {/* Monitor cardiaco */}
          <rect x="220" y="100" width="60" height="50" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
          <path d="M 228 125 L 238 125 L 243 112 L 248 135 L 253 120 L 258 125 L 270 125" stroke="#22c55e" strokeWidth="2" fill="none">
            <animate attributeName="d" values="M 228 125 L 238 125 L 243 112 L 248 135 L 253 120 L 258 125 L 270 125;M 228 125 L 238 125 L 243 115 L 248 132 L 253 122 L 258 125 L 270 125;M 228 125 L 238 125 L 243 112 L 248 135 L 253 120 L 258 125 L 270 125" dur="1.2s" repeatCount="indefinite"/>
          </path>
          {/* Cruz vermelha */}
          <g opacity="0.6">
            <rect x="30" y="50" width="40" height="40" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2"/>
            <rect x="45" y="56" width="10" height="28" fill="#ef4444"/>
            <rect x="36" y="65" width="28" height="10" fill="#ef4444"/>
          </g>
          {/* Cortina */}
          <g stroke="#475569" strokeWidth="1" opacity="0.4">
            <line x1="165" y1="0" x2="165" y2="340"/>
            {[0,1,2,3,4,5].map(i => <path key={`c${i}`} d={`M 165 ${i*55} Q 155 ${i*55+20} 165 ${i*55+40}`}/>)}
          </g>
        </g>
      )}

      {/* RUIDO — caixas de som, ondas sonoras, medidor dB */}
      {backgroundHint === 'noise' && (
        <g>
          {/* Caixas de som industriais */}
          <rect x="5" y="100" width="50" height="80" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <circle cx="30" cy="125" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <circle cx="30" cy="125" r="5" fill="#334155"/>
          <circle cx="30" cy="160" r="8" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
          <rect x="245" y="100" width="50" height="80" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <circle cx="270" cy="125" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <circle cx="270" cy="125" r="5" fill="#334155"/>
          <circle cx="270" cy="160" r="8" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
          {/* Ondas sonoras emanando */}
          <g stroke="#f97316" strokeWidth="2" fill="none" opacity="0.5">
            <path d="M 55 130 Q 65 120 65 140">
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.8s" repeatCount="indefinite"/>
            </path>
            <path d="M 65 130 Q 80 110 80 150">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="0.8s" repeatCount="indefinite"/>
            </path>
            <path d="M 245 130 Q 235 120 235 140">
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.8s" repeatCount="indefinite"/>
            </path>
            <path d="M 235 130 Q 220 110 220 150">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="0.8s" repeatCount="indefinite"/>
            </path>
          </g>
          {/* Medidor de dB */}
          <rect x="120" y="30" width="60" height="35" rx="3" fill="#0f172a" stroke="#f97316" strokeWidth="2"/>
          <text x="150" y="48" fontSize="8" fill="#f97316" textAnchor="middle" fontFamily="monospace">NÍVEL</text>
          <text x="150" y="60" fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="900" fontFamily="monospace">92 dB</text>
          {/* Chao industrial */}
          <rect x="0" y="310" width="300" height="30" fill="#1e293b" opacity="0.5"/>
          <g stroke="#334155" strokeWidth="1" opacity="0.5">
            {[0,1,2,3,4,5,6,7,8,9].map(i => <line key={`f${i}`} x1={i*30} y1="310" x2={i*30+15} y2="340"/>)}
          </g>
        </g>
      )}

      {/* Ground line */}
      <line x1="20" y1="340" x2="280" y2="340" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4"/>

      {/* Danger glow quando em risco */}
      {(risks.headImpact || risks.shock || risks.chemical) && (
        <circle cx="150" cy="85" r="44" fill="url(#danger-glow)">
          <animate attributeName="opacity" values="0.25;0.7;0.25" dur="1.2s" repeatCount="indefinite"/>
        </circle>
      )}

      {/* Body — torso + braços + pernas */}
      <g stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1="150" y1="110" x2="150" y2="230"/>
        <line x1="150" y1="140" x2="115" y2="195"/>
        <line x1="150" y1="140" x2="185" y2="195"/>
        <line x1="150" y1="230" x2="125" y2="305"/>
        <line x1="150" y1="230" x2="175" y2="305"/>
      </g>

      {/* Apron (avental) — renderiza antes do body superior pra ficar por cima */}
      {apron && (
        <path
          d="M 130 130 L 170 130 L 178 220 L 122 220 Z"
          fill="#8b4513"
          stroke="#5c2f0a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}

      {/* Head */}
      <circle cx="150" cy="85" r="22" fill="#fde68a" stroke="#e2e8f0" strokeWidth="2.5"/>

      {/* Eyes — muda leve conforme humor */}
      <circle cx="144" cy="82" r="1.8" fill="#1e293b"/>
      <circle cx="156" cy="82" r="1.8" fill="#1e293b"/>

      {/* Eyebrows — bravos quando infeliz, relaxadas quando feliz */}
      <path
        d={mood < 0.5
          ? "M 138 76 L 148 78 M 162 78 L 152 76"   // franzidas (bravo)
          : "M 138 76 L 148 75 M 162 75 L 152 76"}  // relaxadas
        stroke="#1e293b"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'd 0.4s ease' }}
      />

      {/* MOUTH — transicao suave via cross-fade entre 2 paths */}
      {/* Triste (mood=0): ^ invertido   Feliz (mood=1): u */}
      <path
        d="M 143 94 Q 150 88 157 94"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity={1 - mood}
        style={{ transition: 'opacity 0.5s ease' }}
      />
      <path
        d="M 143 92 Q 150 100 157 92"
        stroke="#1e293b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity={mood}
        style={{ transition: 'opacity 0.5s ease' }}
      />

      {/* Mascara respiratoria */}
      {mask && (
        <g>
          <path
            d="M 130 88 Q 130 100 150 104 Q 170 100 170 88 L 170 85 Q 150 78 130 85 Z"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line x1="132" y1="88" x2="125" y2="85" stroke="#64748b" strokeWidth="1.5"/>
          <line x1="168" y1="88" x2="175" y2="85" stroke="#64748b" strokeWidth="1.5"/>
          <circle cx="140" cy="96" r="2" fill="#94a3b8"/>
          <circle cx="160" cy="96" r="2" fill="#94a3b8"/>
        </g>
      )}

      {/* Oculos de protecao */}
      {goggles && (
        <g fill="none" stroke="#22d3ee" strokeWidth="1.8">
          <ellipse cx="143" cy="82" rx="5.5" ry="4" fill="rgba(34,211,238,0.2)"/>
          <ellipse cx="157" cy="82" rx="5.5" ry="4" fill="rgba(34,211,238,0.2)"/>
          <line x1="148.5" y1="82" x2="151.5" y2="82"/>
          <line x1="137.5" y1="82" x2="131" y2="80"/>
          <line x1="162.5" y1="82" x2="169" y2="80"/>
        </g>
      )}

      {/* Protetor auricular (abafador) */}
      {earProtection && (
        <g>
          <ellipse cx="126" cy="85" rx="4" ry="6" fill="#f97316" stroke="#9a3412" strokeWidth="1.2"/>
          <ellipse cx="174" cy="85" rx="4" ry="6" fill="#f97316" stroke="#9a3412" strokeWidth="1.2"/>
          <path d="M 128 80 Q 150 68 172 80" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
      )}

      {/* CAPACETE */}
      {helmet && (
        <g>
          <path d="M 126 78 Q 126 54 150 54 Q 174 54 174 78 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" strokeLinejoin="round"/>
          <ellipse cx="150" cy="78" rx="28" ry="3.5" fill="#d97706"/>
          <line x1="132" y1="66" x2="168" y2="66" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.7"/>
        </g>
      )}

      {/* LUVAS — formato humano (mao completa com polegar) */}
      {gloves && (
        <g fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5">
          {/* Mao esquerda */}
          <path d="M 108 194 Q 102 194 100 200 L 100 212 Q 100 218 106 220 L 120 220 Q 126 220 126 214 L 126 200 Q 126 194 120 194 Z"/>
          <path d="M 105 196 L 100 200 L 98 204" strokeLinecap="round"/>
          {/* Mao direita */}
          <path d="M 192 194 Q 198 194 200 200 L 200 212 Q 200 218 194 220 L 180 220 Q 174 220 174 214 L 174 200 Q 174 194 180 194 Z"/>
          <path d="M 195 196 L 200 200 L 202 204" strokeLinecap="round"/>
        </g>
      )}

      {/* MAOS nuas quando sem luvas */}
      {!gloves && (
        <g fill="#fde68a" stroke="#d97706" strokeWidth="1.2">
          <circle cx="115" cy="200" r="5"/>
          <circle cx="185" cy="200" r="5"/>
        </g>
      )}

      {/* BOTAS — formato humano */}
      {boots && (
        <g fill="#78350f" stroke="#451a03" strokeWidth="1.5" strokeLinejoin="round">
          {/* Bota esquerda */}
          <path d="M 118 300 L 118 322 Q 118 330 110 330 L 100 330 Q 96 330 96 326 L 96 318 L 108 316 L 108 300 Z"/>
          <rect x="96" y="330" width="22" height="3" fill="#451a03"/>
          {/* Bota direita */}
          <path d="M 182 300 L 182 322 Q 182 330 190 330 L 200 330 Q 204 330 204 326 L 204 318 L 192 316 L 192 300 Z"/>
          <rect x="182" y="330" width="22" height="3" fill="#451a03"/>
        </g>
      )}

      {/* Pes nus quando sem botas */}
      {!boots && (
        <g stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round">
          <line x1="115" y1="310" x2="130" y2="310"/>
          <line x1="165" y1="310" x2="180" y2="310"/>
        </g>
      )}

      {/* CINTURAO PARAQUEDISTA */}
      {harness && (
        <g stroke="#22d3ee" strokeWidth="2.5" fill="none">
          <line x1="135" y1="155" x2="165" y2="155"/>
          <line x1="142" y1="120" x2="142" y2="185"/>
          <line x1="158" y1="120" x2="158" y2="185"/>
          <line x1="133" y1="185" x2="167" y2="185"/>
          <circle cx="150" cy="145" r="4" fill="#22d3ee"/>
          <path d="M 150 145 Q 190 60 250 45" strokeDasharray="2 2" opacity="0.8"/>
          <rect x="242" y="38" width="14" height="14" fill="#22d3ee" opacity="0.9"/>
        </g>
      )}

      {/* RISKS — indicadores visuais */}

      {/* Raios impacto na cabeca */}
      {risks.headImpact && (
        <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 108 35 L 118 50 L 112 55 L 125 70">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M 192 35 L 182 50 L 188 55 L 175 70">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* Cortes nas maos */}
      {risks.handCuts && (
        <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
          <line x1="110" y1="206" x2="120" y2="216"/>
          <line x1="120" y1="206" x2="110" y2="216"/>
          <line x1="180" y1="206" x2="190" y2="216"/>
          <line x1="190" y1="206" x2="180" y2="216"/>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite"/>
        </g>
      )}

      {/* Queda */}
      {risks.fallRisk && (
        <g>
          <path d="M 220 150 L 220 200 L 215 195 M 220 200 L 225 195" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.1s" repeatCount="indefinite"/>
          </path>
          <text x="222" y="140" fontSize="10" fill="#f97316" fontFamily="monospace" fontWeight="700">queda</text>
        </g>
      )}

      {/* Choque eletrico */}
      {risks.shock && (
        <g stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 150 50 L 145 65 L 152 65 L 148 80 L 155 78 L 150 95">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite"/>
          </path>
          <path d="M 100 150 L 115 155 M 200 150 L 185 155" strokeWidth="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.6s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* Exposicao quimica (gotas verdes) */}
      {risks.chemical && (
        <g fill="#84cc16">
          <circle cx="135" cy="95" r="2">
            <animate attributeName="cy" values="85;120;85" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="165" cy="95" r="2">
            <animate attributeName="cy" values="80;115;80" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}

      {/* Respiracao ruim (linhas vermelhas saindo do rosto) */}
      {risks.breathing && (
        <g stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          <path d="M 110 95 L 100 92">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1s" repeatCount="indefinite"/>
          </path>
          <path d="M 108 100 L 95 100">
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* Ruido (ondas no ouvido) */}
      {risks.noise && (
        <g stroke="#f97316" strokeWidth="2" fill="none">
          <path d="M 118 82 Q 110 82 108 85">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.7s" repeatCount="indefinite"/>
          </path>
          <path d="M 118 85 Q 106 85 102 90">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite"/>
          </path>
          <path d="M 182 82 Q 190 82 192 85">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.7s" repeatCount="indefinite"/>
          </path>
          <path d="M 182 85 Q 194 85 198 90">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* Calor (chamas subindo do chao) */}
      {risks.heatExposure && (
        <g fill="#ef4444" opacity="0.6">
          <path d="M 130 340 Q 130 320 135 315 Q 137 320 140 340 Z">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="0.6s" repeatCount="indefinite"/>
          </path>
          <path d="M 160 340 Q 160 320 165 315 Q 167 320 170 340 Z">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* Impacto no corpo (movimentação/queda objeto) */}
      {risks.bodyImpact && (
        <g>
          <path d="M 180 130 L 165 155 M 170 135 L 165 155 M 175 140 L 165 155" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* Indicador de seguranca quando tudo ok */}
      {mood > 0.7 && !Object.values(risks).some(Boolean) && (
        <g>
          <circle cx="250" cy="170" r="14" fill="#4ade8022" stroke="#4ade80" strokeWidth="2">
            <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
          </circle>
          <path d="M 243 170 l 5 5 l 10 -10" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      )}
    </svg>
  )
}
