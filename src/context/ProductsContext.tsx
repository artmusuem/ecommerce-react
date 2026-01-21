/**
 * ProductsContext - Provides access to all products across the app
 *
 * Used by the Cart's "More from Artist" carousel to show related works.
 * Products are loaded at the root level and available to all components.
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { Product } from '../types'

interface ProductsContextValue {
  products: Product[]
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

interface ProductsProviderProps {
  children: ReactNode
  products: Product[]
}

export function ProductsProvider({ children, products }: ProductsProviderProps) {
  return (
    <ProductsContext.Provider value={{ products }}>
      {children}
    </ProductsContext.Provider>
  )
}

/**
 * Access all products
 * Returns empty array if used outside provider (safe fallback)
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useProducts(): Product[] {
  const context = useContext(ProductsContext)
  return context?.products ?? []
}
