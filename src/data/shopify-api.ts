import type { Product } from '../types'

// Shopify Storefront API configuration
const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE || 'dev-store-749237498237498787.myshopify.com'
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '0280512affca137e1ea6ddd246cf1bc7'
const API_VERSION = '2024-01'

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  vendor: string
  productType: string
  tags: string[]
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  featuredImage: {
    url: string
    altText: string | null
  } | null
  images: {
    edges: Array<{
      node: {
        url: string
        altText: string | null
      }
    }>
  }
}

interface ShopifyResponse {
  data: {
    products: {
      edges: Array<{
        node: ShopifyProduct
      }>
      pageInfo: {
        hasNextPage: boolean
        endCursor: string
      }
    }
  }
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
          priceRange {
            minVariantPrice {
              amount
              currencyCode
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
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(
    `https://${SHOPIFY_STORE}/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  )

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`)
  }

  return response.json()
}

function transformShopifyProduct(shopifyProduct: ShopifyProduct): Product {
  const price = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount)
  
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
    basePrice: price,
  }
}

export async function fetchShopifyProducts(): Promise<Product[]> {
  const allProducts: Product[] = []
  let hasNextPage = true
  let cursor: string | null = null

  while (hasNextPage) {
    const response = await shopifyFetch<ShopifyResponse>(PRODUCTS_QUERY, {
      first: 50,
      after: cursor,
    })

    const products = response.data.products.edges.map(edge => 
      transformShopifyProduct(edge.node)
    )
    
    allProducts.push(...products)
    
    hasNextPage = response.data.products.pageInfo.hasNextPage
    cursor = response.data.products.pageInfo.endCursor
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
        priceRange {
          minVariantPrice {
            amount
            currencyCode
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
      }
    }
  `

  const response = await shopifyFetch<{ data: { product: ShopifyProduct | null } }>(query, { handle })
  
  if (!response.data.product) {
    return null
  }

  return transformShopifyProduct(response.data.product)
}

// Export config for checking data source
export const shopifyConfig = {
  store: SHOPIFY_STORE,
  isConfigured: Boolean(SHOPIFY_TOKEN),
}
