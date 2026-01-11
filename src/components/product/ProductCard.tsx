import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { getResizedImage, IMAGE_SIZES } from '../../utils/images'
import type { Product } from '../../types'

// Extend img attributes to include fetchpriority
interface ExtendedImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fetchpriority?: 'high' | 'low' | 'auto'
}

interface ProductCardProps {
  product: Product
  priority?: boolean // High priority = eager load (above fold)
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  // Priority images start visible (no opacity transition = faster LCP)
  const [isLoaded, setIsLoaded] = useState(priority)
  const [useFallback, setUseFallback] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Get price from Shopify priceRange or fallback
  const price = product.priceRange?.minPrice
    ? parseFloat(product.priceRange.minPrice)
    : 45

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

  // Check if image is already cached
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight > 0) {
      setIsLoaded(true)
    }
  }, [useFallback])

  const imgProps: ExtendedImgProps = {
    src: useFallback ? fallbackSrc : thumbnailSrc,
    alt: product.title,
    className: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
    loading: priority ? "eager" : "lazy",
    fetchpriority: priority ? "high" : "auto",
    decoding: "async",
    onLoad: () => setIsLoaded(true),
    onError: handleImageError,
  }

  return (
    <Link
      to={`/product/${encodeURIComponent(product.id)}`}
      state={{ product }}
      className="group block rounded-xl overflow-hidden card-lift bg-white"
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden relative bg-gray-100">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-400">Unavailable</span>
          </div>
        ) : (
          <>
            {/* Skeleton placeholder - shows until image loads */}
            {!isLoaded && (
              <div className="absolute inset-0 skeleton-pulse" />
            )}

            {/* Image - hidden until loaded, then shown instantly */}
            <img
              ref={imgRef}
              {...imgProps}
              style={{ opacity: isLoaded ? 1 : 0 }}
            />

            {/* Quick view overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
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
            From ${price.toFixed(0)}
          </span>
          <span className="text-xs text-gray-400">
            {product.artist}
          </span>
        </div>
      </div>
    </Link>
  )
}
