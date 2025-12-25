import type { Product } from '../types'

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

interface SupabaseProduct {
  id: string
  store_id: string | null
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

interface Store {
  id: string
  platform: string
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

// Cache store IDs to avoid repeated lookups
let storeCache: Record<string, string> | null = null

async function getStoreIds(): Promise<Record<string, string>> {
  if (storeCache) return storeCache
  
  try {
    const url = `${SUPABASE_URL}/rest/v1/stores?select=id,platform`
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    })
    
    if (response.ok) {
      const stores: Store[] = await response.json()
      storeCache = {}
      stores.forEach(s => {
        storeCache![s.platform] = s.id
      })
    }
  } catch (e) {
    console.error('Failed to fetch stores:', e)
  }
  
  return storeCache || {}
}

export type StoreFilter = 'all' | 'shopify' | 'woocommerce'

export async function fetchSupabaseProducts(
  filter: StoreFilter = 'all',
  limit: number = 200
): Promise<Product[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase credentials not configured')
    return []
  }

  try {
    let url = `${SUPABASE_URL}/rest/v1/products?select=*&limit=${limit}`
    
    // Filter by store if not 'all'
    if (filter !== 'all') {
      const stores = await getStoreIds()
      const storeId = stores[filter]
      if (storeId) {
        url += `&store_id=eq.${storeId}`
      }
    }
    
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

export const supabaseConfig = {
  url: SUPABASE_URL,
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
}
