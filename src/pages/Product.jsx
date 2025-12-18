import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { sizes, frames, calculatePrice } from '../data/products'
import { useCartDispatch } from '../context/CartContext'
import { getResizedImage, IMAGE_SIZES, preloadImage } from '../utils/images'

export default function Product() {
  const { id } = useParams()
  const location = useLocation()
  const product = location.state?.product
  const artistId = location.state?.artistId
  const dispatch = useCartDispatch()
  
  const [selectedSize, setSelectedSize] = useState(sizes[0].id)
  const [selectedFrame, setSelectedFrame] = useState(frames[0].id)
  const [added, setAdded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fullImageReady, setFullImageReady] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const previewImgRef = useRef(null)

  // Check if image is already cached/complete
  useEffect(() => {
    if (previewImgRef.current?.complete && previewImgRef.current?.naturalHeight > 0) {
      setImageLoaded(true)
    }
  }, [useFallback, product?.image])

  // Fallback directly to Smithsonian if Cloudinary fails
  const getFallbackUrl = (size) => {
    if (!product?.image?.includes('ids.si.edu')) return product?.image
    return `${product.image}${product.image.includes('?') ? '&' : '?'}max=${size}`
  }

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
      
      // Preload full res in background
      preloadImage(getResizedImage(product.image, IMAGE_SIZES.full))
        .then(() => setFullImageReady(true))
        .catch(() => {
          // Try fallback
          preloadImage(getFallbackUrl(IMAGE_SIZES.full))
            .then(() => setFullImageReady(true))
            .catch(() => {})
        })
    }
  }, [product?.image])

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display text-stone-800 mb-4">Product not found</h1>
        <p className="text-stone-500 mb-6">This artwork may have been moved or is no longer available.</p>
        <Link 
          to="/" 
          className="inline-flex items-center text-stone-600 hover:text-stone-800 transition-colors"
        >
          ← Return to gallery
        </Link>
      </main>
    )
  }

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        sizeId: selectedSize,
        frameId: selectedFrame,
        title: product.title,
        artist: product.artist,
        image: product.image
      }
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const price = calculatePrice(selectedSize, selectedFrame)
  const frame = frames.find(f => f.id === selectedFrame)

  // Generate direct Smithsonian object URL
  const titleSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const smithsonianUrl = product.accession_number 
    ? `https://www.si.edu/object/${titleSlug}:${product.accession_number}`
    : `https://www.si.edu/search?edan_q=${encodeURIComponent(product.title)}&edan_fq=unit_code:SAAM`

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <Link 
          to={artistId ? `/?artist=${artistId}` : '/'}
          className="text-stone-500 hover:text-stone-700 transition-colors inline-flex items-center gap-1 text-sm"
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
          {/* Framed Image Preview */}
          <div 
            className="relative transition-all duration-300 cursor-zoom-in group mx-auto w-fit"
            style={{ 
              padding: '20px',
              backgroundColor: frame?.color,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={() => setLightboxOpen(true)}
          >
            <div className="bg-white p-1 shadow-inner relative">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-stone-200 overflow-hidden">
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
          <p className="text-center text-xs text-stone-400 mt-3">
            Click image to enlarge
            {fullImageReady && <span className="text-green-600 ml-2">• HD ready</span>}
          </p>
        </div>

        {/* Right Column: Title, Options, Add to Cart */}
        <div>
          {/* Title & Artist */}
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-stone-800 mb-1">
            {product.title}
          </h1>
          <p className="text-lg text-stone-600 mb-3">{product.artist}</p>
          
          {/* Price */}
          <p className="text-3xl font-display font-semibold text-stone-800 mb-6">${price}</p>

          {/* Size Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Print Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedSize === size.id
                      ? 'border-stone-800 bg-stone-800 text-white'
                      : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-white'
                  }`}
                >
                  {size.name}
                  <span className={`block text-xs mt-0.5 ${
                    selectedSize === size.id ? 'text-stone-300' : 'text-stone-400'
                  }`}>
                    ${size.basePrice}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Frame Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Frame Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frames.map((frameOption) => (
                <button
                  key={frameOption.id}
                  onClick={() => setSelectedFrame(frameOption.id)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedFrame === frameOption.id
                      ? 'border-stone-800 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <span 
                    className="w-5 h-5 rounded border border-stone-300 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: frameOption.color }}
                  />
                  <span className="flex-1 text-left">
                    <span className="block text-stone-800 text-sm">{frameOption.name}</span>
                    {frameOption.priceAdd > 0 && (
                      <span className="text-xs text-stone-400">+${frameOption.priceAdd}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              added
                ? 'bg-green-600 text-white'
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>

          <p className="text-center text-xs text-stone-400 mt-3">
            Free shipping on orders over $100 • Ships in 5-7 days
          </p>
        </div>
      </div>

      {/* Details Section - Below the fold */}
      <div className="mt-12 border-t border-stone-200 pt-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Artwork Details */}
          <div>
            <h2 className="text-lg font-display font-semibold text-stone-800 mb-3">Artwork Details</h2>
            <div className="text-sm text-stone-500 mb-4">
              {product.year && <span>{product.year}</span>}
              {product.medium && (
                <>
                  <span className="mx-2">•</span>
                  <span>{product.medium}</span>
                </>
              )}
            </div>
            <p className="text-stone-600 leading-relaxed">
              {product.description}
            </p>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* About this print */}
          <div>
            <h2 className="text-lg font-display font-semibold text-stone-800 mb-3">About This Print</h2>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              This artwork is from the Smithsonian American Art Museum collection and is 
              in the public domain. Our prints are produced on archival cotton rag paper 
              using museum-grade pigment inks, ensuring your print will last for generations.
            </p>
            <a 
              href={smithsonianUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-500 hover:text-stone-700 underline inline-flex items-center gap-1 text-sm"
            >
              View original on Smithsonian
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
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
