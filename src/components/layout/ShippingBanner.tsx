/**
 * Free Shipping Promotional Banner
 *
 * Displays at the top of the page to drive conversions.
 * Configurable threshold via constant.
 *
 * @example
 * <ShippingBanner />
 */

// Configurable threshold - update this to change the free shipping minimum
export const FREE_SHIPPING_THRESHOLD = 75

interface ShippingBannerProps {
  /** Override the default threshold */
  threshold?: number
  /** Custom message (optional) */
  message?: string
  /** Show close button (optional) */
  dismissible?: boolean
  /** Callback when dismissed */
  onDismiss?: () => void
}

export function ShippingBanner({
  threshold = FREE_SHIPPING_THRESHOLD,
  message,
  dismissible = false,
  onDismiss,
}: ShippingBannerProps) {
  const displayMessage = message || `Free shipping on orders over $${threshold}`

  return (
    <div
      className="bg-neutral-900 text-white text-center py-2 px-4 text-sm relative"
      role="banner"
      aria-label="Promotional banner"
    >
      <p className="font-medium tracking-wide">
        {displayMessage}
      </p>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

/**
 * Smart Shipping Banner that shows progress toward free shipping
 * Use this in the cart drawer for personalized messaging
 */
export function ShippingProgress({
  currentTotal,
  threshold = FREE_SHIPPING_THRESHOLD,
}: {
  currentTotal: number
  threshold?: number
}) {
  const remaining = threshold - currentTotal
  const progress = Math.min(100, (currentTotal / threshold) * 100)
  const qualifies = currentTotal >= threshold

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4">
      {qualifies ? (
        <p className="text-sm text-green-700 font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          You qualify for free shipping!
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Add <span className="font-semibold text-gray-900">${remaining.toFixed(2)}</span> more for free shipping
          </p>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progress.toFixed(0)}% toward free shipping`}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ShippingBanner
