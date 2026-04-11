/**
 * brand.ts — configuração multi-brand (2 frontends, 1 app, 1 banco).
 *
 * O middleware detecta o domínio e seta o cookie 'eduven_brand'.
 * O BrandProvider lê o cookie e expõe o config via React context.
 * Componentes usam useBrand() pra decidir o que mostrar/esconder.
 *
 * REGRA: funcionalidades são IDENTICAS. Só muda:
 *   - Header (iconsai tem, eduvem não)
 *   - Logos (iconsai tem i.ai + ait.svg, eduvem não)
 *   - Floating button (iconsai tem, eduvem não)
 *   - Cores accent
 *   - Título da página
 *   - Auth (iconsai = tools-auth, eduvem = aberto)
 */

export interface BrandConfig {
  id: 'iconsai' | 'eduvem'
  name: string
  accent: string
  accentSoft: string
  showHeader: boolean
  showFloatingButton: boolean
  showLogosInModal: boolean
  favicon: string
  pageTitle: string
  headerTitle?: string
  headerSubtitle?: string
  footerText?: string
  /** 'tools' = tools-auth gate obrigatório. 'open' = sem login. */
  authMode: 'tools' | 'open'
}

export const BRANDS: Record<string, BrandConfig> = {
  iconsai: {
    id: 'iconsai',
    name: 'IconsAI',
    accent: '#22d3ee',
    accentSoft: 'rgba(34,211,238,0.10)',
    showHeader: true,
    showFloatingButton: true,
    showLogosInModal: true,
    favicon: '/icon.svg',
    pageTitle: 'O Interativo Mundo da NR | IconsAI',
    headerTitle: 'O Interativo Mundo da NR',
    headerSubtitle: 'by IconsAI',
    footerText: 'by IconsAI',
    authMode: 'tools',
  },
  eduvem: {
    id: 'eduvem',
    name: 'Eduvem',
    accent: '#3b82f6',
    accentSoft: 'rgba(59,130,246,0.10)',
    showHeader: false,
    showFloatingButton: false,
    showLogosInModal: false,
    favicon: '/favicon-eduvem.svg',
    pageTitle: 'Curso NR Interativo | Eduvem',
    headerTitle: 'Curso NR Interativo',
    headerSubtitle: '',
    footerText: '',
    authMode: 'open',
  },
}

/** Detecta a brand pelo hostname */
export function detectBrand(host: string): 'iconsai' | 'eduvem' {
  if (host.includes('iconsai')) return 'iconsai'
  // localhost em dev = depende do AUTH_MODE env
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return process.env.AUTH_MODE === 'bypass' ? 'eduvem' : 'iconsai'
  }
  return 'eduvem' // qualquer domínio externo = whitelabel
}

export function getBrand(id: string): BrandConfig {
  return BRANDS[id] || BRANDS.eduvem
}
