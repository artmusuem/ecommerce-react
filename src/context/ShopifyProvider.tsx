import {
  ShopifyProvider as HydrogenShopifyProvider,
  CartProvider,
} from '@shopify/hydrogen-react'
import type { ReactNode } from 'react'

interface ShopifyProviderProps {
  children: ReactNode
}

export function ShopifyProvider({ children }: ShopifyProviderProps) {
  const storeDomain = import.meta.env.VITE_SHOPIFY_STORE
  const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
  const storefrontApiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-01'

  // If Shopify isn't configured, render children without providers
  if (!storeDomain || !storefrontToken) {
    console.warn('Shopify not configured. Running in demo mode.')
    return <>{children}</>
  }

  return (
    <HydrogenShopifyProvider
      storeDomain={storeDomain}
      storefrontToken={storefrontToken}
      storefrontApiVersion={storefrontApiVersion}
      countryIsoCode="US"
      languageIsoCode="EN"
    >
      <CartProvider
        onLineAdd={() => {
          // Cart line added - handled by UI
        }}
        onLineRemove={() => {
          // Cart line removed - handled by UI
        }}
      >
        {children}
      </CartProvider>
    </HydrogenShopifyProvider>
  )
}
