import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { artists, transformArtwork } from '../data/products'
import ProductCard from '../components/product/ProductCard'
import type { Product, RawArtwork } from '../types'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const artistParam = searchParams.get('artist')
  const [selectedArtist, setSelectedArtist] = useState(
    artists.find(a => a.id === artistParam)?.id || artists[0].id
  )

  const handleArtistChange = (artistId: string) => {
    setSelectedArtist(artistId)
    setSearchParams({ artist: artistId })
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadArtwork() {
      setLoading(true)
      setError(null)
      
      const artist = artists.find(a => a.id === selectedArtist)
      if (!artist) return
      
      try {
        const response = await fetch(artist.file)
        if (!response.ok) throw new Error('Failed to load artwork')
        
        const data: { artworks: RawArtwork[] } = await response.json()
        const transformed = data.artworks
          .filter(art => art.image && art.title)
          .map((art, i) => transformArtwork(art, i))
        
        setProducts(transformed)
      } catch (err) {
        console.error('Error loading artwork:', err)
        setError('Failed to load artwork. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    loadArtwork()
  }, [selectedArtist])

  const currentArtist = artists.find(a => a.id === selectedArtist)

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Compact Toolbar */}
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Artist info */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
                  {currentArtist?.name}
                </h1>
                <p className="text-sm text-gray-500">
                  American, {currentArtist?.dates}
                </p>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-primary text-white">
                {products.length} prints
              </span>
            </div>

            {/* Right: Artist selector */}
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
              onClick={() => setSelectedArtist(selectedArtist)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State - only while fetching JSON */}
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

        {/* Product Grid - show immediately after JSON loads */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                artistId={selectedArtist}
                priority={index < 6}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">
              No artwork found for this artist.
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
