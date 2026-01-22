import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('checkout configuration', () => {
  beforeEach(() => {
    // Reset module cache before each test to pick up new env values
    vi.resetModules()
  })

  afterEach(() => {
    // Restore original env values
    vi.unstubAllEnvs()
  })

  describe('mode selection', () => {
    it('should default to stripe when no mode is set', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', undefined)
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.mode).toBe('stripe')
      expect(checkoutConfig.effectiveMode).toBe('stripe')
    })

    it('should use stripe mode when explicitly set', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'stripe')
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.mode).toBe('stripe')
      expect(checkoutConfig.effectiveMode).toBe('stripe')
    })

    it('should use shopify mode when explicitly set and configured', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'shopify')
      vi.stubEnv('VITE_SHOPIFY_STORE', 'test-store.myshopify.com')
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'shpat_test')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.mode).toBe('shopify')
      expect(checkoutConfig.effectiveMode).toBe('shopify')
    })
  })

  describe('fallback behavior', () => {
    it('should fallback to stripe when shopify mode is set but not configured', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'shopify')
      vi.stubEnv('VITE_SHOPIFY_STORE', undefined)
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', undefined)
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.mode).toBe('shopify') // Requested mode
      expect(checkoutConfig.effectiveMode).toBe('stripe') // Fallback
    })

    it('should fallback to shopify when stripe mode is set but not configured', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'stripe')
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', undefined)
      vi.stubEnv('VITE_SHOPIFY_STORE', 'test-store.myshopify.com')
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'shpat_test')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.mode).toBe('stripe') // Requested mode
      expect(checkoutConfig.effectiveMode).toBe('shopify') // Fallback
    })
  })

  describe('configuration validation', () => {
    it('should report no error when stripe is configured', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'stripe')
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.getConfigError()).toBeNull()
      expect(checkoutConfig.isConfigured).toBe(true)
    })

    it('should report no error when shopify is configured', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'shopify')
      vi.stubEnv('VITE_SHOPIFY_STORE', 'test-store.myshopify.com')
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'shpat_test')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.getConfigError()).toBeNull()
      expect(checkoutConfig.isConfigured).toBe(true)
    })

    it('should report error with missing stripe keys', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'stripe')
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', undefined)
      vi.stubEnv('VITE_SHOPIFY_STORE', undefined)
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', undefined)

      const { checkoutConfig } = await import('./checkout')
      const error = checkoutConfig.getConfigError()
      expect(error).not.toBeNull()
      expect(error).toContain('VITE_STRIPE_PUBLIC_KEY')
    })

    it('should report error with missing shopify keys', async () => {
      vi.stubEnv('VITE_CHECKOUT_MODE', 'shopify')
      vi.stubEnv('VITE_SHOPIFY_STORE', undefined)
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', undefined)
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', undefined)

      const { checkoutConfig } = await import('./checkout')
      const error = checkoutConfig.getConfigError()
      expect(error).not.toBeNull()
      expect(error).toContain('VITE_SHOPIFY_STORE')
      expect(error).toContain('VITE_SHOPIFY_STOREFRONT_TOKEN')
    })
  })

  describe('helper functions', () => {
    it('isStripeConfigured should return true when key is set', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.isStripeConfigured()).toBe(true)
    })

    it('isStripeConfigured should return false when key is missing', async () => {
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', undefined)

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.isStripeConfigured()).toBe(false)
    })

    it('isShopifyConfigured should return true when both keys are set', async () => {
      vi.stubEnv('VITE_SHOPIFY_STORE', 'test-store.myshopify.com')
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'shpat_test')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.isShopifyConfigured()).toBe(true)
    })

    it('isShopifyConfigured should return false when store is missing', async () => {
      vi.stubEnv('VITE_SHOPIFY_STORE', undefined)
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'shpat_test')

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.isShopifyConfigured()).toBe(false)
    })

    it('isShopifyConfigured should return false when token is missing', async () => {
      vi.stubEnv('VITE_SHOPIFY_STORE', 'test-store.myshopify.com')
      vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', undefined)

      const { checkoutConfig } = await import('./checkout')
      expect(checkoutConfig.isShopifyConfigured()).toBe(false)
    })
  })
})
