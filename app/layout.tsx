import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'O Interativo Mundo da NR | iconsaiEduven',
  description: 'Curso interativo sobre as Normas Regulamentadoras brasileiras, adaptado por setor de atuacao.',
  keywords: ['NR', 'norma regulamentadora', 'seguranca do trabalho', 'sst', 'curso', 'iconsai'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
