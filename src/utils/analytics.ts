/**
 * Google Analytics 4 Event Tracking Utilities
 *
 * Provides type-safe functions for tracking e-commerce events.
 * Only fires events in production when GA_TRACKING_ID is configured.
 *
 * @example
 * // Track page view
 * pageview('/products/artwork-1')
 *
 * // Track add to cart
 * trackAddToCart({ id: 'prod_123', name: 'Sunset Print', price: 49.99 })
 *
 * // Track custom event
 * trackEvent('share', { method: 'twitter', content_type: 'product' })
 */

import type { GtagEventParams, GtagItem } from '../types/gtag'

// GA4 Measurement ID from environment variables
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID as string | undefined

/**
 * Check if analytics is enabled and available
 */
function isAnalyticsEnabled(): boolean {
  return Boolean(
    GA_TRACKING_ID &&
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function'
  )
}

/**
 * Track page views
 * Called automatically by router on navigation
 */
export function pageview(url: string, title?: string): void {
  if (!isAnalyticsEnabled()) return

  window.gtag('config', GA_TRACKING_ID!, {
    page_path: url,
    page_title: title,
  })
}

/**
 * Track custom events
 * Generic event tracking for any GA4 event
 */
export function trackEvent(
  action: string,
  params?: GtagEventParams
): void {
  if (!isAnalyticsEnabled()) return

  window.gtag('event', action, params)
}

// ============================================================================
// E-commerce Events (GA4 Standard)
// ============================================================================

interface ProductItem {
  id: string
  name: string
  price: number
  variant?: string
  category?: string
  quantity?: number
}

/**
 * Track when a user views a product
 * Trigger: Product page load or quick view
 */
export function trackViewItem(item: ProductItem): void {
  if (!isAnalyticsEnabled()) return

  const gtagItem: GtagItem = {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_variant: item.variant,
    item_category: item.category || 'Art Prints',
    quantity: 1,
  }

  trackEvent('view_item', {
    currency: 'USD',
    value: item.price,
    items: [gtagItem],
  })
}

/**
 * Track when a user adds an item to cart
 * Trigger: Add to cart button click
 */
export function trackAddToCart(item: ProductItem): void {
  if (!isAnalyticsEnabled()) return

  const gtagItem: GtagItem = {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_variant: item.variant,
    item_category: item.category || 'Art Prints',
    quantity: item.quantity || 1,
  }

  trackEvent('add_to_cart', {
    currency: 'USD',
    value: item.price * (item.quantity || 1),
    items: [gtagItem],
  })
}

/**
 * Track when a user removes an item from cart
 * Trigger: Remove button click or quantity set to 0
 */
export function trackRemoveFromCart(item: ProductItem): void {
  if (!isAnalyticsEnabled()) return

  const gtagItem: GtagItem = {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_variant: item.variant,
    item_category: item.category || 'Art Prints',
    quantity: item.quantity || 1,
  }

  trackEvent('remove_from_cart', {
    currency: 'USD',
    value: item.price * (item.quantity || 1),
    items: [gtagItem],
  })
}

/**
 * Track when a user views their cart
 * Trigger: Cart drawer opens or cart page loads
 */
export function trackViewCart(items: ProductItem[], total: number): void {
  if (!isAnalyticsEnabled()) return

  const gtagItems: GtagItem[] = items.map(item => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_variant: item.variant,
    item_category: item.category || 'Art Prints',
    quantity: item.quantity || 1,
  }))

  trackEvent('view_cart', {
    currency: 'USD',
    value: total,
    items: gtagItems,
  })
}

/**
 * Track when a user begins checkout
 * Trigger: Checkout page load or checkout button click
 */
export function trackBeginCheckout(items: ProductItem[], total: number): void {
  if (!isAnalyticsEnabled()) return

  const gtagItems: GtagItem[] = items.map(item => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_variant: item.variant,
    item_category: item.category || 'Art Prints',
    quantity: item.quantity || 1,
  }))

  trackEvent('begin_checkout', {
    currency: 'USD',
    value: total,
    items: gtagItems,
  })
}

/**
 * Track when a user adds payment info
 * Trigger: Payment form interaction
 */
export function trackAddPaymentInfo(items: ProductItem[], total: number): void {
  if (!isAnalyticsEnabled()) return

  const gtagItems: GtagItem[] = items.map(item => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_variant: item.variant,
    item_category: item.category || 'Art Prints',
    quantity: item.quantity || 1,
  }))

  trackEvent('add_payment_info', {
    currency: 'USD',
    value: total,
    items: gtagItems,
  })
}

/**
 * Track successful purchase
 * Trigger: Order confirmation page
 */
export function trackPurchase(
  transactionId: string,
  items: ProductItem[],
  total: number,
  shipping?: number,
  tax?: number
): void {
  if (!isAnalyticsEnabled()) return

  const gtagItems: GtagItem[] = items.map(item => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    item_variant: item.variant,
    item_category: item.category || 'Art Prints',
    quantity: item.quantity || 1,
  }))

  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value: total,
    shipping: shipping || 0,
    tax: tax || 0,
    items: gtagItems,
  })
}

// ============================================================================
// Engagement Events
// ============================================================================

/**
 * Track search queries
 * Trigger: Search form submission
 */
export function trackSearch(searchTerm: string): void {
  if (!isAnalyticsEnabled()) return

  trackEvent('search', {
    search_term: searchTerm,
  })
}

/**
 * Track content shares
 * Trigger: Share button clicks
 */
export function trackShare(method: string, contentType: string, itemId: string): void {
  if (!isAnalyticsEnabled()) return

  trackEvent('share', {
    method,
    content_type: contentType,
    content_id: itemId,
  })
}

/**
 * Track newsletter signups
 * Trigger: Newsletter form submission
 */
export function trackNewsletterSignup(): void {
  if (!isAnalyticsEnabled()) return

  trackEvent('sign_up', {
    method: 'newsletter',
  })
}
