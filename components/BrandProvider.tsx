'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { BRANDS, type BrandConfig } from '@/lib/brand'

/**
 * BrandProvider — React context que expoe a BrandConfig pra toda a app.
 *
 * O layout.tsx server component le o cookie 'eduven_brand' e passa
 * o id pro BrandProvider. Componentes usam useBrand() pra decidir
 * o que mostrar/esconder.
 */

const BrandContext = createContext<BrandConfig>(BRANDS.iconsai)

export function useBrand(): BrandConfig {
  return useContext(BrandContext)
}

export default function BrandProvider({
  brandId,
  children,
}: {
  brandId: string
  children: ReactNode
}) {
  const brand = BRANDS[brandId] || BRANDS.eduvem
  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  )
}
