/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { useCart as useHydrogenCart } from '@shopify/hydrogen-react'

interface ShopifyCheckoutButtonProps {
  className?: string
  disabled?: boolean
}

/**
 * Shopify Checkout Button
 *
 * Redirects to Shopify's hosted checkout page.
 * The cart must have items added via hydrogen-react's CartProvider.
 */
export function ShopifyCheckoutButton({
  className = '',
  disabled = false,
}: ShopifyCheckoutButtonProps) {
  const cart = useHydrogenCart()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!cart.checkoutUrl) {
      console.error('No checkout URL available. Is the cart empty?')
      return
    }

    setLoading(true)

    // Redirect to Shopify checkout
    window.location.href = cart.checkoutUrl
  }

  const isDisabled = disabled || loading || !cart.checkoutUrl || cart.status === 'creating'

  return (
    <button
      onClick={handleCheckout}
      disabled={isDisabled}
      className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all ${
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-primary hover:bg-primary-dark cursor-pointer'
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Redirecting to Checkout...
        </span>
      ) : (
        <>
          Checkout with Shopify
          <span className="ml-2 text-sm opacity-75">→</span>
        </>
      )}
    </button>
  )
}

/**
 * Hook to check if Shopify checkout is available
 */
export function useShopifyCheckout() {
  const cart = useHydrogenCart()

  return {
    isAvailable: Boolean(cart.checkoutUrl),
    checkoutUrl: cart.checkoutUrl,
    status: cart.status,
    lineCount: cart.totalQuantity || 0,
  }
}
