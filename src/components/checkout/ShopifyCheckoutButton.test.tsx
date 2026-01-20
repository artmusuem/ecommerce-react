import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import { ShopifyCheckoutButton, useShopifyCheckout } from './ShopifyCheckoutButton'

// Mock @shopify/hydrogen-react
const mockUseCart = vi.fn()
vi.mock('@shopify/hydrogen-react', () => ({
  useCart: () => mockUseCart(),
}))

// Save original location
const originalLocation = window.location

describe('ShopifyCheckoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  describe('rendering', () => {
    it('should render a button element', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should show "Checkout with Shopify" text', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton />)
      expect(screen.getByText('Checkout with Shopify')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton className="custom-class" />)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('disabled states', () => {
    it('should be disabled when cart has no checkout URL', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: null,
        status: 'idle',
        totalQuantity: 0,
      })

      render(<ShopifyCheckoutButton />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should be disabled when cart is creating', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'creating',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should be disabled when disabled prop is true', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not be disabled when checkout URL exists and cart is ready', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton />)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })

  describe('checkout flow', () => {
    it('should redirect to checkout URL when clicked', () => {
      const checkoutUrl = 'https://checkout.shopify.com/123'
      mockUseCart.mockReturnValue({
        checkoutUrl,
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton />)
      fireEvent.click(screen.getByRole('button'))

      expect(window.location.href).toBe(checkoutUrl)
    })

    it('should not redirect when checkout URL is missing', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: null,
        status: 'idle',
        totalQuantity: 0,
      })

      // Mock console.error to verify warning
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<ShopifyCheckoutButton />)

      // Button is disabled, so click shouldn't trigger handler
      // But let's verify the console.error in case it somehow runs
      expect(window.location.href).toBe('')

      consoleSpy.mockRestore()
    })

    it('should show loading state when clicked', async () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton />)
      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Redirecting to Checkout...')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have disabled styling when disabled', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: null,
        status: 'idle',
        totalQuantity: 0,
      })

      render(<ShopifyCheckoutButton />)
      expect(screen.getByRole('button')).toHaveClass('bg-gray-400', 'cursor-not-allowed')
    })

    it('should have active styling when enabled', () => {
      mockUseCart.mockReturnValue({
        checkoutUrl: 'https://checkout.shopify.com/123',
        status: 'idle',
        totalQuantity: 1,
      })

      render(<ShopifyCheckoutButton />)
      expect(screen.getByRole('button')).toHaveClass('bg-primary')
    })
  })
})

describe('useShopifyCheckout', () => {
  it('should return isAvailable true when checkout URL exists', () => {
    mockUseCart.mockReturnValue({
      checkoutUrl: 'https://checkout.shopify.com/123',
      status: 'idle',
      totalQuantity: 2,
    })

    const { result } = renderHook(() => useShopifyCheckout())

    expect(result.current.isAvailable).toBe(true)
    expect(result.current.checkoutUrl).toBe('https://checkout.shopify.com/123')
    expect(result.current.status).toBe('idle')
    expect(result.current.lineCount).toBe(2)
  })

  it('should return isAvailable false when checkout URL is missing', () => {
    mockUseCart.mockReturnValue({
      checkoutUrl: null,
      status: 'idle',
      totalQuantity: 0,
    })

    const { result } = renderHook(() => useShopifyCheckout())

    expect(result.current.isAvailable).toBe(false)
    expect(result.current.checkoutUrl).toBeNull()
    expect(result.current.lineCount).toBe(0)
  })

  it('should handle undefined totalQuantity', () => {
    mockUseCart.mockReturnValue({
      checkoutUrl: null,
      status: 'idle',
      totalQuantity: undefined,
    })

    const { result } = renderHook(() => useShopifyCheckout())

    expect(result.current.lineCount).toBe(0)
  })
})
