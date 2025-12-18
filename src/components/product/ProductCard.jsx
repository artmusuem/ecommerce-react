import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { sizes } from '../../data/products'
import { getResizedImage, IMAGE_SIZES } from '../../utils/images'

export default function ProductCard({ product, index, artistId }) {
  const imgRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [imageError, setImageError] = useState(false)
  const lowestPrice = sizes[0].basePrice

  // Single consistent thumbnail URL - same URL used on Product page = cache hit
  const thumbnailSrc = getResizedImage(product.image, IMAGE_SIZES.thumbnail)
  
  // Fallback directly to Smithsonian if Cloudinary fails
  const fallbackSrc = product.image.includes('ids.si.edu') 
    ? `${product.image}${product.image.includes('?') ? '&' : '?'}max=${IMAGE_SIZES.thumbnail}`
    : product.image

  const handleImageError = () => {
    if (!useFallback) {
      setUseFallback(true)
    } else {
      setImageError(true)
    }
  }

  // Check if already loaded (cached)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight > 0) {
      setIsLoaded(true)
    }
  }, [useFallback])

  return (
    <Link
      to={`/product/${encodeURIComponent(product.id)}`}
      state={{ product, artistId }}
      className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="aspect-square bg-stone-200 overflow-hidden relative">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <span className="text-stone-400 text-sm">Image unavailable</span>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={useFallback ? fallbackSrc : thumbnailSrc}
            alt={product.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
          />
        )}
      </div>
      <div className="p-4">
        <h2 className="font-display font-medium text-lg text-stone-800 group-hover:text-stone-600 transition-colors line-clamp-2 leading-tight">
          {product.title}
        </h2>
        <p className="text-stone-500 text-sm mt-1">{product.artist}</p>
        <p className="text-stone-400 text-xs mt-1">{product.year}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-stone-800 font-semibold">From ${lowestPrice}</span>
          <span className="text-xs text-stone-400 group-hover:text-stone-600 transition-colors">
            View options →
          </span>
        </div>
      </div>
    </Link>
  )
}
