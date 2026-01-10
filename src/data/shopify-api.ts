import type { Product } from '../types'

// Shopify Storefront API configuration
const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE || 'dev-store-749237498237498787.myshopify.com'
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '0280512affca137e1ea6ddd246cf1bc7'
const API_VERSION = '2024-01'

interface ShopifyVariant {
  id: string
  title: string
  price: {
    amount: string
    currencyCode: string
  }
  availableForSale: boolean
  selectedOptions: Array<{
    name: string
    value: string
  }>
}

interface ShopifyOption {
  name: string
  values: string[]
}

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  vendor: string
  productType: string
  tags: string[]
  options: ShopifyOption[]
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  variants: {
    edges: Array<{
      node: ShopifyVariant
    }>
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

interface SingleProductResponse {
  data: {
    product: ShopifyProduct | null
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
  const res = await fetch(
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

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status}`)
  }

  return res.json()
}

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
    }
  }
}

export async function fetchShopifyProducts(): Promise<Product[]> {
  const allProducts: Product[] = []
  let hasNextPage = true
  let cursor: string | null = null

  while (hasNextPage) {
    const res: ShopifyResponse = await shopifyFetch<ShopifyResponse>(PRODUCTS_QUERY, {
      first: 50,
      after: cursor,
    })

    const products = res.data.products.edges.map((edge: { node: ShopifyProduct }) => 
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
      }
    }
  `

  const res: SingleProductResponse = await shopifyFetch<SingleProductResponse>(query, { handle })

  if (!res.data.product) {
    return null
  }

  return transformShopifyProduct(res.data.product)
}

// Export config for checking data source
export const shopifyConfig = {
  store: SHOPIFY_STORE,
  isConfigured: Boolean(SHOPIFY_TOKEN),
}
