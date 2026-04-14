import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050d1a',
}

export const metadata: Metadata = {
  title: 'O Interativo Mundo da NR | Eduvem',
  description: 'Curso interativo sobre as Normas Regulamentadoras brasileiras, adaptado por setor de atuacao.',
  keywords: ['NR', 'norma regulamentadora', 'seguranca do trabalho', 'sst', 'curso', 'eduvem'],
  robots: 'index, follow',
  openGraph: {
    title: 'O Interativo Mundo da NR | IconsAI',
    description: 'Curso interativo sobre as Normas Regulamentadoras brasileiras, adaptado por setor de atuacao.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning style={{
        backgroundColor: '#050d1a',
        color: '#e2e8f0',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '0.9375rem',
        lineHeight: 1.6,
        margin: 0,
        minHeight: '100vh',
      }}>
        {children}
      </body>
    </html>
  )
}
