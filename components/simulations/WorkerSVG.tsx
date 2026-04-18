'use client'

/* ═══════════════════════════════════════════════════════════
   WorkerSVG — figura humana profissional para os laboratórios.

   Design DNA:
   - Anatomia proporcional, silhueta com massa corporal (não stick figure).
   - Expressões faciais por cross-fade de OPACITY (sobrancelhas + boca),
     transição 0.6s. Zero salto em mood < 0.5 vs mood > 0.5.
   - Cada EPI renderizado no corpo replica FIELMENTE o ícone do botão:
     mesma paleta, mesmos detalhes (tarjas reflexivas, fivelas, biqueira
     de aço, filtros laterais, crista do capacete).

   viewBox: 300x360 (mantém compat com callers existentes).
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
  mood: number
  helmet?: boolean
  gloves?: boolean
  boots?: boolean
  harness?: boolean
  mask?: boolean
  goggles?: boolean
  earProtection?: boolean
  apron?: boolean
  risks?: WorkerRisks
  backgroundHint?: 'scaffold' | 'factory' | 'office' | 'outdoor' | 'none'
    | 'electrical' | 'fire' | 'confined' | 'maritime' | 'hospital' | 'noise'
}

/* ───── paleta espelhando EpiIcons (botões) ───── */
const P = {
  skin: '#fde68a', skinShadow: '#d97706',
  shirt: '#475569', shirtDark: '#334155', shirtShadow: '#1e293b',
  pants: '#1e293b', pantsDark: '#0f172a',
  // helmet
  helmetYellow: '#fbbf24', helmetDark: '#b45309', helmetStrap: '#1f2937',
  // gloves
  gloveOrange: '#ea580c', gloveCuff: '#431407', gloveStitch: '#fde68a',
  // boots
  bootBlack: '#111827', bootSteel: '#cbd5e1', bootStitch: '#fbbf24',
  // harness
  harnessOrange: '#f97316', harnessBuckle: '#0f172a', harnessDring: '#94a3b8',
  // mask
  maskWhite: '#f3f4f6', maskShadow: '#cbd5e1', maskStrap: '#64748b', maskValve: '#475569',
  // goggles
  gogglesFrame: '#1f2937', gogglesLens: '#67e8f9', gogglesLensShade: '#0891b2',
  // earmuff
  muffRed: '#dc2626', muffShade: '#7f1d1d', muffBand: '#1f2937', muffFoam: '#fbbf24',
  // apron
  apronLeather: '#78350f', apronLeatherDark: '#431407', apronStrap: '#d97706', apronStitch: '#fbbf24',
}

export default function WorkerSVG({
  mood, helmet, gloves, boots, harness, mask, goggles, earProtection, apron,
  risks = {}, backgroundHint = 'scaffold',
}: WorkerProps) {
  // Clamp mood
  const m = Math.max(0, Math.min(1, mood))
  const sadOp = 1 - m
  const happyOp = m
  const faceTransition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)'

  return (
    <svg viewBox="0 0 300 360" width="100%" height="100%" style={{ maxHeight: 340 }}>
      <defs>
        <linearGradient id="danger-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="skin-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="100%" stopColor={P.skin}/>
        </linearGradient>
        <linearGradient id="shirt-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={P.shirt}/>
          <stop offset="100%" stopColor={P.shirtDark}/>
        </linearGradient>
        <linearGradient id="helmet-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="45%" stopColor={P.helmetYellow}/>
          <stop offset="100%" stopColor={P.helmetDark}/>
        </linearGradient>
        <linearGradient id="vest-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor={P.harnessOrange}/>
        </linearGradient>
      </defs>

      {/* ═══ BACKGROUNDS (preservados) ═══ */}
      {backgroundHint === 'scaffold' && (
        <g>
          <rect x="15" y="30" width="8" height="310" fill="#334155"/>
          <rect x="277" y="30" width="8" height="310" fill="#334155"/>
          <rect x="15" y="30" width="270" height="6" fill="#475569"/>
          <rect x="15" y="120" width="270" height="4" fill="#475569"/>
          <rect x="15" y="210" width="270" height="4" fill="#475569"/>
          <line x1="15" y1="30" x2="285" y2="120" stroke="#334155" strokeWidth="2"/>
          <line x1="285" y1="120" x2="15" y2="210" stroke="#334155" strokeWidth="2"/>
          <rect x="23" y="120" width="254" height="8" fill="#1e293b" stroke="#475569" strokeWidth="1"/>
          <rect x="23" y="210" width="254" height="8" fill="#1e293b" stroke="#475569" strokeWidth="1"/>
          <g stroke="#22d3ee" strokeWidth="0.5" opacity="0.22">
            {[0,1,2,3,4,5,6,7,8].map(i => <line key={`v${i}`} x1={23+i*28} y1="30" x2={23+i*28} y2="120"/>)}
            {[0,1,2,3].map(i => <line key={`h${i}`} x1="23" y1={30+i*23} x2="277" y2={30+i*23}/>)}
          </g>
          <rect x="23" y="300" width="254" height="6" fill="#f97316" opacity="0.45"/>
          <text x="150" y="25" fontSize="8" fill="#f97316" textAnchor="middle" fontWeight="700" fontFamily="'JetBrains Mono', monospace" opacity="0.7">⚠ ÁREA DE OBRA</text>
        </g>
      )}

      {backgroundHint === 'factory' && (
        <g>
          <rect x="5" y="80" width="80" height="200" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
          <rect x="12" y="90" width="66" height="40" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <g className="nrA-gear" style={{ transformOrigin: '45px 200px' }}>
            <circle cx="45" cy="200" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="2.5"/>
            <circle cx="45" cy="200" r="8" fill="#475569"/>
            <rect x="43" y="175" width="4" height="10" fill="#64748b"/>
            <rect x="43" y="215" width="4" height="10" fill="#64748b"/>
            <rect x="20" y="198" width="10" height="4" fill="#64748b"/>
            <rect x="60" y="198" width="10" height="4" fill="#64748b"/>
          </g>
          <rect x="5" y="300" width="290" height="12" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
          <g stroke="#475569" strokeWidth="1">
            {[0,1,2,3,4,5,6,7,8,9].map(i => <line key={`e${i}`} x1={10+i*29} y1="300" x2={10+i*29} y2="312"/>)}
          </g>
          <line x1="0" y1="40" x2="300" y2="40" stroke="#475569" strokeWidth="6"/>
          <line x1="0" y1="55" x2="300" y2="55" stroke="#334155" strokeWidth="4"/>
          <circle cx="80" cy="40" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <circle cx="220" cy="40" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <text x="150" y="30" fontSize="7" fill="#fbbf24" textAnchor="middle" fontWeight="700" fontFamily="'JetBrains Mono', monospace" opacity="0.7">⚠ ZONA DE MÁQUINAS</text>
        </g>
      )}

      {backgroundHint === 'office' && (
        <g>
          <rect x="30" y="220" width="240" height="8" rx="1" fill="#334155"/>
          <rect x="50" y="228" width="8" height="100" fill="#1e293b"/>
          <rect x="242" y="228" width="8" height="100" fill="#1e293b"/>
          <rect x="55" y="165" width="70" height="50" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <rect x="60" y="170" width="60" height="38" rx="1" fill="#1e293b"/>
          <rect x="82" y="215" width="6" height="5" fill="#475569"/>
          <rect x="72" y="218" width="26" height="3" fill="#475569"/>
          <line x1="65" y1="180" x2="108" y2="180" stroke="#22d3ee" strokeWidth="1" opacity="0.5"/>
          <line x1="65" y1="186" x2="100" y2="186" stroke="#22d3ee" strokeWidth="1" opacity="0.3"/>
          <line x1="65" y1="192" x2="112" y2="192" stroke="#22d3ee" strokeWidth="1" opacity="0.4"/>
          <path d="M 210 240 Q 210 200 225 195 Q 240 200 240 240" fill="none" stroke="#475569" strokeWidth="2"/>
          <ellipse cx="225" cy="280" rx="20" ry="3" fill="#334155"/>
          <line x1="225" y1="245" x2="225" y2="275" stroke="#475569" strokeWidth="2"/>
          <circle cx="250" cy="80" r="18" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <line x1="250" y1="80" x2="250" y2="68" stroke="#e2e8f0" strokeWidth="1.5"/>
          <line x1="250" y1="80" x2="260" y2="85" stroke="#e2e8f0" strokeWidth="1"/>
          <circle cx="250" cy="80" r="2" fill="#e2e8f0"/>
          <rect x="15" y="190" width="16" height="20" fill="#78350f" rx="1"/>
          <circle cx="23" cy="185" r="10" fill="#16a34a" opacity="0.6"/>
          <circle cx="18" cy="180" r="7" fill="#22c55e" opacity="0.5"/>
        </g>
      )}

      {backgroundHint === 'outdoor' && (
        <g>
          <rect x="0" y="0" width="300" height="200" fill="#0c2d48" opacity="0.5"/>
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
          <path d="M 0 280 Q 50 230 120 260 Q 180 240 220 270 Q 260 250 300 260 L 300 340 L 0 340 Z" fill="#1a3a2a" opacity="0.7"/>
          <path d="M 0 300 Q 80 285 150 295 Q 220 280 300 300 L 300 340 L 0 340 Z" fill="#2d1b0e" opacity="0.5"/>
          <g opacity="0.6">
            <rect x="30" y="240" width="4" height="30" fill="#78350f"/>
            <circle cx="32" cy="230" r="12" fill="#166534"/>
            <rect x="270" y="230" width="4" height="35" fill="#78350f"/>
            <circle cx="272" cy="220" r="14" fill="#166534"/>
          </g>
          <g opacity="0.3" fill="#94a3b8">
            <ellipse cx="80" cy="45" rx="25" ry="10"/>
            <ellipse cx="95" cy="40" rx="15" ry="8"/>
            <ellipse cx="70" cy="40" rx="12" ry="7"/>
          </g>
        </g>
      )}

      {backgroundHint === 'electrical' && (
        <g>
          <rect x="5" y="50" width="100" height="220" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="2.5"/>
          <rect x="12" y="58" width="86" height="20" rx="1" fill="#0f172a"/>
          <text x="55" y="72" fontSize="7" fill="#ef4444" textAnchor="middle" fontWeight="700" fontFamily="'JetBrains Mono', monospace">⚡ 380V ⚡</text>
          {[0,1,2,3,4,5].map(i => (
            <g key={`dj${i}`}>
              <rect x={18+i*13} y="90" width="10" height="20" rx="1" fill={i < 3 ? '#22c55e' : '#64748b'} stroke="#475569" strokeWidth="1"/>
              <rect x={20+i*13} y={i < 3 ? 90 : 100} width="6" height="4" fill="#0f172a"/>
            </g>
          ))}
          <path d="M 105 80 Q 140 60 170 90 Q 200 120 150 140" stroke="#ef4444" strokeWidth="2.5" fill="none"/>
          <path d="M 105 110 Q 160 85 190 120 Q 210 150 160 155" stroke="#3b82f6" strokeWidth="2.5" fill="none"/>
          <path d="M 105 140 Q 150 125 175 160" stroke="#22c55e" strokeWidth="2.5" fill="none"/>
          <polygon points="250,60 220,110 280,110" fill="none" stroke="#fbbf24" strokeWidth="3"/>
          <text x="250" y="100" fontSize="18" fill="#fbbf24" textAnchor="middle" fontWeight="900">⚡</text>
          <text x="250" y="125" fontSize="7" fill="#fbbf24" textAnchor="middle" fontWeight="700" fontFamily="'JetBrains Mono', monospace">RISCO DE CHOQUE</text>
          <g stroke="#22c55e" strokeWidth="2" opacity="0.6">
            <line x1="55" y1="270" x2="55" y2="310"/>
            <line x1="40" y1="310" x2="70" y2="310"/>
            <line x1="44" y1="316" x2="66" y2="316"/>
            <line x1="48" y1="322" x2="62" y2="322"/>
          </g>
        </g>
      )}

      {backgroundHint === 'fire' && (
        <g>
          <g opacity="0.7">
            <path d="M 230 340 Q 225 280 240 250 Q 250 220 240 200 Q 260 230 270 260 Q 280 290 275 340 Z" fill="#ef4444"/>
            <path d="M 245 340 Q 242 300 250 270 Q 258 300 255 340 Z" fill="#f97316"/>
            <path d="M 250 340 Q 248 310 252 290 Q 256 310 254 340 Z" fill="#fbbf24"/>
          </g>
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
          <rect x="12" y="160" width="22" height="55" rx="4" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5"/>
          <rect x="18" y="150" width="10" height="12" rx="1" fill="#64748b"/>
          <path d="M 23 150 L 10 140" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
          <rect x="10" y="40" width="60" height="25" rx="2" fill="#16a34a" stroke="#15803d" strokeWidth="1.5"/>
          <text x="40" y="57" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="700">SAÍDA →</text>
          <circle cx="150" cy="20" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="1.5"/>
          <circle cx="150" cy="20" r="3" fill="#ef4444">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}

      {backgroundHint === 'confined' && (
        <g>
          <rect x="30" y="20" width="240" height="310" rx="8" fill="#0a0e17" stroke="#475569" strokeWidth="3"/>
          <rect x="40" y="30" width="220" height="290" rx="4" fill="#050810"/>
          <ellipse cx="150" cy="30" rx="80" ry="12" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <line x1="60" y1="42" x2="60" y2="300" stroke="#64748b" strokeWidth="2"/>
          <line x1="72" y1="42" x2="72" y2="300" stroke="#64748b" strokeWidth="2"/>
          {[0,1,2,3,4,5,6,7,8].map(i => <line key={`r${i}`} x1="60" y1={50+i*28} x2="72" y2={50+i*28} stroke="#64748b" strokeWidth="1.5"/>)}
          <rect x="220" y="80" width="30" height="40" rx="3" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5"/>
          <text x="235" y="96" fontSize="6" fill="#22c55e" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">O₂</text>
          <text x="235" y="108" fontSize="9" fill="#22c55e" textAnchor="middle" fontWeight="700" fontFamily="'JetBrains Mono', monospace">19.5%</text>
          <text x="150" y="16" fontSize="7" fill="#f97316" textAnchor="middle" fontWeight="700" fontFamily="'JetBrains Mono', monospace">⚠ ESPAÇO CONFINADO</text>
        </g>
      )}

      {backgroundHint === 'maritime' && (
        <g>
          <rect x="0" y="260" width="300" height="80" fill="#334155" stroke="#475569" strokeWidth="2"/>
          <rect x="0" y="258" width="300" height="6" fill="#475569"/>
          <line x1="0" y1="230" x2="300" y2="230" stroke="#64748b" strokeWidth="3"/>
          <line x1="20" y1="230" x2="20" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="80" y1="230" x2="80" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="220" y1="230" x2="220" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="280" y1="230" x2="280" y2="260" stroke="#64748b" strokeWidth="2"/>
          <line x1="0" y1="245" x2="300" y2="245" stroke="#64748b" strokeWidth="1.5"/>
          <rect x="0" y="0" width="300" height="230" fill="#0c2d48" opacity="0.5"/>
          <path d="M 0 180 Q 40 165 80 180 T 160 180 T 240 180 T 320 180" stroke="#22d3ee" strokeWidth="2" fill="none" opacity="0.4">
            <animate attributeName="d" values="M 0 180 Q 40 165 80 180 T 160 180 T 240 180 T 320 180;M 0 185 Q 40 170 80 185 T 160 185 T 240 185 T 320 185;M 0 180 Q 40 165 80 180 T 160 180 T 240 180 T 320 180" dur="3s" repeatCount="indefinite"/>
          </path>
          <path d="M 0 200 Q 50 185 100 200 T 200 200 T 300 200" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.3">
            <animate attributeName="d" values="M 0 200 Q 50 185 100 200 T 200 200 T 300 200;M 0 205 Q 50 190 100 205 T 200 205 T 300 205;M 0 200 Q 50 185 100 200 T 200 200 T 300 200" dur="3.5s" repeatCount="indefinite"/>
          </path>
          <circle cx="262" cy="270" r="14" fill="none" stroke="#ef4444" strokeWidth="4"/>
          <circle cx="262" cy="270" r="14" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 10"/>
          <path d="M 248 270 L 230 250 L 220 260" stroke="#d4a574" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
          <line x1="10" y1="100" x2="10" y2="230" stroke="#64748b" strokeWidth="2"/>
          <rect x="10" y="100" width="25" height="18" fill="#22d3ee"/>
        </g>
      )}

      {backgroundHint === 'hospital' && (
        <g>
          <rect x="0" y="0" width="300" height="340" fill="#0c1320" opacity="0.4"/>
          <rect x="0" y="0" width="300" height="4" fill="#22d3ee"/>
          <rect x="170" y="200" width="120" height="50" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>
          <rect x="175" y="195" width="110" height="10" rx="1" fill="#334155"/>
          <line x1="180" y1="250" x2="180" y2="280" stroke="#64748b" strokeWidth="2"/>
          <line x1="280" y1="250" x2="280" y2="280" stroke="#64748b" strokeWidth="2"/>
          <circle cx="180" cy="282" r="5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          <circle cx="280" cy="282" r="5" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          <rect x="220" y="100" width="60" height="50" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
          <path d="M 228 125 L 238 125 L 243 112 L 248 135 L 253 120 L 258 125 L 270 125" stroke="#22c55e" strokeWidth="2" fill="none">
            <animate attributeName="d" values="M 228 125 L 238 125 L 243 112 L 248 135 L 253 120 L 258 125 L 270 125;M 228 125 L 238 125 L 243 115 L 248 132 L 253 122 L 258 125 L 270 125;M 228 125 L 238 125 L 243 112 L 248 135 L 253 120 L 258 125 L 270 125" dur="1.2s" repeatCount="indefinite"/>
          </path>
          <g opacity="0.6">
            <rect x="30" y="50" width="40" height="40" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2"/>
            <rect x="45" y="56" width="10" height="28" fill="#ef4444"/>
            <rect x="36" y="65" width="28" height="10" fill="#ef4444"/>
          </g>
        </g>
      )}

      {backgroundHint === 'noise' && (
        <g>
          <rect x="5" y="100" width="50" height="80" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <circle cx="30" cy="125" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <circle cx="30" cy="125" r="5" fill="#334155"/>
          <circle cx="30" cy="160" r="8" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
          <rect x="245" y="100" width="50" height="80" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="2"/>
          <circle cx="270" cy="125" r="12" fill="#0f172a" stroke="#475569" strokeWidth="2"/>
          <circle cx="270" cy="125" r="5" fill="#334155"/>
          <circle cx="270" cy="160" r="8" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
          <g stroke="#f97316" strokeWidth="2" fill="none" opacity="0.5">
            <path d="M 55 130 Q 65 120 65 140"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.8s" repeatCount="indefinite"/></path>
            <path d="M 65 130 Q 80 110 80 150"><animate attributeName="opacity" values="0.1;0.5;0.1" dur="0.8s" repeatCount="indefinite"/></path>
            <path d="M 245 130 Q 235 120 235 140"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.8s" repeatCount="indefinite"/></path>
            <path d="M 235 130 Q 220 110 220 150"><animate attributeName="opacity" values="0.1;0.5;0.1" dur="0.8s" repeatCount="indefinite"/></path>
          </g>
          <rect x="120" y="30" width="60" height="35" rx="3" fill="#0f172a" stroke="#f97316" strokeWidth="2"/>
          <text x="150" y="48" fontSize="8" fill="#f97316" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">NÍVEL</text>
          <text x="150" y="60" fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="900" fontFamily="'JetBrains Mono', monospace">92 dB</text>
          <rect x="0" y="310" width="300" height="30" fill="#1e293b" opacity="0.5"/>
        </g>
      )}

      {/* ground line */}
      <line x1="20" y1="340" x2="280" y2="340" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4"/>

      {/* ═══ DANGER GLOW ═══ */}
      {(risks.headImpact || risks.shock || risks.chemical) && (
        <circle cx="150" cy="85" r="48" fill="url(#danger-glow)">
          <animate attributeName="opacity" values="0.25;0.7;0.25" dur="1.2s" repeatCount="indefinite"/>
        </circle>
      )}

      {/* ═══ SHADOW embaixo do trabalhador ═══ */}
      <ellipse cx="150" cy="338" rx="40" ry="3.5" fill="#000" opacity="0.35"/>

      {/* ═══════════════════════════════════════════════════════════
         ANATOMIA
         Ordem: pernas → torso → braços → mãos → pés → pescoço → cabeça
         Depois EPIs por cima (apron→harness→gloves→boots→muff→mask→goggles→helmet)
         ═══════════════════════════════════════════════════════════ */}

      {/* ─── PERNAS (calça industrial) ─── */}
      <path d="M 135 228 L 130 325 Q 130 332 136 332 L 148 332 Q 152 332 152 327 L 152 232 Z"
        fill={P.pants} stroke={P.pantsDark} strokeWidth="1"/>
      <path d="M 165 228 L 170 325 Q 170 332 164 332 L 152 332 Q 148 332 148 327 L 148 232 Z"
        fill={P.pants} stroke={P.pantsDark} strokeWidth="1"/>
      {/* vinco central */}
      <line x1="141" y1="240" x2="135" y2="320" stroke={P.pantsDark} strokeWidth="0.5" opacity="0.7"/>
      <line x1="159" y1="240" x2="165" y2="320" stroke={P.pantsDark} strokeWidth="0.5" opacity="0.7"/>

      {/* ─── PÉS (pele quando sem botas) ─── */}
      {!boots && (
        <g>
          <ellipse cx="135" cy="334" rx="10" ry="4" fill={P.skin} stroke={P.skinShadow} strokeWidth="0.8"/>
          <ellipse cx="165" cy="334" rx="10" ry="4" fill={P.skin} stroke={P.skinShadow} strokeWidth="0.8"/>
        </g>
      )}

      {/* ─── TORSO (camisa/uniforme) ─── */}
      <path d="M 118 125 L 182 125 L 178 228 L 122 228 Z"
        fill="url(#shirt-shade)" stroke={P.shirtShadow} strokeWidth="1"/>
      {/* cinto/waist */}
      <rect x="122" y="222" width="56" height="6" fill={P.shirtShadow}/>
      <rect x="146" y="222" width="8" height="6" fill="#1f2937" stroke="#94a3b8" strokeWidth="0.4"/>
      {/* fila de botões */}
      <line x1="150" y1="130" x2="150" y2="220" stroke={P.shirtShadow} strokeWidth="0.6" opacity="0.7"/>
      <circle cx="150" cy="142" r="1.1" fill={P.shirtShadow}/>
      <circle cx="150" cy="162" r="1.1" fill={P.shirtShadow}/>
      <circle cx="150" cy="182" r="1.1" fill={P.shirtShadow}/>
      <circle cx="150" cy="202" r="1.1" fill={P.shirtShadow}/>
      {/* bolso peitoral */}
      <rect x="127" y="145" width="16" height="18" fill="none" stroke={P.shirtShadow} strokeWidth="0.6" opacity="0.8"/>

      {/* ─── BRAÇOS ─── */}
      <path d="M 118 128 L 104 210 Q 103 218 110 220 L 118 220 L 122 136 Z"
        fill="url(#shirt-shade)" stroke={P.shirtShadow} strokeWidth="1"/>
      <path d="M 182 128 L 196 210 Q 197 218 190 220 L 182 220 L 178 136 Z"
        fill="url(#shirt-shade)" stroke={P.shirtShadow} strokeWidth="1"/>

      {/* ─── MÃOS nuas ─── */}
      {!gloves && (
        <g>
          <circle cx="108" cy="220" r="6" fill={P.skin} stroke={P.skinShadow} strokeWidth="0.8"/>
          <circle cx="192" cy="220" r="6" fill={P.skin} stroke={P.skinShadow} strokeWidth="0.8"/>
        </g>
      )}

      {/* ─── APRON (avental de couro — espelha ApronIcon) ─── */}
      {apron && (
        <g>
          {/* alça pescoço */}
          <path d="M 140 110 Q 150 105 160 110" fill="none" stroke={P.apronStrap} strokeWidth="2.2"/>
          {/* peito do avental */}
          <path d="M 130 115 L 170 115 L 170 140 L 130 140 Z" fill={P.apronLeatherDark}/>
          {/* corpo principal */}
          <path d="M 125 140 L 175 140 L 182 230 L 118 230 Z"
            fill={P.apronLeather} stroke={P.apronLeatherDark} strokeWidth="1.2"/>
          {/* laço cintura */}
          <path d="M 115 180 L 185 180" stroke={P.apronStrap} strokeWidth="2"/>
          <path d="M 112 182 Q 110 180 108 180 M 188 182 Q 190 180 192 180" stroke={P.apronStrap} strokeWidth="2" strokeLinecap="round"/>
          {/* costura lateral */}
          <path d="M 130 150 L 127 225 M 170 150 L 173 225" stroke={P.apronStitch} strokeWidth="0.4" strokeDasharray="1.5 1.2" opacity="0.75"/>
          {/* bolso */}
          <rect x="137" y="195" width="26" height="18" rx="1" fill={P.apronLeatherDark} stroke={P.apronStitch} strokeWidth="0.4" strokeDasharray="1.5 1.2"/>
        </g>
      )}

      {/* ─── HARNESS (arnês paraquedista — espelha HarnessIcon) ─── */}
      {harness && (
        <g>
          {/* alças em Y no peito */}
          <path d="M 125 125 L 148 160 M 175 125 L 152 160" stroke={P.harnessOrange} strokeWidth="6" strokeLinecap="square"/>
          <path d="M 125 125 L 148 160 M 175 125 L 152 160" stroke={P.harnessBuckle} strokeWidth="0.8" opacity="0.55"/>
          {/* faixa peitoral horizontal */}
          <rect x="122" y="155" width="56" height="7" fill={P.harnessOrange} stroke={P.harnessBuckle} strokeWidth="0.6"/>
          <line x1="122" y1="162" x2="178" y2="162" stroke={P.harnessBuckle} strokeWidth="0.4" opacity="0.6"/>
          {/* D-ring central */}
          <rect x="144" y="155" width="12" height="11" rx="1" fill={P.harnessDring} stroke={P.harnessBuckle} strokeWidth="0.7"/>
          <rect x="147" y="158" width="6" height="5" fill={P.harnessBuckle}/>
          {/* alças de perna */}
          <rect x="130" y="162" width="8" height="70" fill={P.harnessOrange} stroke={P.harnessBuckle} strokeWidth="0.6"/>
          <rect x="162" y="162" width="8" height="70" fill={P.harnessOrange} stroke={P.harnessBuckle} strokeWidth="0.6"/>
          {/* fivelas */}
          <rect x="129" y="200" width="10" height="5" rx="0.5" fill={P.harnessBuckle}/>
          <rect x="161" y="200" width="10" height="5" rx="0.5" fill={P.harnessBuckle}/>
          {/* linha de vida (talabarte) */}
          <path d="M 150 160 Q 210 90 270 50" stroke={P.harnessOrange} strokeWidth="2.5" fill="none" strokeDasharray="4 3" opacity="0.9"/>
          <rect x="262" y="42" width="14" height="14" fill={P.harnessDring} stroke={P.harnessBuckle} strokeWidth="1"/>
        </g>
      )}

      {/* ─── GLOVES (luvas industriais — espelha GlovesIcon) ─── */}
      {gloves && (
        <g>
          {/* mão esquerda */}
          <rect x="102" y="218" width="14" height="4" fill={P.gloveCuff}/>
          <path d="M 100 222 L 100 234 Q 100 238 104 238 L 116 238 Q 120 238 120 234 L 120 222 Z"
            fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="1"/>
          {/* reforço palma */}
          <path d="M 104 226 L 116 226 L 115 236 L 105 236 Z" fill={P.gloveCuff} opacity="0.25"/>
          {/* costuras */}
          <line x1="104" y1="226" x2="116" y2="226" stroke={P.gloveStitch} strokeWidth="0.4" strokeDasharray="0.8 0.7" opacity="0.85"/>
          <line x1="105" y1="236" x2="115" y2="236" stroke={P.gloveStitch} strokeWidth="0.4" strokeDasharray="0.8 0.7" opacity="0.85"/>
          {/* polegar */}
          <path d="M 100 226 L 96 229 Q 94 232 96 234 L 100 234" fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.8"/>

          {/* mão direita */}
          <rect x="184" y="218" width="14" height="4" fill={P.gloveCuff}/>
          <path d="M 180 222 L 180 234 Q 180 238 184 238 L 196 238 Q 200 238 200 234 L 200 222 Z"
            fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="1"/>
          <path d="M 184 226 L 196 226 L 195 236 L 185 236 Z" fill={P.gloveCuff} opacity="0.25"/>
          <line x1="184" y1="226" x2="196" y2="226" stroke={P.gloveStitch} strokeWidth="0.4" strokeDasharray="0.8 0.7" opacity="0.85"/>
          <line x1="185" y1="236" x2="195" y2="236" stroke={P.gloveStitch} strokeWidth="0.4" strokeDasharray="0.8 0.7" opacity="0.85"/>
          <path d="M 200 226 L 204 229 Q 206 232 204 234 L 200 234" fill={P.gloveOrange} stroke={P.gloveCuff} strokeWidth="0.8"/>
        </g>
      )}

      {/* ─── BOOTS (bota couro + biqueira aço — espelha BootsIcon) ─── */}
      {boots && (
        <g>
          {/* bota esquerda */}
          <path d="M 123 300 L 123 326 Q 123 334 130 334 L 144 334 Q 148 334 148 330 L 148 322 L 132 320 L 132 300 Z"
            fill={P.bootBlack} stroke="#000" strokeWidth="1"/>
          {/* biqueira de aço */}
          <ellipse cx="146" cy="328" rx="4" ry="3" fill={P.bootSteel} opacity="0.4"/>
          <path d="M 148 322 C 148 326 147 328 144 328" stroke={P.bootSteel} strokeWidth="0.8" opacity="0.85"/>
          {/* cadarços */}
          <path d="M 126 305 L 134 305 M 126 310 L 134 310 M 126 315 L 134 315" stroke={P.bootStitch} strokeWidth="0.5" opacity="0.9"/>
          {/* ilhoses */}
          <circle cx="126" cy="305" r="0.5" fill={P.bootSteel}/>
          <circle cx="134" cy="305" r="0.5" fill={P.bootSteel}/>
          <circle cx="126" cy="310" r="0.5" fill={P.bootSteel}/>
          <circle cx="134" cy="310" r="0.5" fill={P.bootSteel}/>
          <circle cx="126" cy="315" r="0.5" fill={P.bootSteel}/>
          <circle cx="134" cy="315" r="0.5" fill={P.bootSteel}/>
          {/* solado */}
          <rect x="122" y="333" width="28" height="3" fill="#000"/>
          <path d="M 124 335 L 124 336 M 128 335 L 128 336 M 132 335 L 132 336 M 136 335 L 136 336 M 140 335 L 140 336 M 144 335 L 144 336 M 148 335 L 148 336"
            stroke={P.bootSteel} strokeWidth="0.3" opacity="0.4"/>

          {/* bota direita */}
          <path d="M 177 300 L 177 326 Q 177 334 170 334 L 156 334 Q 152 334 152 330 L 152 322 L 168 320 L 168 300 Z"
            fill={P.bootBlack} stroke="#000" strokeWidth="1"/>
          <ellipse cx="154" cy="328" rx="4" ry="3" fill={P.bootSteel} opacity="0.4"/>
          <path d="M 152 322 C 152 326 153 328 156 328" stroke={P.bootSteel} strokeWidth="0.8" opacity="0.85"/>
          <path d="M 174 305 L 166 305 M 174 310 L 166 310 M 174 315 L 166 315" stroke={P.bootStitch} strokeWidth="0.5" opacity="0.9"/>
          <circle cx="166" cy="305" r="0.5" fill={P.bootSteel}/>
          <circle cx="174" cy="305" r="0.5" fill={P.bootSteel}/>
          <circle cx="166" cy="310" r="0.5" fill={P.bootSteel}/>
          <circle cx="174" cy="310" r="0.5" fill={P.bootSteel}/>
          <circle cx="166" cy="315" r="0.5" fill={P.bootSteel}/>
          <circle cx="174" cy="315" r="0.5" fill={P.bootSteel}/>
          <rect x="150" y="333" width="28" height="3" fill="#000"/>
          <path d="M 152 335 L 152 336 M 156 335 L 156 336 M 160 335 L 160 336 M 164 335 L 164 336 M 168 335 L 168 336 M 172 335 L 172 336 M 176 335 L 176 336"
            stroke={P.bootSteel} strokeWidth="0.3" opacity="0.4"/>
        </g>
      )}

      {/* ─── PESCOÇO ─── */}
      <path d="M 141 108 L 141 122 L 159 122 L 159 108 Z" fill={P.skin} stroke={P.skinShadow} strokeWidth="0.8"/>
      {/* sombra do queixo no pescoço */}
      <rect x="141" y="108" width="18" height="4" fill={P.skinShadow} opacity="0.4"/>

      {/* ─── CABEÇA (oval, perfis suaves) ─── */}
      <ellipse cx="150" cy="85" rx="23" ry="27" fill="url(#skin-shade)" stroke={P.skinShadow} strokeWidth="1.2"/>
      {/* cabelo base (parte alta, escondido parcialmente pelo capacete) */}
      <path d="M 130 70 Q 135 58 150 58 Q 165 58 170 70 Q 168 66 150 64 Q 132 66 130 70 Z"
        fill="#3f2a1d" opacity="0.85"/>
      {/* sombra lateral do rosto */}
      <ellipse cx="170" cy="90" rx="4" ry="15" fill={P.skinShadow} opacity="0.22"/>

      {/* ═══════════════════════════════════════════════════════════
         FACE — expressões com crossfade de opacity (0.6s smooth)
         Render antes das EPIs de cabeça para que máscara/goggles
         possam cobrir conforme a realidade.
         ═══════════════════════════════════════════════════════════ */}

      {/* Olhos — mantêm iguais, sutis */}
      <g style={{ transition: faceTransition }}>
        {/* base das íris */}
        <ellipse cx="142" cy="83" rx="2.2" ry="2.4" fill="#fff"/>
        <ellipse cx="158" cy="83" rx="2.2" ry="2.4" fill="#fff"/>
        <circle cx="142" cy="83.5" r="1.5" fill="#1e293b"/>
        <circle cx="158" cy="83.5" r="1.5" fill="#1e293b"/>
        {/* brilho */}
        <circle cx="142.5" cy="82.5" r="0.5" fill="#fff"/>
        <circle cx="158.5" cy="82.5" r="0.5" fill="#fff"/>
      </g>

      {/* Sobrancelhas — SAD (franzidas)  vs  HAPPY (relaxadas)
          Cross-fade suave. Sem salto em mood=0.5. */}
      <path d="M 135 75 L 148 79 M 165 79 L 152 75"
        stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none"
        opacity={sadOp} style={{ transition: faceTransition }}/>
      <path d="M 135 75 L 148 73 M 165 73 L 152 75"
        stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none"
        opacity={happyOp} style={{ transition: faceTransition }}/>

      {/* Nariz (discreto) */}
      <path d="M 150 87 L 148 94 L 152 94 Z" fill={P.skinShadow} opacity="0.35"/>

      {/* Boca — SAD (cai) vs HAPPY (sorri). Crossfade. */}
      <path d="M 143 100 Q 150 95 157 100"
        stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none"
        opacity={sadOp} style={{ transition: faceTransition }}/>
      <path d="M 143 98 Q 150 105 157 98"
        stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none"
        opacity={happyOp} style={{ transition: faceTransition }}/>
      {/* sorriso com linha interna (dentes/sombra) */}
      <path d="M 145 100 Q 150 103 155 100"
        stroke="#fbbf24" strokeWidth="0.6" fill="none"
        opacity={happyOp * 0.7} style={{ transition: faceTransition }}/>

      {/* Bochechas — só aparecem no sorriso (sutil, rosa quente) */}
      <circle cx="133" cy="92" r="3" fill="#fb7185" opacity={happyOp * 0.35} style={{ transition: faceTransition }}/>
      <circle cx="167" cy="92" r="3" fill="#fb7185" opacity={happyOp * 0.35} style={{ transition: faceTransition }}/>

      {/* ═══════════════════════════════════════════════════════════
         EPIs DE CABEÇA — ordem: muff → mask → goggles → helmet
         Cada um espelha o ícone do botão.
         ═══════════════════════════════════════════════════════════ */}

      {/* ─── EAR MUFFS (protetor auricular — espelha EarMuffIcon) ─── */}
      {earProtection && (
        <g>
          {/* arco superior (banda) */}
          <path d="M 128 65 Q 150 54 172 65" fill="none" stroke={P.muffBand} strokeWidth="3.5"/>
          <path d="M 128 65 Q 150 58 172 65" fill="none" stroke={P.muffFoam} strokeWidth="0.6" opacity="0.7"/>
          {/* concha esquerda */}
          <rect x="119" y="72" width="10" height="22" rx="3" fill={P.muffRed} stroke={P.muffShade} strokeWidth="0.8"/>
          <ellipse cx="124.5" cy="83" rx="2.5" ry="7" fill={P.muffShade} opacity="0.55"/>
          <ellipse cx="127" cy="83" rx="1" ry="5" fill={P.muffFoam} opacity="0.65"/>
          {/* concha direita */}
          <rect x="171" y="72" width="10" height="22" rx="3" fill={P.muffRed} stroke={P.muffShade} strokeWidth="0.8"/>
          <ellipse cx="175.5" cy="83" rx="2.5" ry="7" fill={P.muffShade} opacity="0.55"/>
          <ellipse cx="173" cy="83" rx="1" ry="5" fill={P.muffFoam} opacity="0.65"/>
        </g>
      )}

      {/* ─── MASK (respirador PFF2 — espelha MaskIcon) ─── */}
      {mask && (
        <g>
          {/* tiras de retenção */}
          <path d="M 128 80 L 118 76 M 128 96 L 118 100 M 172 80 L 182 76 M 172 96 L 182 100"
            stroke={P.maskStrap} strokeWidth="1.8" strokeLinecap="round"/>
          {/* cup principal (cobre mouth) */}
          <path d="M 130 88 Q 130 106 150 108 Q 170 106 170 88 L 170 84 Q 150 80 130 84 Z"
            fill={P.maskWhite} stroke={P.maskShadow} strokeWidth="1"/>
          {/* linha central */}
          <line x1="150" y1="82" x2="150" y2="108" stroke={P.maskShadow} strokeWidth="0.6" opacity="0.7"/>
          {/* filtros laterais */}
          <rect x="116" y="88" width="8" height="10" rx="1.5" fill={P.maskValve} stroke={P.maskStrap} strokeWidth="0.5"/>
          <rect x="176" y="88" width="8" height="10" rx="1.5" fill={P.maskValve} stroke={P.maskStrap} strokeWidth="0.5"/>
          {/* grelhas */}
          <line x1="118" y1="91" x2="122" y2="91" stroke="#94a3b8" strokeWidth="0.35"/>
          <line x1="118" y1="94" x2="122" y2="94" stroke="#94a3b8" strokeWidth="0.35"/>
          <line x1="118" y1="96" x2="122" y2="96" stroke="#94a3b8" strokeWidth="0.35"/>
          <line x1="178" y1="91" x2="182" y2="91" stroke="#94a3b8" strokeWidth="0.35"/>
          <line x1="178" y1="94" x2="182" y2="94" stroke="#94a3b8" strokeWidth="0.35"/>
          <line x1="178" y1="96" x2="182" y2="96" stroke="#94a3b8" strokeWidth="0.35"/>
          {/* válvula central */}
          <circle cx="150" cy="99" r="3" fill={P.maskValve}/>
          <circle cx="150" cy="99" r="1.8" fill="#1f2937"/>
          <circle cx="150" cy="98" r="0.5" fill="#475569"/>
        </g>
      )}

      {/* ─── GOGGLES (óculos de proteção — espelha GogglesIcon) ─── */}
      {goggles && (
        <g>
          {/* cinta atrás */}
          <path d="M 127 83 L 122 82 M 173 83 L 178 82" stroke={P.gogglesFrame} strokeWidth="2" strokeLinecap="round"/>
          {/* aro esquerdo */}
          <rect x="131" y="77" width="17" height="13" rx="4" fill={P.gogglesLensShade} stroke={P.gogglesFrame} strokeWidth="1.2"/>
          <rect x="133" y="79" width="13" height="9" rx="3" fill={P.gogglesLens} opacity="0.7"/>
          <path d="M 135 81 L 142 83" stroke="#fff" strokeWidth="0.9" opacity="0.85"/>
          {/* aro direito */}
          <rect x="152" y="77" width="17" height="13" rx="4" fill={P.gogglesLensShade} stroke={P.gogglesFrame} strokeWidth="1.2"/>
          <rect x="154" y="79" width="13" height="9" rx="3" fill={P.gogglesLens} opacity="0.7"/>
          <path d="M 156 81 L 163 83" stroke="#fff" strokeWidth="0.9" opacity="0.85"/>
          {/* ponte nasal */}
          <path d="M 148 83 L 152 83" stroke={P.gogglesFrame} strokeWidth="2"/>
        </g>
      )}

      {/* ─── HELMET (capacete ABS — espelha HelmetIcon) ─── */}
      {helmet && (
        <g>
          {/* aba (brim) com sombra */}
          <ellipse cx="150" cy="70" rx="28" ry="4" fill={P.helmetDark}/>
          {/* cúpula */}
          <path d="M 122 70 Q 122 46 150 46 Q 178 46 178 70 Z"
            fill="url(#helmet-shade)" stroke={P.helmetDark} strokeWidth="1.2"/>
          {/* crista central (ventilação) */}
          <path d="M 150 46 L 150 70" stroke={P.helmetDark} strokeWidth="0.9" opacity="0.7"/>
          {/* nervuras laterais */}
          <path d="M 132 50 Q 130 60 132 70" fill="none" stroke={P.helmetDark} strokeWidth="0.7" opacity="0.55"/>
          <path d="M 168 50 Q 170 60 168 70" fill="none" stroke={P.helmetDark} strokeWidth="0.7" opacity="0.55"/>
          {/* reflexo topo */}
          <ellipse cx="140" cy="54" rx="7" ry="3" fill="#fef3c7" opacity="0.55"/>
          {/* fita de cabeça/ajuste */}
          <path d="M 122 70 L 178 70" stroke={P.helmetStrap} strokeWidth="1.2"/>
          {/* jugular */}
          <path d="M 136 72 Q 150 78 164 72" stroke={P.helmetStrap} strokeWidth="1" fill="none" opacity="0.6"/>
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════
         RISKS — indicadores preservados
         ═══════════════════════════════════════════════════════════ */}

      {risks.headImpact && (
        <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 108 30 L 118 46 L 112 50 L 125 66"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite"/></path>
          <path d="M 192 30 L 182 46 L 188 50 L 175 66"><animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/></path>
        </g>
      )}

      {risks.handCuts && (
        <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
          <line x1="102" y1="228" x2="114" y2="240"/>
          <line x1="114" y1="228" x2="102" y2="240"/>
          <line x1="186" y1="228" x2="198" y2="240"/>
          <line x1="198" y1="228" x2="186" y2="240"/>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite"/>
        </g>
      )}

      {risks.fallRisk && (
        <g>
          <path d="M 230 150 L 230 210 L 225 205 M 230 210 L 235 205" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.1s" repeatCount="indefinite"/>
          </path>
          <text x="232" y="140" fontSize="10" fill="#f97316" fontFamily="'JetBrains Mono', monospace" fontWeight="700">queda</text>
        </g>
      )}

      {risks.shock && (
        <g stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M 150 46 L 145 62 L 152 62 L 148 78 L 155 76 L 150 92"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite"/></path>
          <path d="M 100 160 L 115 165 M 200 160 L 185 165" strokeWidth="2"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.6s" repeatCount="indefinite"/></path>
        </g>
      )}

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

      {risks.breathing && (
        <g stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          <path d="M 110 95 L 100 92"><animate attributeName="opacity" values="0.2;0.9;0.2" dur="1s" repeatCount="indefinite"/></path>
          <path d="M 108 100 L 95 100"><animate attributeName="opacity" values="0.9;0.2;0.9" dur="1s" repeatCount="indefinite"/></path>
        </g>
      )}

      {risks.noise && (
        <g stroke="#f97316" strokeWidth="2" fill="none">
          <path d="M 118 82 Q 110 82 108 85"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.7s" repeatCount="indefinite"/></path>
          <path d="M 118 85 Q 106 85 102 90"><animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite"/></path>
          <path d="M 182 82 Q 190 82 192 85"><animate attributeName="opacity" values="0.3;1;0.3" dur="0.7s" repeatCount="indefinite"/></path>
          <path d="M 182 85 Q 194 85 198 90"><animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite"/></path>
        </g>
      )}

      {risks.heatExposure && (
        <g fill="#ef4444" opacity="0.6">
          <path d="M 130 340 Q 130 320 135 315 Q 137 320 140 340 Z"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="0.6s" repeatCount="indefinite"/></path>
          <path d="M 160 340 Q 160 320 165 315 Q 167 320 170 340 Z"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.6s" repeatCount="indefinite"/></path>
        </g>
      )}

      {risks.bodyImpact && (
        <g>
          <path d="M 200 140 L 185 165 M 190 145 L 185 165 M 195 150 L 185 165" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
          </path>
        </g>
      )}

      {/* ─── Indicador de segurança quando tudo ok ─── */}
      {mood > 0.75 && !Object.values(risks).some(Boolean) && (
        <g>
          <circle cx="258" cy="170" r="14" fill="rgba(74,222,128,0.15)" stroke="#4ade80" strokeWidth="2">
            <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite"/>
          </circle>
          <path d="M 251 170 l 5 5 l 10 -10" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      )}
    </svg>
  )
}
