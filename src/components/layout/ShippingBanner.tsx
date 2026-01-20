/**
 * Free Shipping Promotional Banner
 *
 * Displays at the top of the page highlighting free shipping on all orders.
 * Mirrors hikariandink.com's premium positioning.
 *
 * @example
 * <ShippingBanner />
 */

interface ShippingBannerProps {
  /** Custom message (optional) */
  message?: string
  /** Show close button (optional) */
  dismissible?: boolean
  /** Callback when dismissed */
  onDismiss?: () => void
}

export function ShippingBanner({
  message = 'Free shipping on all orders',
  dismissible = false,
  onDismiss,
}: ShippingBannerProps) {
  return (
    <div
      className="bg-neutral-900 text-white text-center py-2 px-4 text-sm relative"
      role="banner"
      aria-label="Promotional banner"
    >
      <p className="font-medium tracking-wide">
        {message}
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
 * Free Shipping Badge for cart
 * Shows confirmation that shipping is free on all orders
 */
export function ShippingProgress() {
  return (
    <div className="bg-green-50 rounded-lg p-3 mb-4">
      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Free shipping included
      </p>
    </div>
  )
}

export default ShippingBanner
