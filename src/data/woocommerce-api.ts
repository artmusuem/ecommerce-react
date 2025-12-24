import type { Product } from '../types'

// WooCommerce REST API configuration
const WOOCOMMERCE_URL = import.meta.env.VITE_WOOCOMMERCE_URL || 'https://rapidwoo.com/commerce'
const WOOCOMMERCE_KEY = import.meta.env.VITE_WOOCOMMERCE_KEY || ''
const WOOCOMMERCE_SECRET = import.meta.env.VITE_WOOCOMMERCE_SECRET || ''

interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  price: string
  regular_price: string
  categories: Array<{ id: number; name: string; slug: string }>
  images: Array<{ id: number; src: string; alt: string }>
  attributes: Array<{ name: string; options: string[] }>
  tags: Array<{ id: number; name: string; slug: string }>
  status: string
}

function transformWooCommerceProduct(wooProduct: WooCommerceProduct): Product {
  // Extract artist from attributes or use category
  const artistAttr = wooProduct.attributes.find(a => 
    a.name.toLowerCase() === 'artist' || a.name.toLowerCase() === 'author'
  )
  const artist = artistAttr?.options[0] || 
    wooProduct.categories[0]?.name || 
    'Unknown Artist'

  // Extract year from attributes
  const yearAttr = wooProduct.attributes.find(a => 
    a.name.toLowerCase() === 'year' || a.name.toLowerCase() === 'date'
  )
  const year = yearAttr?.options[0] || 'Date unknown'

  // Extract medium from attributes
  const mediumAttr = wooProduct.attributes.find(a => 
    a.name.toLowerCase() === 'medium' || a.name.toLowerCase() === 'material'
  )
  const medium = mediumAttr?.options[0] || 'Print'

  // Strip HTML from description
  const description = wooProduct.short_description || wooProduct.description || ''
  const cleanDescription = description.replace(/<[^>]*>/g, '').trim()

  return {
    id: wooProduct.slug || String(wooProduct.id),
    title: wooProduct.name,
    artist,
    year,
    origin: 'WooCommerce Store',
    medium,
    image: wooProduct.images[0]?.src || '/placeholder.jpg',
    description: cleanDescription || `${wooProduct.name}`,
    tags: wooProduct.tags.map(t => t.name),
  }
}

export async function fetchWooCommerceProducts(limit: number = 24): Promise<Product[]> {
  if (!WOOCOMMERCE_KEY || !WOOCOMMERCE_SECRET) {
    console.error('WooCommerce credentials not configured')
    return []
  }

  const url = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products`)
  url.searchParams.set('consumer_key', WOOCOMMERCE_KEY)
  url.searchParams.set('consumer_secret', WOOCOMMERCE_SECRET)
  url.searchParams.set('per_page', String(limit))
  url.searchParams.set('page', '1')
  url.searchParams.set('status', 'publish')

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`)
    }

    const products: WooCommerceProduct[] = await response.json()
    
    return products
      .filter(p => p.status === 'publish')
      .map(p => transformWooCommerceProduct(p))
  } catch (error) {
    console.error('WooCommerce fetch error:', error)
    return []
  }
}

export async function fetchWooCommerceProduct(slugOrId: string): Promise<Product | null> {
  if (!WOOCOMMERCE_KEY || !WOOCOMMERCE_SECRET) {
    return null
  }

  try {
    // First try by slug
    const url = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products`)
    url.searchParams.set('consumer_key', WOOCOMMERCE_KEY)
    url.searchParams.set('consumer_secret', WOOCOMMERCE_SECRET)
    url.searchParams.set('slug', slugOrId)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status}`)
    }

    const products: WooCommerceProduct[] = await response.json()
    
    if (products.length > 0) {
      return transformWooCommerceProduct(products[0])
    }

    // If not found by slug, try by ID
    const idUrl = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products/${slugOrId}`)
    idUrl.searchParams.set('consumer_key', WOOCOMMERCE_KEY)
    idUrl.searchParams.set('consumer_secret', WOOCOMMERCE_SECRET)

    const idResponse = await fetch(idUrl.toString())
    
    if (idResponse.ok) {
      const product: WooCommerceProduct = await idResponse.json()
      return transformWooCommerceProduct(product)
    }

    return null
  } catch (error) {
    console.error('WooCommerce fetch error:', error)
    return null
  }
}

// Export config for checking data source
export const woocommerceConfig = {
  url: WOOCOMMERCE_URL,
  isConfigured: Boolean(WOOCOMMERCE_KEY && WOOCOMMERCE_SECRET),
}
