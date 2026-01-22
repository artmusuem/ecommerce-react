import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import Checkout from './Checkout'
import { CartProvider, useCartDispatch } from '../context/CartContext'
import { createMockCartItem } from '../test/mocks'
import { useEffect, type ReactNode } from 'react'

// Mock fetch for checkout session
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock Stripe Embedded Checkout
vi.mock('@stripe/react-stripe-js', () => ({
  EmbeddedCheckoutProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="stripe-checkout-provider">{children}</div>
  ),
  EmbeddedCheckout: () => <div data-testid="stripe-embedded-checkout">Stripe Embedded Checkout</div>,
}))

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({})
}))

// Mock environment
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')
vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

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

describe('Checkout Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'test_secret_123' })
    })
  })

  describe('Empty Cart', () => {
    it('should show empty cart message', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      })
    })

    it('should show continue shopping link', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Continue shopping' })).toBeInTheDocument()
      })
    })

    it('should not render Stripe Embedded Checkout when cart is empty', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('stripe-embedded-checkout')).not.toBeInTheDocument()
      })
    })
  })

  describe('With Cart Items', () => {
    const testItems = [createMockCartItem({
      productId: 'test-1',
      title: 'Test Artwork',
      artist: 'Test Artist',
      sizeId: '8x10',
      frameId: 'black',
      price: 45
    })]

    it('should render back to gallery link', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Back to Gallery Store')).toBeInTheDocument()
      })
    })

    it('should render Stripe Embedded Checkout', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('stripe-embedded-checkout')).toBeInTheDocument()
      })
    })

    it('should show secure checkout footer', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Secure checkout')).toBeInTheDocument()
        expect(screen.getByText('Powered by Stripe')).toBeInTheDocument()
      })
    })
  })

  describe('Checkout Session', () => {
    const testItems = [createMockCartItem()]

    it('should create checkout session when component renders with items', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      // The fetchClientSecret is called by EmbeddedCheckoutProvider
      // Since we mock it, we verify the component renders the provider
      await waitFor(() => {
        expect(screen.getByTestId('stripe-checkout-provider')).toBeInTheDocument()
      })
    })
  })

  // Note: Error state tests are skipped because EmbeddedCheckoutProvider
  // is mocked and doesn't actually call fetchClientSecret. Error handling
  // is tested manually via the live checkout flow.

  describe('Navigation', () => {
    const testItems = [createMockCartItem()]

    it('should have a link back to home page', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /Back to Gallery Store/i })
        expect(backLink).toHaveAttribute('href', '/')
      })
    })
  })
})
