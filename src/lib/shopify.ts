import { createStorefrontClient } from '@shopify/hydrogen-react'

// Environment variables for Shopify connection (matches .env.example)
const storeDomain = import.meta.env.VITE_SHOPIFY_STORE
const publicStorefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const storefrontApiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-01'

if (!storeDomain || !publicStorefrontToken) {
  console.warn(
    'Missing Shopify environment variables. Set VITE_SHOPIFY_STORE and VITE_SHOPIFY_STOREFRONT_TOKEN'
  )
}

// Create the Shopify storefront client
export const shopifyClient = createStorefrontClient({
  storeDomain: storeDomain || 'placeholder.myshopify.com',
  publicStorefrontToken: publicStorefrontToken || '',
  storefrontApiVersion,
})

// Export the fetch function for GraphQL queries
export const getStorefrontApiUrl = shopifyClient.getStorefrontApiUrl
export const getPublicTokenHeaders = shopifyClient.getPublicTokenHeaders

// Helper function to make Storefront API requests
export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string
  variables?: Record<string, unknown>
}): Promise<T> {
  const response = await fetch(getStorefrontApiUrl(), {
    method: 'POST',
    headers: {
      ...getPublicTokenHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    console.error('Shopify GraphQL errors:', json.errors)
    throw new Error(json.errors[0]?.message || 'Shopify GraphQL error')
  }

  return json.data
}

// Shop info for configuration
export const shopConfig = {
  storeDomain,
  countryIsoCode: 'US',
  languageIsoCode: 'EN',
}
