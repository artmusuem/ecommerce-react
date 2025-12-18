import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { sizes } from '../../data/products'
import { getResizedImage, IMAGE_SIZES } from '../../utils/images'
import type { ProductCardProps } from '../../types'

export default function ProductCard({ product, index, artistId }: ProductCardProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [imageError, setImageError] = useState(false)

  const lowestPrice = sizes[0].basePrice

  const thumbnailSrc = getResizedImage(product.image, IMAGE_SIZES.thumbnail)
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

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight > 0) {
      setIsLoaded(true)
    }
  }, [useFallback])

  return (
    <Link
      to={`/product/${encodeURIComponent(product.id)}`}
      state={{ product, artistId }}
      className="group block rounded-xl overflow-hidden bg-white card-lift fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden relative bg-gray-100">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-400">
              Unavailable
            </span>
          </div>
        ) : (
          <>
            <img
              ref={imgRef}
              src={useFallback ? fallbackSrc : thumbnailSrc}
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={handleImageError}
            />
            
            {/* Quick view overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-800">
                View Print
              </span>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h2 className="font-medium text-sm leading-snug line-clamp-2 mb-1 text-gray-800">
          {product.title}
        </h2>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary">
            ${lowestPrice}
          </span>
          <span className="text-xs text-gray-400">
            {product.year}
          </span>
        </div>
      </div>
    </Link>
  )
}
