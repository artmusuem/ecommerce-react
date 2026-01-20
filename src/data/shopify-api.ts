import type { Product, Collection } from '../types'
import {
  ShopifyProductsResponseSchema,
  ShopifySingleProductResponseSchema,
  ShopifyCollectionsResponseSchema,
  ShopifyCollectionProductsResponseSchema,
  validateResponse,
  type ShopifyProduct,
  type ShopifyProductsResponse,
  type ShopifySingleProductResponse,
  type ShopifyCollectionsResponse,
  type ShopifyCollectionProductsResponse
} from '../schemas/shopify'

// Shopify Storefront API configuration
// Works in both client (Vite) and server (Node.js) contexts
const SHOPIFY_STORE =
  (typeof process !== 'undefined' && process.env?.SHOPIFY_STORE) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOPIFY_STORE) ||
  'dev-store-749237498237498787.myshopify.com'

const SHOPIFY_TOKEN =
  (typeof process !== 'undefined' && process.env?.SHOPIFY_STOREFRONT_TOKEN) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOPIFY_STOREFRONT_TOKEN) ||
  '0280512affca137e1ea6ddd246cf1bc7'

const API_VERSION = '2025-01'

// Fetch configuration
const FETCH_TIMEOUT_MS = 10000 // 10 seconds
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 1000

/**
 * Custom error class for Shopify API errors
 */
export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'ShopifyApiError'
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller
}

/**
 * Fetch with timeout and retry logic
 *
 * Features:
 * - Configurable timeout (default 10s)
 * - Exponential backoff retry (3 attempts)
 * - Only retries on transient failures (5xx, network errors)
 */
async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: { timeout?: number; maxRetries?: number } = {}
): Promise<T> {
  const { timeout = FETCH_TIMEOUT_MS, maxRetries = MAX_RETRIES } = options
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = createTimeoutController(timeout)

    try {
      const res = await fetch(
        `https://${SHOPIFY_STORE}/api/${API_VERSION}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
          },
          body: JSON.stringify({ query, variables }),
          signal: controller.signal,
        }
      )

      // Don't retry client errors (4xx)
      if (res.status >= 400 && res.status < 500) {
        throw new ShopifyApiError(
          `Shopify API client error: ${res.status}`,
          res.status,
          false
        )
      }

      // Retry server errors (5xx)
      if (!res.ok) {
        throw new ShopifyApiError(
          `Shopify API error: ${res.status}`,
          res.status,
          true
        )
      }

      return res.json()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Handle timeout/abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = new ShopifyApiError(
          `Request timeout after ${timeout}ms`,
          undefined,
          true
        )
      }

      // Check if error is retryable
      const isRetryable =
        error instanceof ShopifyApiError ? error.retryable :
        error instanceof TypeError // Network error

      if (!isRetryable || attempt >= maxRetries - 1) {
        throw lastError
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt)
      console.warn(
        `Shopify API request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`
      )
      await sleep(delay)
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError || new Error('Unknown error')
}

const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          productType
          tags
          options {
            name
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          featuredImage {
            url
            altText
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          accessionNumber: metafield(namespace: "museum", key: "accession_number") {
            value
          }
          smithsonianId: metafield(namespace: "museum", key: "smithsonian_id") {
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

function transformShopifyProduct(shopifyProduct: ShopifyProduct): Product {
  // Transform variants
  const variants = shopifyProduct.variants?.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    price: node.price.amount,
    availableForSale: node.availableForSale,
    selectedOptions: node.selectedOptions.map(opt => ({
      name: opt.name,
      value: opt.value
    }))
  })) || []

  // Transform options
  const options = shopifyProduct.options?.map(opt => ({
    name: opt.name,
    values: opt.values
  })) || []

  return {
    id: shopifyProduct.handle,
    title: shopifyProduct.title,
    artist: shopifyProduct.vendor || 'Unknown Artist',
    year: 'Contemporary',
    origin: 'Shopify Store',
    medium: shopifyProduct.productType || 'Mixed media',
    image: shopifyProduct.featuredImage?.url || '/placeholder.jpg',
    description: shopifyProduct.description || `${shopifyProduct.title} by ${shopifyProduct.vendor}`,
    tags: shopifyProduct.tags,
    options,
    variants,
    priceRange: {
      minPrice: shopifyProduct.priceRange?.minVariantPrice?.amount || '0',
      maxPrice: shopifyProduct.priceRange?.maxVariantPrice?.amount || '0'
    },
    accession_number: shopifyProduct.accessionNumber?.value,
    smithsonian_id: shopifyProduct.smithsonianId?.value
  }
}

export async function fetchShopifyProducts(): Promise<Product[]> {
  const allProducts: Product[] = []
  let hasNextPage = true
  let cursor: string | null = null

  while (hasNextPage) {
    const rawResponse = await shopifyFetch<unknown>(PRODUCTS_QUERY, {
      first: 50,
      after: cursor,
    })

    // Validate response structure
    const res: ShopifyProductsResponse = validateResponse(
      ShopifyProductsResponseSchema,
      rawResponse,
      'fetchShopifyProducts'
    )

    const products = res.data.products.edges.map((edge) =>
      transformShopifyProduct(edge.node)
    )

    allProducts.push(...products)

    hasNextPage = res.data.products.pageInfo.hasNextPage
    cursor = res.data.products.pageInfo.endCursor
  }

  return allProducts
}

export async function fetchShopifyProduct(handle: string): Promise<Product | null> {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        vendor
        productType
        tags
        options {
          name
          values
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        accessionNumber: metafield(namespace: "museum", key: "accession_number") {
          value
        }
        smithsonianId: metafield(namespace: "museum", key: "smithsonian_id") {
          value
        }
      }
    }
  `

  const rawResponse = await shopifyFetch<unknown>(query, { handle })

  // Validate response structure
  const res: ShopifySingleProductResponse = validateResponse(
    ShopifySingleProductResponseSchema,
    rawResponse,
    'fetchShopifyProduct'
  )

  if (!res.data.product) {
    return null
  }

  return transformShopifyProduct(res.data.product)
}

// Fetch all collections
export async function fetchCollections(): Promise<Collection[]> {
  const query = `
    query getCollections {
      collections(first: 50) {
        edges {
          node {
            id
            handle
            title
            description
            image {
              url
            }
            products(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `

  const rawResponse = await shopifyFetch<unknown>(query)

  // Validate response structure
  const res: ShopifyCollectionsResponse = validateResponse(
    ShopifyCollectionsResponseSchema,
    rawResponse,
    'fetchCollections'
  )

  // Defensive check for response structure (additional safety)
  if (!res?.data?.collections?.edges) {
    console.warn('No collections found in response:', res)
    return []
  }

  return res.data.collections.edges
    .map(({ node }) => ({
      id: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description || '',
      image: node.image?.url,
      productsCount: node.products?.edges?.length || 0
    }))
    .filter(collection => collection.productsCount > 0) // Only collections with products
}

// Fetch products from a specific collection
export async function fetchCollectionProducts(handle: string): Promise<Product[]> {
  const query = `
    query getCollectionProducts($handle: String!) {
      collection(handle: $handle) {
        products(first: 100) {
          edges {
            node {
              id
              title
              handle
              description
              vendor
              productType
              tags
              options {
                name
                values
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              featuredImage {
                url
                altText
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              accessionNumber: metafield(namespace: "museum", key: "accession_number") {
                value
              }
            }
          }
        }
      }
    }
  `

  const rawResponse = await shopifyFetch<unknown>(query, { handle })

  // Validate response structure
  const res: ShopifyCollectionProductsResponse = validateResponse(
    ShopifyCollectionProductsResponseSchema,
    rawResponse,
    'fetchCollectionProducts'
  )

  if (!res.data.collection) {
    return []
  }

  return res.data.collection.products.edges.map(({ node }) =>
    transformShopifyProduct(node)
  )
}

// Export config for checking data source
export const shopifyConfig = {
  store: SHOPIFY_STORE,
  isConfigured: Boolean(SHOPIFY_TOKEN),
}
