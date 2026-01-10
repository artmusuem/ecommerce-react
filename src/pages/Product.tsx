import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { artists, transformArtwork } from '../data/products'
import { fetchShopifyProduct, shopifyConfig } from '../data/shopify-api'
import { useCartDispatch } from '../context/CartContext'
import { getResizedImage, IMAGE_SIZES, preloadImage } from '../utils/images'
import type { Product as ProductType, RawArtwork, ProductRouterState, ProductVariant } from '../types'

// Frame color mapping for preview
const frameColors: Record<string, string> = {
  'Unframed': '#f5f5f5',
  'Black Frame': '#1a1a1a',
  'White Frame': '#ffffff',
  'Natural Wood': '#c4a574',
}

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const state = location.state as ProductRouterState | null
  const routerProduct = state?.product
  const routerArtistId = state?.artistId

  // State for fetched product (when no router state)
  const [fetchedProduct, setFetchedProduct] = useState<ProductType | null>(null)
  const [fetchedArtistId, setFetchedArtistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(!routerProduct)
  const [notFound, setNotFound] = useState(false)

  // Use router state if available, otherwise use fetched
  const product = routerProduct || fetchedProduct
  const artistId = routerArtistId || fetchedArtistId

  const dispatch = useCartDispatch()

  // Get options from Shopify product
  const sizeOption = product?.options?.find(o => o.name === 'Size')
  const frameOption = product?.options?.find(o => o.name === 'Frame')
  const sizes = sizeOption?.values || ['8×10']
  const frames = frameOption?.values || ['Unframed']

  // Read selected options from state (passed from cart/checkout links)
  const initialSize = state?.selectedSizeId || sizes[0]
  const initialFrame = state?.selectedFrameId || frames[0]

  const [selectedSize, setSelectedSize] = useState(initialSize)
  const [selectedFrame, setSelectedFrame] = useState(initialFrame)
  const [added, setAdded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fullImageReady, setFullImageReady] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  const previewImgRef = useRef<HTMLImageElement>(null)

  // Find the selected variant based on size and frame
  const selectedVariant = useMemo((): ProductVariant | undefined => {
    if (!product?.variants) return undefined
    return product.variants.find(v =>
      v.selectedOptions.some(o => o.name === 'Size' && o.value === selectedSize) &&
      v.selectedOptions.some(o => o.name === 'Frame' && o.value === selectedFrame)
    )
  }, [product?.variants, selectedSize, selectedFrame])

  const price = selectedVariant ? parseFloat(selectedVariant.price) : 0

  // Fetch product by ID (prefer Shopify, fallback to JSON)
  useEffect(() => {
    if (routerProduct?.variants && routerProduct.variants.length > 0) {
      // Router product has variants, use it
      setLoading(false)
      return
    }

    async function fetchProductById() {
      setLoading(true)
      setNotFound(false)

      const decodedId = decodeURIComponent(id || '')

      // Try Shopify first if configured
      if (shopifyConfig.isConfigured) {
        try {
          const shopifyProduct = await fetchShopifyProduct(decodedId)
          if (shopifyProduct) {
            setFetchedProduct(shopifyProduct)
            setFetchedArtistId(shopifyProduct.artist.toLowerCase().replace(/\s+/g, '-'))
            setLoading(false)
            return
          }
        } catch (err) {
          console.error('Shopify fetch error:', err)
        }
      }

      // Fallback to JSON files
      for (const artist of artists) {
        try {
          const response = await fetch(artist.file)
          if (!response.ok) continue

          const data: { artworks: RawArtwork[] } = await response.json()
          const artworks = data.artworks
            .filter(art => art.image && art.title)
            .map((art, i) => transformArtwork(art, i))

          // Find matching product
          const found = artworks.find(art => art.id === decodedId)
          if (found) {
            setFetchedProduct(found)
            setFetchedArtistId(artist.id)
            setLoading(false)
            return
          }
        } catch (err) {
          console.error(`Error loading ${artist.file}:`, err)
        }
      }

      // Not found
      setNotFound(true)
      setLoading(false)
    }

    fetchProductById()
  }, [id, routerProduct])

  // Update selections when navigating from cart with different options
  useEffect(() => {
    if (state?.selectedSizeId) {
      setSelectedSize(state.selectedSizeId)
    }
    if (state?.selectedFrameId) {
      setSelectedFrame(state.selectedFrameId)
    }
  }, [state?.selectedSizeId, state?.selectedFrameId])

  // Check if image is already cached/complete
  useEffect(() => {
    if (previewImgRef.current?.complete && previewImgRef.current?.naturalHeight > 0) {
      setImageLoaded(true)
    }
  }, [useFallback, product?.image])

  // Fallback directly to Smithsonian if Cloudinary fails
  const getFallbackUrl = useCallback((size: number): string => {
    if (!product?.image?.includes('ids.si.edu')) return product?.image || ''
    return `${product.image}${product.image.includes('?') ? '&' : '?'}max=${size}`
  }, [product?.image])

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Preload full resolution image for lightbox
  useEffect(() => {
    if (product?.image) {
      setImageLoaded(false)
      setFullImageReady(false)
      setUseFallback(false)
      
      preloadImage(getResizedImage(product.image, IMAGE_SIZES.full))
        .then(() => setFullImageReady(true))
        .catch(() => {
          preloadImage(getFallbackUrl(IMAGE_SIZES.full))
            .then(() => setFullImageReady(true))
            .catch(() => {})
        })
    }
  }, [product?.image, getFallbackUrl])

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <svg 
            className="animate-spin h-10 w-10 mx-auto mb-4 text-primary" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500">Loading artwork...</p>
        </div>
      </main>
    )
  }

  if (!product || notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
            <svg 
              className="w-8 h-8 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-2 text-gray-800">
            Product not found
          </h1>
          <p className="mb-6 text-gray-500">
            This artwork may have been moved or is no longer available.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 font-medium transition-colors text-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Return to gallery
          </Link>
        </div>
      </main>
    )
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      console.error('No variant selected')
      return
    }
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        variantId: selectedVariant.id,
        sizeId: selectedSize,
        frameId: selectedFrame,
        title: product.title,
        artist: product.artist,
        image: product.image,
        price: parseFloat(selectedVariant.price)
      }
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const frameColor = frameColors[selectedFrame] || '#1a1a1a'

  // Generate direct Smithsonian object URL
  const titleSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const smithsonianUrl = product.accession_number 
    ? `https://www.si.edu/object/${titleSlug}:${product.accession_number}`
    : `https://www.si.edu/search?edan_q=${encodeURIComponent(product.title)}&edan_fq=unit_code:SAAM`

  return (
    <main className="min-h-screen py-6 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <Link 
            to={artistId ? `/?artist=${artistId}` : '/'}
            className="inline-flex items-center gap-1 text-sm transition-colors text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to gallery
          </Link>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Image */}
          <div>
            {/* Frame Preview */}
            <div
              className="frame-preview relative transition-all duration-300 cursor-zoom-in group mx-auto w-fit rounded-lg overflow-hidden p-5"
              style={{
                backgroundColor: frameColor,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.2)'
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <div className="bg-white p-1 shadow-inner relative">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 overflow-hidden bg-gray-100">
                  {/* Fast thumbnail (400px) - shows immediately */}
                  <img
                    src={useFallback ? getFallbackUrl(IMAGE_SIZES.thumbnail) : getResizedImage(product.image, IMAGE_SIZES.thumbnail)}
                    alt=""
                    aria-hidden="true"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  
                  {/* Preview image (800px) - loads on top */}
                  <img
                    ref={previewImgRef}
                    src={useFallback ? getFallbackUrl(IMAGE_SIZES.preview) : getResizedImage(product.image, IMAGE_SIZES.preview)}
                    alt={product.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      if (!useFallback) setUseFallback(true)
                    }}
                  />
                  
                  {/* Zoom hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs mt-3 text-gray-400">
              Click image to enlarge
              {fullImageReady && (
                <span className="ml-2 text-green-600">• HD ready</span>
              )}
            </p>
          </div>
          {/* Right Column: Title, Options, Add to Cart */}
          <div>
            {/* Title & Artist */}
            <h1 className="text-2xl md:text-3xl font-display font-semibold mb-1 text-gray-900">
              {product.title}
            </h1>
            <p className="text-lg mb-4 text-gray-600">
              {product.artist}
            </p>
            
            {/* Price */}
            <p className="text-3xl font-display font-semibold mb-6 text-primary">
              ${price.toFixed(0)}
            </p>

            {/* Options Card */}
            <div className="rounded-xl p-5 mb-6 bg-white border border-gray-200">
              {/* Size Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Print Size
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg cursor-pointer text-base font-medium transition-colors border-gray-200 bg-white text-gray-800 focus:border-primary focus:outline-none"
                >
                  {sizes.map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frame Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Frame Style
                </label>
                <select
                  value={selectedFrame}
                  onChange={(e) => setSelectedFrame(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg cursor-pointer text-base font-medium transition-colors border-gray-200 bg-white text-gray-800 focus:border-primary focus:outline-none"
                >
                  {frames.map(frame => (
                    <option key={frame} value={frame}>
                      {frame}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frame Color Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded border border-gray-300 shadow-inner"
                  style={{ backgroundColor: frameColor }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {selectedFrame}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedSize} print
                  </p>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all ${
                added
                  ? 'bg-green-600'
                  : !selectedVariant
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {added ? '✓ Added to Cart' : !selectedVariant ? 'Select Options' : 'Add to Cart'}
            </button>

            <p className="text-center text-xs mt-3 text-gray-400">
              Free shipping on orders over $100 • Ships in 5-7 days
            </p>
          </div>
        </div>

        {/* Details Section - Below the fold */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Artwork Details */}
            <div>
              <h2 className="text-lg font-display font-semibold mb-3 text-gray-800">
                Artwork Details
              </h2>
              <div className="text-sm mb-4 text-gray-500">
                {product.year && <span>{product.year}</span>}
                {product.medium && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{product.medium}</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed text-gray-600">
                {product.description}
              </p>
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* About this print */}
            <div>
              <h2 className="text-lg font-display font-semibold mb-3 text-gray-800">
                About This Print
              </h2>
              <p className="text-sm leading-relaxed mb-4 text-gray-600">
                This artwork is from the Smithsonian American Art Museum collection and is 
                in the public domain. Our prints are produced on archival cotton rag paper 
                using museum-grade pigment inks, ensuring your print will last for generations.
              </p>
              <a 
                href={smithsonianUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm underline transition-colors text-gray-500 hover:text-gray-700"
              >
                View original on Smithsonian
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={useFallback ? getFallbackUrl(IMAGE_SIZES.full) : getResizedImage(product.image, IMAGE_SIZES.full)}
            alt={product.title}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Click outside image or ✕ to close
          </p>
        </div>
      )}
    </main>
  )
}
