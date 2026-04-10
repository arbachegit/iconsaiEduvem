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

      {/* Background hint */}
      {backgroundHint === 'scaffold' && (
        <g opacity="0.22" stroke="#475569" strokeWidth="2" fill="none">
          <line x1="40" y1="340" x2="40" y2="60"/>
          <line x1="260" y1="340" x2="260" y2="60"/>
          <line x1="40" y1="140" x2="260" y2="140"/>
          <line x1="40" y1="60" x2="260" y2="60"/>
        </g>
      )}
      {backgroundHint === 'factory' && (
        <g opacity="0.22" stroke="#475569" strokeWidth="2" fill="none">
          <rect x="30" y="180" width="60" height="80"/>
          <rect x="210" y="180" width="60" height="80"/>
          <line x1="60" y1="180" x2="60" y2="140"/>
          <line x1="240" y1="180" x2="240" y2="140"/>
          <circle cx="60" cy="130" r="6"/>
          <circle cx="240" cy="130" r="6"/>
        </g>
      )}
      {backgroundHint === 'office' && (
        <g opacity="0.22" stroke="#475569" strokeWidth="2" fill="none">
          <rect x="40" y="220" width="220" height="60"/>
          <line x1="50" y1="220" x2="50" y2="330"/>
          <line x1="250" y1="220" x2="250" y2="330"/>
          <line x1="150" y1="220" x2="150" y2="280"/>
        </g>
      )}
      {backgroundHint === 'outdoor' && (
        <g opacity="0.18">
          <circle cx="250" cy="50" r="18" fill="#fbbf24"/>
          <path d="M 20 340 Q 150 310 280 340" stroke="#475569" strokeWidth="2" fill="none"/>
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
