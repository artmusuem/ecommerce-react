/**
 * Star Rating Component
 *
 * Displays a visual star rating with support for:
 * - Full stars
 * - Half stars
 * - Empty stars
 * - Accessible labels
 *
 * @example
 * // Display rating
 * <StarRating rating={4.5} />
 *
 * // Compact size
 * <StarRating rating={5} size="sm" />
 *
 * // With review count
 * <StarRating rating={4.8} reviewCount={127} />
 */

interface StarRatingProps {
  /** Rating value (1-5) */
  rating: number
  /** Maximum stars (default 5) */
  max?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show numeric rating */
  showValue?: boolean
  /** Review count to display */
  reviewCount?: number
  /** Additional CSS classes */
  className?: string
}

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  reviewCount,
  className = '',
}: StarRatingProps) {
  // Clamp rating between 0 and max
  const clampedRating = Math.min(Math.max(0, rating), max)

  // Size configurations
  const sizeConfig = {
    sm: { star: 'w-3.5 h-3.5', text: 'text-xs', gap: 'gap-0.5' },
    md: { star: 'w-4 h-4', text: 'text-sm', gap: 'gap-0.5' },
    lg: { star: 'w-5 h-5', text: 'text-base', gap: 'gap-1' },
  }

  const config = sizeConfig[size]

  return (
    <div
      className={`flex items-center ${config.gap} ${className}`}
      role="img"
      aria-label={`${clampedRating.toFixed(1)} out of ${max} stars${reviewCount ? `, ${reviewCount} reviews` : ''}`}
    >
      <div className={`flex ${config.gap}`}>
        {Array.from({ length: max }).map((_, index) => {
          const fillPercentage = Math.min(100, Math.max(0, (clampedRating - index) * 100))

          return (
            <span key={index} className="relative">
              {/* Background star (empty) */}
              <svg
                className={`${config.star} text-gray-200`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {/* Foreground star (filled) with clip path for partial fills */}
              <svg
                className={`${config.star} text-yellow-400 absolute inset-0`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
                style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          )
        })}
      </div>

      {showValue && (
        <span className={`${config.text} font-medium text-gray-700 ml-1`}>
          {clampedRating.toFixed(1)}
        </span>
      )}

      {typeof reviewCount === 'number' && (
        <span className={`${config.text} text-gray-500 ml-1`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}

/**
 * Interactive star rating input for forms
 */
interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
  size?: 'md' | 'lg'
  disabled?: boolean
}

export function StarRatingInput({
  value,
  onChange,
  size = 'md',
  disabled = false,
}: StarRatingInputProps) {
  const config = size === 'lg'
    ? { star: 'w-8 h-8', gap: 'gap-1' }
    : { star: 'w-6 h-6', gap: 'gap-0.5' }

  return (
    <div
      className={`flex ${config.gap}`}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          className={`focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded-sm transition-transform ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'
          }`}
          role="radio"
          aria-checked={value >= star}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <svg
            className={`${config.star} ${value >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default StarRating
