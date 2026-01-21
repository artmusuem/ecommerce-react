import { useState, useEffect, useRef, ImgHTMLAttributes, memo } from 'react'
import { Link } from 'react-router'
import { getResizedImage, getSrcSet, getSizes, IMAGE_SIZES } from '../../utils/images'
import type { Product } from '../../types'

// Extend img attributes to include fetchpriority
interface ExtendedImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fetchpriority?: 'high' | 'low' | 'auto'
}

/**
 * ProductCard props
 * @property product - The product data to display
 * @property priority - Whether to load the image eagerly (for above-fold content)
 */
interface ProductCardProps {
  product: Product
  priority?: boolean // High priority = eager load (above fold)
}

/**
 * ProductCard Component
 *
 * Displays a product in the grid with optimized image loading.
 *
 * Features:
 * - Responsive images with srcset for proper resolution
 * - Lazy loading for below-fold images
 * - Skeleton placeholder during load
 * - Cloudinary CDN optimization with fallback
 * - Memoized to prevent unnecessary re-renders
 *
 * @example
 * ```tsx
 * <ProductCard product={product} priority={index < 4} />
 * ```
 */
function ProductCardComponent({ product, priority = false }: ProductCardProps) {
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

  // Generate srcset for responsive images
  const imageSrcSet = !useFallback ? getSrcSet(product.image, [200, 400, 600, 800]) : undefined
  const imageSizes = !useFallback ? getSizes({
    '(max-width: 640px)': '50vw',
    '(max-width: 1024px)': '33vw',
    'default': '25vw'
  }) : undefined

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

  // Priority images: no fade (preserves LCP). Lazy images: smooth fade-in.
  const imageClasses = priority
    ? 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
    : `w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 image-reveal ${isLoaded ? 'loaded' : ''}`

  const imgProps: ExtendedImgProps = {
    src: useFallback ? fallbackSrc : thumbnailSrc,
    srcSet: imageSrcSet,
    sizes: imageSizes,
    alt: product.title,
    className: imageClasses,
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
      data-testid="product-card"
    >
      {/* Image Container with Black Frame */}
      <div className="aspect-square overflow-hidden relative bg-paper-100 p-3">
        {/* Black frame border */}
        <div className="relative w-full h-full border-[6px] border-ink-900 shadow-lg">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-400">Unavailable</span>
            </div>
          ) : (
            <>
              {/* Skeleton placeholder - shows until image loads */}
              {!isLoaded && (
                <div className="absolute inset-0 skeleton-pulse" />
              )}

              {/* Image - priority images show instantly, lazy images fade in via CSS */}
              <img
                ref={imgRef}
                {...imgProps}
                data-testid="product-image"
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
      </div>

      {/* Info */}
      <div className="p-4">
        <h2
          className="font-medium text-sm leading-snug line-clamp-2 mb-2 text-gray-800"
          data-testid="product-title"
        >
          {product.title}
        </h2>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary" data-testid="product-price">
            From ${price.toFixed(0)}
          </span>
          <span className="text-xs text-gray-500" data-testid="product-artist">
            {product.artist}
          </span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Memoized ProductCard
 *
 * Uses shallow comparison on product.id to prevent re-renders
 * when parent component updates but product data hasn't changed.
 */
const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  // Only re-render if product ID or priority changes
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.priority === nextProps.priority
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
