import { useState } from 'react'
import { Link } from 'react-router'
import { useProducts } from '../../context/ProductsContext'
import { useCartDispatch } from '../../context/CartContext'
import { getResizedImage } from '../../utils/images'
import type { Product } from '../../types'

interface MoreFromArtistProps {
  /** Current product's artist name */
  artist: string
  /** Current product ID (to exclude from suggestions) */
  currentProductId: string
}

/**
 * MoreFromArtist Carousel
 *
 * Shows other works by the same artist with < > navigation.
 * Displayed below each cart item to encourage discovery.
 *
 * @example
 * ```tsx
 * <MoreFromArtist artist="Winslow Homer" currentProductId="123" />
 * ```
 */
export function MoreFromArtist({ artist, currentProductId }: MoreFromArtistProps) {
  const products = useProducts()
  const dispatch = useCartDispatch()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter to products by same artist, excluding current product
  const artistProducts = products.filter(
    (p: Product) => p.artist === artist && p.id !== currentProductId
  )

  // Don't render if no other products by this artist
  if (artistProducts.length === 0) return null

  const currentProduct = artistProducts[currentIndex]
  const totalProducts = artistProducts.length

  const handlePrev = () => {
    setCurrentIndex((i) => (i === 0 ? totalProducts - 1 : i - 1))
  }

  const handleNext = () => {
    setCurrentIndex((i) => (i === totalProducts - 1 ? 0 : i + 1))
  }

  const thumbnailSrc = getResizedImage(currentProduct.image, 80)

  return (
    <div className="mt-3 pt-3 border-t border-ink-100">
      {/* Header with artist name and navigation */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-ink-500 font-medium">
          More from {artist}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="w-6 h-6 flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded transition-colors"
            aria-label="Previous artwork"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs text-ink-400 min-w-[40px] text-center">
            {currentIndex + 1}/{totalProducts}
          </span>
          <button
            onClick={handleNext}
            className="w-6 h-6 flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded transition-colors"
            aria-label="Next artwork"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product preview card */}
      <Link
        to={`/product/${encodeURIComponent(currentProduct.id)}`}
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-ink-50 transition-colors group"
      >
        {/* Thumbnail with frame */}
        <div
          className="w-12 h-12 flex-shrink-0 overflow-hidden"
          style={{
            border: '2px solid #1a1a1a',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
          }}
        >
          <img
            src={thumbnailSrc}
            alt={currentProduct.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-800 line-clamp-1 group-hover:text-ink-900">
            {currentProduct.title}
          </p>
          <p className="text-xs text-ink-500">
            From ${currentProduct.priceRange?.minPrice
              ? parseFloat(currentProduct.priceRange.minPrice).toFixed(0)
              : '45'}
          </p>
        </div>

        {/* Arrow indicator */}
        <svg
          className="w-4 h-4 text-ink-300 group-hover:text-ink-500 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
