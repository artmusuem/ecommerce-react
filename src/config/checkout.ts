/**
 * Checkout Configuration Module
 *
 * Provides dual checkout mode support:
 * - 'stripe': Custom checkout with Stripe Elements (works on free Shopify dev stores)
 * - 'shopify': Native Shopify checkout redirect (requires payment gateway or Plus)
 *
 * Set via VITE_CHECKOUT_MODE environment variable.
 */

export type CheckoutMode = 'stripe' | 'shopify'

const CHECKOUT_MODE = (import.meta.env.VITE_CHECKOUT_MODE || 'stripe') as CheckoutMode

/**
 * Check if Stripe is configured with required environment variables
 */
function isStripeConfigured(): boolean {
  return !!(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
}

/**
 * Check if Shopify is configured with required environment variables
 */
function isShopifyConfigured(): boolean {
  return !!(
    import.meta.env.VITE_SHOPIFY_STORE &&
    import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
  )
}

/**
 * Get a user-friendly list of missing configuration for a given mode
 */
function getMissingConfig(mode: CheckoutMode): string[] {
  const missing: string[] = []

  if (mode === 'stripe') {
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      missing.push('VITE_STRIPE_PUBLIC_KEY')
    }
  }

  if (mode === 'shopify') {
    if (!import.meta.env.VITE_SHOPIFY_STORE) {
      missing.push('VITE_SHOPIFY_STORE')
    }
    if (!import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN) {
      missing.push('VITE_SHOPIFY_STOREFRONT_TOKEN')
    }
  }

  return missing
}

export const checkoutConfig = {
  /**
   * The configured checkout mode from environment variable
   */
  mode: CHECKOUT_MODE,

  /**
   * The effective checkout mode, accounting for fallbacks when config is missing.
   * Falls back to the other mode if the requested mode isn't properly configured.
   */
  get effectiveMode(): CheckoutMode {
    // If requested mode is properly configured, use it
    if (CHECKOUT_MODE === 'shopify' && isShopifyConfigured()) return 'shopify'
    if (CHECKOUT_MODE === 'stripe' && isStripeConfigured()) return 'stripe'

    // Fallback: try the other mode
    if (CHECKOUT_MODE === 'shopify' && isStripeConfigured()) return 'stripe'
    if (CHECKOUT_MODE === 'stripe' && isShopifyConfigured()) return 'shopify'

    // Last resort: return the configured mode (will show error)
    return CHECKOUT_MODE
  },

  /**
   * Check if configuration is valid for the effective mode
   */
  get isConfigured(): boolean {
    const mode = this.effectiveMode
    return mode === 'stripe' ? isStripeConfigured() : isShopifyConfigured()
  },

  /**
   * Returns a descriptive error message if checkout is misconfigured.
   * Returns null if everything is properly configured.
   */
  getConfigError(): string | null {
    const mode = this.effectiveMode

    // Check if effective mode is properly configured
    if (mode === 'stripe' && isStripeConfigured()) return null
    if (mode === 'shopify' && isShopifyConfigured()) return null

    const missing = getMissingConfig(mode)

    if (missing.length > 0) {
      return `Checkout requires the following environment variables: ${missing.join(', ')}. ` +
        `See docs/guides/CHECKOUT-MODES.md for setup instructions.`
    }

    return null
  },

  /**
   * Helper functions exposed for testing
   */
  isStripeConfigured,
  isShopifyConfigured,
}
