'use client'

/**
 * FloatingButton — Regra de Ouro IconsAI.
 * Imagem absoluta apontando pro icon.iconsai.ai (NUNCA path relativo).
 */
export default function FloatingButton() {
  return (
    <a
      className="floating-logo"
      href="https://icon.iconsai.ai/icon"
      target="_blank"
      rel="noopener noreferrer"
      title="Voltar para IconsAI"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://icon.iconsai.ai/icon/favicon-float.png" alt="IconsAI" />
    </a>
  )
}
