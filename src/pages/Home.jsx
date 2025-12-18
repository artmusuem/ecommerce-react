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

  // Update URL when artist changes
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

  return (
    <main className="max-w-7xl mx-auto px-4 py-4">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-stone-800 mb-2">
          Museum-Quality Prints
        </h2>
        <p className="text-sm md:text-base text-stone-600 max-w-xl mx-auto mb-4">
          Masterpieces from the Smithsonian American Art Museum. 
          Professionally printed and custom framed.
        </p>

        {/* Artist Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <label htmlFor="artist-select" className="text-stone-600 text-sm">
            Browse by Artist:
          </label>
          <select
            id="artist-select"
            value={selectedArtist}
            onChange={(e) => handleArtistChange(e.target.value)}
            className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-stone-800 text-sm shadow-sm hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent cursor-pointer min-w-[200px]"
          >
            {artists.map(artist => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Collection Header */}
      {currentArtist && (
        <div className="mb-4 pb-3 border-b border-stone-200 flex items-baseline justify-between">
          <h3 className="text-xl font-display text-stone-800">
            {currentArtist.name}
          </h3>
          <p className="text-stone-400 text-sm">
            {products.length} works
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-square image-loading" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-stone-200 rounded w-3/4 image-loading" />
                <div className="h-4 bg-stone-100 rounded w-1/2 image-loading" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => setSelectedArtist(selectedArtist)}
            className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="text-center py-12">
          <p className="text-stone-500">No artwork found for this artist.</p>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-16 text-center text-sm text-stone-500 border-t border-stone-200 pt-8">
        <p>
          All artwork sourced from the{' '}
          <a 
            href="https://www.si.edu/openaccess" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-stone-700"
          >
            Smithsonian Open Access
          </a>
          {' '}collection. Public domain, free to use.
        </p>
      </div>
    </main>
  )
}
