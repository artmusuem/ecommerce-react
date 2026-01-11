import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchCollections,
  fetchCollectionProducts,
  fetchShopifyProducts,
  shopifyConfig
} from '../data/shopify-api'
import ProductCard from '../components/product/ProductCard'
import type { Product, Collection } from '../types'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const collectionParam = searchParams.get('collection')

  // State
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(collectionParam)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load collections on mount
  useEffect(() => {
    async function loadCollections() {
      if (!shopifyConfig.isConfigured) return

      try {
        const fetchedCollections = await fetchCollections()
        setCollections(fetchedCollections)
      } catch (err) {
        console.error('Error loading collections:', err)
      }
    }

    loadCollections()
  }, [])

  // Load products when collection changes
  useEffect(() => {
    async function loadProducts() {
      if (!shopifyConfig.isConfigured) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let fetchedProducts: Product[]

        if (selectedCollection) {
          // Fetch products from selected collection
          fetchedProducts = await fetchCollectionProducts(selectedCollection)
        } else {
          // Fetch all products
          fetchedProducts = await fetchShopifyProducts()
        }

        setProducts(fetchedProducts)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Failed to load artwork. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [selectedCollection])

  const handleCollectionChange = (handle: string | null) => {
    setSelectedCollection(handle)
    if (handle) {
      setSearchParams({ collection: handle })
    } else {
      setSearchParams({})
    }
  }

  const currentCollection = collections.find(c => c.handle === selectedCollection)

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Compact Toolbar */}
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Title/Collection info */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
                  {currentCollection?.title || 'All Prints'}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentCollection?.description || 'Museum-quality prints from the Smithsonian'}
                </p>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-primary text-white">
                {products.length} prints
              </span>
            </div>

            {/* Right: Collection selector */}
            {collections.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  Artist:
                </span>
                <select
                  value={selectedCollection || ''}
                  onChange={(e) => handleCollectionChange(e.target.value || null)}
                  className="px-3 py-2 text-sm font-medium rounded-lg border-2 cursor-pointer transition-colors min-w-[180px] border-gray-200 bg-white text-gray-800 focus:border-primary focus:outline-none"
                >
                  <option value="">All Artists</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.handle}>
                      {collection.title} ({collection.productsCount})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              onClick={() => handleCollectionChange(selectedCollection)}
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
                priority={index < 6}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">
              No artwork found{currentCollection ? ` for ${currentCollection.title}` : ''}.
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
                  Museum-quality prints from the Smithsonian
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a
                href="https://www.si.edu/openaccess"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-gray-600"
              >
                Smithsonian Open Access
              </a>
              <span>•</span>
              <span>Free shipping on orders $100+</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
