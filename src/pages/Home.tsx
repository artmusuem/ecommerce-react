import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { artists, transformArtwork } from '../data/products'
import { fetchShopifyProducts } from '../data/shopify-api'
import { fetchWooCommerceProducts } from '../data/woocommerce-api'
import ProductCard from '../components/product/ProductCard'
import type { Product, RawArtwork } from '../types'

// Default data source from env
const DEFAULT_DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'json'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // URL param overrides env: ?source=shopify or ?source=woocommerce or ?source=json
  const sourceParam = searchParams.get('source')
  const activeSource = (sourceParam === 'shopify' || sourceParam === 'woocommerce' || sourceParam === 'json') 
    ? sourceParam 
    : DEFAULT_DATA_SOURCE
  
  const artistParam = searchParams.get('artist')
  const [selectedArtist, setSelectedArtist] = useState(
    artists.find(a => a.id === artistParam)?.id || artists[0].id
  )

  const handleArtistChange = (artistId: string) => {
    setSelectedArtist(artistId)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('artist', artistId)
    setSearchParams(newParams)
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'json' | 'shopify' | 'woocommerce'>('json')

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)
      
      try {
        if (activeSource === 'shopify') {
          // Fetch from Shopify Storefront API
          const shopifyProducts = await fetchShopifyProducts()
          setProducts(shopifyProducts)
          setDataSource('shopify')
        } else if (activeSource === 'woocommerce') {
          // Fetch from WooCommerce REST API
          const wooProducts = await fetchWooCommerceProducts()
          setProducts(wooProducts)
          setDataSource('woocommerce')
        } else {
          // Fetch from local JSON files
          const artist = artists.find(a => a.id === selectedArtist)
          if (!artist) return
          
          const response = await fetch(artist.file)
          if (!response.ok) throw new Error('Failed to load artwork')
          
          const data: { artworks: RawArtwork[] } = await response.json()
          const transformed = data.artworks
            .filter(art => art.image && art.title)
            .map((art, i) => transformArtwork(art, i))
          
          setProducts(transformed)
          setDataSource('json')
        }
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [selectedArtist, activeSource])

  const isHeadlessMode = dataSource === 'shopify' || dataSource === 'woocommerce'
  const currentArtist = artists.find(a => a.id === selectedArtist)
  
  // Platform-specific labels
  const platformLabel = dataSource === 'shopify' ? 'Shopify' : 
                        dataSource === 'woocommerce' ? 'WooCommerce' : 'Smithsonian'
  const platformBadge = dataSource === 'shopify' ? '⚡ Headless Shopify' :
                        dataSource === 'woocommerce' ? '🔌 Headless WooCommerce' : null

  // Helper to switch data source via URL
  const switchSource = (newSource: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (newSource === 'json') {
      newParams.delete('source')
    } else {
      newParams.set('source', newSource)
    }
    setSearchParams(newParams)
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Compact Toolbar */}
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Title/Artist info */}
            <div className="flex items-center gap-4">
              <div>
                {isHeadlessMode ? (
                  <>
                    <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
                      All Products
                    </h1>
                    <p className="text-sm text-gray-500">
                      Powered by {platformLabel}
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
                      {currentArtist?.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                      American, {currentArtist?.dates}
                    </p>
                  </>
                )}
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-primary text-white">
                {products.length} {isHeadlessMode ? 'products' : 'prints'}
              </span>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
              {/* Artist selector (JSON mode only) */}
              {!isHeadlessMode && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Artist:
                  </span>
                  <select
                    value={selectedArtist}
                    onChange={(e) => handleArtistChange(e.target.value)}
                    className="px-3 py-2 text-sm font-medium rounded-lg border-2 cursor-pointer transition-colors min-w-[180px] border-gray-200 bg-white text-gray-800 focus:border-primary focus:outline-none"
                  >
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Data source switcher */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => switchSource('json')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dataSource === 'json' 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => switchSource('shopify')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dataSource === 'shopify' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Shopify
                </button>
                <button
                  onClick={() => switchSource('woocommerce')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dataSource === 'woocommerce' 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  WooCommerce
                </button>
              </div>
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
                artistId={isHeadlessMode ? dataSource : selectedArtist}
                priority={index < 6}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">
              {isHeadlessMode 
                ? `No products found in ${platformLabel} store.` 
                : 'No artwork found for this artist.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                  <rect x="6" y="6" width="12" height="12" rx="1" stroke="white" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-800">
                  Gallery Store
                </span>
                <p className="text-xs text-gray-500">
                  {isHeadlessMode 
                    ? `Headless ${platformLabel} Storefront`
                    : 'Museum-quality prints from the Smithsonian'}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {isHeadlessMode ? (
                <span className={`font-medium ${
                  dataSource === 'shopify' ? 'text-green-600' : 'text-purple-600'
                }`}>
                  Connected to {platformLabel}
                </span>
              ) : (
                <a 
                  href="https://www.si.edu/openaccess" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline text-gray-600"
                >
                  Smithsonian Open Access
                </a>
              )}
              <span>•</span>
              <span>Free shipping on orders $100+</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
