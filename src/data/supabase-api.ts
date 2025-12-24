import type { Product } from '../types'

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

interface SupabaseProduct {
  id: string
  title: string
  description: string | null
  price: number | null
  artist: string | null
  category: string | null
  image_url: string | null
  sku: string | null
  status: string
  created_at: string
  updated_at: string
}

function transformSupabaseProduct(product: SupabaseProduct): Product {
  return {
    id: product.id,
    title: product.title || 'Untitled',
    artist: product.artist || 'Unknown Artist',
    year: 'Date unknown',
    origin: 'Commerce Hub',
    medium: product.category || 'Print',
    image: product.image_url || '/placeholder.jpg',
    description: product.description || product.title || '',
    tags: product.category ? [product.category] : [],
  }
}

export async function fetchSupabaseProducts(limit: number = 50): Promise<Product[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase credentials not configured')
    return []
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/products?status=eq.active&select=*&limit=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    })

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status}`)
    }

    const products: SupabaseProduct[] = await response.json()
    
    return products.map(p => transformSupabaseProduct(p))
  } catch (error) {
    console.error('Supabase fetch error:', error)
    return []
  }
}

export async function fetchSupabaseProduct(id: string): Promise<Product | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    })

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status}`)
    }

    const products: SupabaseProduct[] = await response.json()
    
    if (products.length > 0) {
      return transformSupabaseProduct(products[0])
    }

    return null
  } catch (error) {
    console.error('Supabase fetch error:', error)
    return null
  }
}

// Export config for checking data source
export const supabaseConfig = {
  url: SUPABASE_URL,
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
}
