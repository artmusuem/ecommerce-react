import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Checkout from './Checkout'
import { CartProvider, useCartDispatch } from '../context/CartContext'
import { useEffect, type ReactNode } from 'react'

// Mock Cloudinary and Stripe env
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')
vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

// Mock fetch for payment intent
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: ReactNode }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  useStripe: () => ({
    confirmPayment: vi.fn().mockResolvedValue({ error: null })
  }),
  useElements: () => ({
    submit: vi.fn().mockResolvedValue({ error: null })
  })
}))

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({})
}))

// Helper to add item to cart
function CartWithItem({ children }: { children?: ReactNode }) {
  const dispatch = useCartDispatch()
  
  useEffect(() => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: 'test-artwork-1',
        sizeId: '8x10',
        frameId: 'black',
        title: 'Test Artwork',
        artist: 'Test Artist',
        image: 'https://example.com/img.jpg'
      }
    })
  }, [dispatch])
  
  return <>{children}</>
}

function renderCheckout(options: { withItem?: boolean; initialRoute?: string } = {}) {
  const { withItem = false, initialRoute = '/checkout' } = options
  
  if (withItem) {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <CartProvider>
          <CartWithItem>
            <Routes>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/" element={<div>Home</div>} />
            </Routes>
          </CartWithItem>
        </CartProvider>
      </MemoryRouter>
    )
  }
  
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  )
}

describe('Checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ clientSecret: 'test_secret_123' })
    })
  })

  describe('empty cart', () => {
    it('should show empty cart message', async () => {
      renderCheckout()
      
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      })
    })

    it('should show continue shopping link', async () => {
      renderCheckout()
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Continue shopping' })).toBeInTheDocument()
      })
    })
  })

  describe('with cart items', () => {
    it('should render checkout heading', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
      })
    })

    it('should show order summary heading', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Order Summary' })).toBeInTheDocument()
      })
    })

    it('should show payment heading', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Payment' })).toBeInTheDocument()
      })
    })

    it('should display cart item title', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Test Artwork')).toBeInTheDocument()
      })
    })

    it('should display total amount', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        // Total appears multiple times, just verify it exists
        const prices = screen.getAllByText('$45')
        expect(prices.length).toBeGreaterThan(0)
      })
    })
  })

  describe('payment intent', () => {
    it('should fetch payment intent on mount', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/create-payment-intent',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        )
      })
    })

    it('should show error on payment intent failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Unable to initialize payment. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show Try Again button on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      })
    })

    it('should render Stripe Elements after payment intent loads', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
      })
    })
  })

  describe('checkout form', () => {
    it('should render email input', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
      })
    })

    it('should render pay button with total', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Pay \$45/i })).toBeInTheDocument()
      })
    })

    it('should show secured by Stripe message', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText(/Secured by Stripe/i)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should render back to shop link', async () => {
      renderCheckout({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Back to shop/i })).toBeInTheDocument()
      })
    })
  })

  describe('success state', () => {
    it('should show success message on redirect', async () => {
      renderCheckout({ initialRoute: '/checkout?success=true' })
      
      await waitFor(() => {
        expect(screen.getByText('Thank you for your order!')).toBeInTheDocument()
      })
    })

    it('should show Continue Shopping button', async () => {
      renderCheckout({ initialRoute: '/checkout?success=true' })
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Continue Shopping' })).toBeInTheDocument()
      })
    })

    it('should handle redirect_status=succeeded', async () => {
      renderCheckout({ initialRoute: '/checkout?redirect_status=succeeded' })
      
      await waitFor(() => {
        expect(screen.getByText('Thank you for your order!')).toBeInTheDocument()
      })
    })
  })
})
