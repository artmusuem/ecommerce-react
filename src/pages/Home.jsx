import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { artists, transformArtwork } from '../data/products'
import ProductCard from '../components/product/ProductCard'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const artistParam = searchParams.get('artist')
  const [selectedArtist, setSelectedArtist] = useState(
    artists.find(a => a.id === artistParam)?.id || artists[0].id
  )

  const handleArtistChange = (artistId) => {
    setSelectedArtist(artistId)
    setSearchParams({ artist: artistId })
  }

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadArtwork() {
      setLoading(true)
      setError(null)
      
      const artist = artists.find(a => a.id === selectedArtist)
      if (!artist) return
      
      try {
        const response = await fetch(artist.file)
        if (!response.ok) throw new Error('Failed to load artwork')
        
        const data = await response.json()
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

  // Artist life dates
  const artistDates = {
    'winslow-homer': '1836–1910',
    'edward-hopper': '1882–1967',
    'georgia-okeeffe': '1887–1986',
    'mary-cassatt': '1844–1926',
    'thomas-cole': '1801–1848',
    'frederic-remington': '1861–1909'
  }

  return (
    <main style={{ backgroundColor: 'var(--color-gray-50)', minHeight: '100vh' }}>
      {/* Compact Toolbar */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: 'var(--color-white)',
          borderColor: 'var(--color-gray-200)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Artist info */}
            <div className="flex items-center gap-4">
              <div>
                <h1 
                  className="text-xl md:text-2xl font-display font-semibold"
                  style={{ color: 'var(--color-gray-900)' }}
                >
                  {currentArtist?.name}
                </h1>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-gray-500)' }}
                >
                  American, {artistDates[selectedArtist]}
                </p>
              </div>
              <span 
                className="hidden sm:inline-flex px-2.5 py-1 text-xs font-medium rounded-full"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                {products.length} prints
              </span>
            </div>

            {/* Right: Artist selector */}
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--color-gray-500)' }}
              >
                Artist:
              </span>
              <select
                value={selectedArtist}
                onChange={(e) => handleArtistChange(e.target.value)}
                className="px-3 py-2 text-sm font-medium rounded-lg border-2 cursor-pointer transition-colors min-w-[180px]"
                style={{ 
                  borderColor: 'var(--color-gray-200)',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-gray-800)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-gray-200)'}
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
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--color-white)' }}
              >
                <div className="aspect-square image-loading" />
                <div className="p-3 space-y-2">
                  <div className="h-4 rounded w-3/4 image-loading" />
                  <div className="h-3 rounded w-1/2 image-loading" />
                </div>
              </div>
            ))}
          </div>
        )}

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

        {/* Product Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
                artistId={selectedArtist}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p style={{ color: 'var(--color-gray-500)' }}>
              No artwork found for this artist.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer 
        className="border-t mt-8"
        style={{ 
          backgroundColor: 'var(--color-white)',
          borderColor: 'var(--color-gray-200)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                  <rect x="6" y="6" width="12" height="12" rx="1" stroke="white" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: 'var(--color-gray-800)' }}
                >
                  Gallery Store
                </span>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--color-gray-500)' }}
                >
                  Museum-quality prints from the Smithsonian
                </p>
              </div>
            </div>

            {/* Right */}
            <div 
              className="flex items-center gap-6 text-sm"
              style={{ color: 'var(--color-gray-500)' }}
            >
              <a 
                href="https://www.si.edu/openaccess" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: 'var(--color-gray-600)' }}
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
