import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchSupabaseProducts, StoreFilter } from '../data/supabase-api'
import ProductCard from '../components/product/ProductCard'
import type { Product } from '../types'

type DataSource = 'all' | 'shopify' | 'woocommerce'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // URL param: ?store=shopify or ?store=woocommerce or ?store=all
  const storeParam = searchParams.get('store') as DataSource | null
  const validStores: DataSource[] = ['all', 'shopify', 'woocommerce']
  const activeStore: DataSource = (storeParam && validStores.includes(storeParam))
    ? storeParam 
    : 'all'

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)
      
      try {
        // All reads from Supabase - just filter by store
        const supabaseProducts = await fetchSupabaseProducts(activeStore as StoreFilter)
        setProducts(supabaseProducts)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [activeStore])

  // Labels
  const storeLabels: Record<DataSource, string> = {
    all: 'All Stores',
    shopify: 'Shopify',
    woocommerce: 'WooCommerce'
  }

  // Switch store via URL
  const switchStore = (newStore: DataSource) => {
    const newParams = new URLSearchParams(searchParams)
    if (newStore === 'all') {
      newParams.delete('store')
    } else {
      newParams.set('store', newStore)
    }
    setSearchParams(newParams)
  }

  // Button styles
  const getButtonStyle = (store: DataSource) => {
    const isActive = activeStore === store
    const colors: Record<DataSource, string> = {
      all: isActive ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700',
      shopify: isActive ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700',
      woocommerce: isActive ? 'bg-purple-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700',
    }
    return `px-3 py-1.5 text-xs font-medium rounded-md transition-all ${colors[store]}`
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Toolbar */}
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
                  {storeLabels[activeStore]}
                </h1>
                <p className="text-sm text-gray-500">
                  Powered by Supabase • Instant load
                </p>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-primary text-white">
                {products.length} products
              </span>
            </div>

            {/* Right: Store switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => switchStore('all')}
                className={getButtonStyle('all')}
              >
                All
              </button>
              <button
                onClick={() => switchStore('shopify')}
                className={getButtonStyle('shopify')}
              >
                Shopify
              </button>
              <button
                onClick={() => switchStore('woocommerce')}
                className={getButtonStyle('woocommerce')}
              >
                WooCommerce
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="rounded-xl overflow-hidden bg-white"
              >
                <div className="aspect-square skeleton-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 rounded w-3/4 skeleton-pulse" />
                  <div className="h-3 rounded w-1/2 skeleton-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                artistId={activeStore}
                priority={index < 6}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">
              No products found.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                  <rect x="6" y="6" width="12" height="12" rx="1" stroke="white" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Gallery Store</span>
                <p className="text-xs text-gray-500">
                  Headless Multi-Channel Storefront
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="font-medium text-emerald-600">
                ⚡ All data from Supabase
              </span>
              <span>•</span>
              <span>Free shipping on orders $100+</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
