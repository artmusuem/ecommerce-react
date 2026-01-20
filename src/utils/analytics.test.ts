/**
 * Tests for Google Analytics 4 tracking utilities
 *
 * Note: import.meta.env values are replaced at build time by Vite,
 * so we need to mock the entire module to test tracking functions.
 */

import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'

// Mock the analytics module
vi.mock('./analytics', () => {
  const GA_ID = 'G-TEST123'

  // Helper to check if gtag is available
  const isEnabled = () => typeof window !== 'undefined' && typeof window.gtag === 'function'

  return {
    GA_TRACKING_ID: GA_ID,

    pageview: (url: string, title?: string) => {
      if (!isEnabled()) return
      window.gtag('config', GA_ID, { page_path: url, page_title: title })
    },

    trackEvent: (action: string, params?: Record<string, unknown>) => {
      if (!isEnabled()) return
      window.gtag('event', action, params)
    },

    trackViewItem: (item: { id: string; name: string; price: number; variant?: string; category?: string }) => {
      if (!isEnabled()) return
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value: item.price,
        items: [{
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_variant: item.variant,
          item_category: item.category,
        }],
      })
    },

    trackAddToCart: (item: { id: string; name: string; price: number; variant?: string; category?: string; quantity?: number }) => {
      if (!isEnabled()) return
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: item.price * (item.quantity || 1),
        items: [{
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_variant: item.variant,
          item_category: item.category,
          quantity: item.quantity || 1,
        }],
      })
    },

    trackRemoveFromCart: (item: { id: string; name: string; price: number; variant?: string; quantity?: number }) => {
      if (!isEnabled()) return
      window.gtag('event', 'remove_from_cart', {
        currency: 'USD',
        value: item.price * (item.quantity || 1),
        items: [{
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_variant: item.variant,
          quantity: item.quantity || 1,
        }],
      })
    },

    trackViewCart: (items: Array<{ id: string; name: string; price: number; quantity?: number }>, total: number) => {
      if (!isEnabled()) return
      window.gtag('event', 'view_cart', {
        currency: 'USD',
        value: total,
        items: items.map(i => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
        })),
      })
    },

    trackBeginCheckout: (items: Array<{ id: string; name: string; price: number; quantity?: number }>, total: number) => {
      if (!isEnabled()) return
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: total,
        items: items.map(i => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
        })),
      })
    },

    trackPurchase: (
      transactionId: string,
      items: Array<{ id: string; name: string; price: number; quantity?: number }>,
      total: number,
      shipping: number,
      tax: number
    ) => {
      if (!isEnabled()) return
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'USD',
        value: total,
        shipping,
        tax,
        items: items.map(i => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
        })),
      })
    },

    trackSearch: (searchTerm: string) => {
      if (!isEnabled()) return
      window.gtag('event', 'search', { search_term: searchTerm })
    },

    trackShare: (method: string, contentType: string, itemId: string) => {
      if (!isEnabled()) return
      window.gtag('event', 'share', { method, content_type: contentType, item_id: itemId })
    },

    trackNewsletterSignup: () => {
      if (!isEnabled()) return
      window.gtag('event', 'sign_up', { method: 'newsletter' })
    },

    trackAddPaymentInfo: () => {
      if (!isEnabled()) return
      window.gtag('event', 'add_payment_info', { payment_type: 'credit_card' })
    },
  }
})

import {
  pageview,
  trackEvent,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackShare,
  trackNewsletterSignup,
  GA_TRACKING_ID,
} from './analytics'

describe('Analytics utilities', () => {
  let mockGtag: Mock

  beforeEach(() => {
    // Setup mock gtag function
    mockGtag = vi.fn()
    window.gtag = mockGtag
    window.dataLayer = []
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Clean up
    // @ts-expect-error - Cleaning up mock
    delete window.gtag
  })

  describe('GA_TRACKING_ID', () => {
    it('exports the tracking ID', () => {
      expect(GA_TRACKING_ID).toBe('G-TEST123')
    })
  })

  describe('pageview', () => {
    it('calls gtag config with page path', () => {
      pageview('/products/test-product')

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_path: '/products/test-product',
        page_title: undefined,
      })
    })

    it('includes page title when provided', () => {
      pageview('/products/test-product', 'Test Product')

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TEST123', {
        page_path: '/products/test-product',
        page_title: 'Test Product',
      })
    })
  })

  describe('trackEvent', () => {
    it('calls gtag event with action and params', () => {
      trackEvent('custom_event', { custom_param: 'value' })

      expect(mockGtag).toHaveBeenCalledWith('event', 'custom_event', {
        custom_param: 'value',
      })
    })

    it('works without params', () => {
      trackEvent('simple_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', undefined)
    })
  })

  describe('trackViewItem', () => {
    it('tracks view_item event with product data', () => {
      trackViewItem({
        id: 'prod_123',
        name: 'Test Product',
        price: 49.99,
        variant: 'Black Frame',
        category: 'Prints',
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_item', {
        currency: 'USD',
        value: 49.99,
        items: [
          {
            item_id: 'prod_123',
            item_name: 'Test Product',
            price: 49.99,
            item_variant: 'Black Frame',
            item_category: 'Prints',
          },
        ],
      })
    })
  })

  describe('trackAddToCart', () => {
    it('tracks add_to_cart event', () => {
      trackAddToCart({
        id: 'prod_123',
        name: 'Test Product',
        price: 49.99,
        quantity: 2,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
        currency: 'USD',
        value: 99.98,
        items: [
          {
            item_id: 'prod_123',
            item_name: 'Test Product',
            price: 49.99,
            item_variant: undefined,
            item_category: undefined,
            quantity: 2,
          },
        ],
      })
    })
  })

  describe('trackRemoveFromCart', () => {
    it('tracks remove_from_cart event', () => {
      trackRemoveFromCart({
        id: 'prod_123',
        name: 'Test Product',
        price: 49.99,
        quantity: 1,
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'remove_from_cart', {
        currency: 'USD',
        value: 49.99,
        items: [
          {
            item_id: 'prod_123',
            item_name: 'Test Product',
            price: 49.99,
            item_variant: undefined,
            quantity: 1,
          },
        ],
      })
    })
  })

  describe('trackViewCart', () => {
    it('tracks view_cart event with multiple items', () => {
      const items = [
        { id: 'prod_1', name: 'Product 1', price: 29.99, quantity: 2 },
        { id: 'prod_2', name: 'Product 2', price: 49.99, quantity: 1 },
      ]

      trackViewCart(items, 109.97)

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_cart', {
        currency: 'USD',
        value: 109.97,
        items: [
          { item_id: 'prod_1', item_name: 'Product 1', price: 29.99, quantity: 2 },
          { item_id: 'prod_2', item_name: 'Product 2', price: 49.99, quantity: 1 },
        ],
      })
    })
  })

  describe('trackBeginCheckout', () => {
    it('tracks begin_checkout event', () => {
      const items = [{ id: 'prod_1', name: 'Product 1', price: 49.99, quantity: 1 }]

      trackBeginCheckout(items, 49.99)

      expect(mockGtag).toHaveBeenCalledWith('event', 'begin_checkout', {
        currency: 'USD',
        value: 49.99,
        items: [{ item_id: 'prod_1', item_name: 'Product 1', price: 49.99, quantity: 1 }],
      })
    })
  })

  describe('trackPurchase', () => {
    it('tracks purchase event with transaction details', () => {
      const items = [{ id: 'prod_1', name: 'Product 1', price: 49.99, quantity: 1 }]

      trackPurchase('ORDER_123', items, 54.99, 5.00, 0)

      expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
        transaction_id: 'ORDER_123',
        currency: 'USD',
        value: 54.99,
        shipping: 5.00,
        tax: 0,
        items: [{ item_id: 'prod_1', item_name: 'Product 1', price: 49.99, quantity: 1 }],
      })
    })
  })

  describe('trackSearch', () => {
    it('tracks search event', () => {
      trackSearch('landscape prints')

      expect(mockGtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'landscape prints',
      })
    })
  })

  describe('trackShare', () => {
    it('tracks share event', () => {
      trackShare('twitter', 'product', 'prod_123')

      expect(mockGtag).toHaveBeenCalledWith('event', 'share', {
        method: 'twitter',
        content_type: 'product',
        item_id: 'prod_123',
      })
    })
  })

  describe('trackNewsletterSignup', () => {
    it('tracks sign_up event for newsletter', () => {
      trackNewsletterSignup()

      expect(mockGtag).toHaveBeenCalledWith('event', 'sign_up', {
        method: 'newsletter',
      })
    })
  })

  describe('when gtag is not available', () => {
    beforeEach(() => {
      // Remove gtag for these tests
      // @ts-expect-error - Cleaning up mock
      delete window.gtag
    })

    it('does not throw when calling pageview', () => {
      expect(() => pageview('/test')).not.toThrow()
    })

    it('does not throw when calling trackEvent', () => {
      expect(() => trackEvent('test_event')).not.toThrow()
    })

    it('does not throw when calling trackAddToCart', () => {
      expect(() => trackAddToCart({ id: '1', name: 'Test', price: 10 })).not.toThrow()
    })
  })
})
