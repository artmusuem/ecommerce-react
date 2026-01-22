import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import ShopifyCheckout from './ShopifyCheckout'
import { CartProvider, useCartDispatch } from '../context/CartContext'
import { createMockCartItem } from '../test/mocks'
import { useEffect, type ReactNode } from 'react'

// Mock fetch for Shopify GraphQL API
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock window.location
const mockLocation = { href: '' }
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Helper to add items to cart
function CartLoader({ items, children }: { items: ReturnType<typeof createMockCartItem>[]; children?: ReactNode }) {
  const dispatch = useCartDispatch()

  useEffect(() => {
    items.forEach(item => {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          productId: item.productId,
          variantId: item.variantId,
          sizeId: item.sizeId,
          frameId: item.frameId,
          title: item.title,
          artist: item.artist,
          image: item.image,
          price: item.price
        }
      })
    })
  }, [dispatch, items])

  return <>{children}</>
}

// Test wrapper
function TestWrapper({
  children,
  initialRoute = '/checkout',
  cartItems = []
}: {
  children: ReactNode
  initialRoute?: string
  cartItems?: ReturnType<typeof createMockCartItem>[]
}) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        {cartItems.length > 0 ? (
          <CartLoader items={cartItems}>
            <Routes>
              <Route path="/checkout" element={children} />
              <Route path="/" element={<div>Home</div>} />
            </Routes>
          </CartLoader>
        ) : (
          <Routes>
            <Route path="/checkout" element={children} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        )}
      </CartProvider>
    </MemoryRouter>
  )
}

describe('ShopifyCheckout Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockLocation.href = ''

    // Default: Shopify configured
    vi.stubEnv('VITE_SHOPIFY_STORE', 'test-store.myshopify.com')
    vi.stubEnv('VITE_SHOPIFY_STOREFRONT_TOKEN', 'test-token-123')
    vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('Empty Cart', () => {
    it('should show empty cart message after hydration', async () => {
      render(
        <TestWrapper>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      })
    })

    it('should show continue shopping link', async () => {
      render(
        <TestWrapper>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Continue shopping/i })).toBeInTheDocument()
      })
    })
  })

  describe('With Cart Items', () => {
    const testItems = [createMockCartItem({
      productId: 'test-1',
      variantId: 'gid://shopify/ProductVariant/123456789',
      title: 'Test Artwork',
      artist: 'Test Artist',
      sizeId: '8x10',
      frameId: 'black',
      price: 45
    })]

    it('should show preparing checkout message initially', async () => {
      // Don't resolve fetch immediately to catch the loading state
      mockFetch.mockImplementation(() => new Promise(() => {}))

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Preparing checkout/i)).toBeInTheDocument()
      })
    })

    it('should show item count in loading message', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}))

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/1 item/i)).toBeInTheDocument()
      })
    })

    it('should redirect to Shopify checkout on success', async () => {
      const checkoutUrl = 'https://test-store.myshopify.com/checkouts/test123'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            cartCreate: {
              cart: {
                id: 'test-cart-id',
                checkoutUrl
              },
              userErrors: []
            }
          }
        })
      })

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockLocation.href).toBe(checkoutUrl)
      })
    })

    it('should show redirecting message before redirect', async () => {
      const checkoutUrl = 'https://test-store.myshopify.com/checkouts/test123'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            cartCreate: {
              cart: {
                id: 'test-cart-id',
                checkoutUrl
              },
              userErrors: []
            }
          }
        })
      })

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Redirecting to Shopify/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    const testItems = [createMockCartItem({
      variantId: 'gid://shopify/ProductVariant/123456789'
    })]

    it('should show error when Shopify API fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Checkout Error/i)).toBeInTheDocument()
      })
    })

    it('should show Shopify user errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            cartCreate: {
              cart: null,
              userErrors: [{ field: 'lines', message: 'Product is unavailable' }]
            }
          }
        })
      })

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Product is unavailable/i)).toBeInTheDocument()
      })
    })

    it('should show error when checkout URL is missing', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            cartCreate: {
              cart: { id: 'test', checkoutUrl: null },
              userErrors: []
            }
          }
        })
      })

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Failed to create checkout/i)).toBeInTheDocument()
      })
    })

    it('should show try again and back to shop buttons on error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper cartItems={testItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Back to Shop/i })).toBeInTheDocument()
      })
    })
  })

  describe('Invalid Variant IDs', () => {
    it('should show error when all items have invalid variant IDs', async () => {
      const invalidItems = [createMockCartItem({
        variantId: 'invalid-id-not-shopify-gid',
        title: 'Invalid Item'
      })]

      render(
        <TestWrapper cartItems={invalidItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Unable to checkout/i)).toBeInTheDocument()
      })
    })

    it('should proceed with valid items when some are invalid', async () => {
      const mixedItems = [
        createMockCartItem({
          productId: 'valid-1',
          variantId: 'gid://shopify/ProductVariant/123',
          title: 'Valid Item'
        }),
        createMockCartItem({
          productId: 'invalid-1',
          variantId: 'local-item-456',
          title: 'Invalid Item'
        })
      ]

      const checkoutUrl = 'https://test-store.myshopify.com/checkouts/test123'
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: {
            cartCreate: {
              cart: { id: 'test-cart-id', checkoutUrl },
              userErrors: []
            }
          }
        })
      })

      render(
        <TestWrapper cartItems={mixedItems}>
          <ShopifyCheckout />
        </TestWrapper>
      )

      await waitFor(() => {
        // Should still create cart with valid item
        expect(mockFetch).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockLocation.href).toBe(checkoutUrl)
      })
    })
  })

  // Note: Configuration error tests and custom checkout domain tests are skipped
  // because environment variables are read at module load time in Vite.
  // These scenarios are tested manually and covered by the checkout.ts config tests.
  //
  // Tested manually:
  // - Missing VITE_SHOPIFY_STORE shows "Shopify is not configured" error
  // - VITE_SHOPIFY_CHECKOUT_DOMAIN overrides the checkout URL hostname
})
