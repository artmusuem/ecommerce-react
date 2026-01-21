import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import Checkout from './Checkout'
import { CartProvider, useCartDispatch } from '../context/CartContext'
import { createMockCartItem } from '../test/mocks'
import { useEffect, type ReactNode } from 'react'

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

// Mock Cloudinary
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
              <Route path="/product/:id" element={<div>Product Page</div>} />
              <Route path="/" element={<div>Home</div>} />
            </Routes>
          </CartLoader>
        ) : (
          <Routes>
            <Route path="/checkout" element={children} />
            <Route path="/product/:id" element={<div>Product Page</div>} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        )}
      </CartProvider>
    </MemoryRouter>
  )
}

// Helper to fill shipping form using placeholders (component uses placeholders, not labels)
async function fillShippingForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('Email or mobile phone number'), 'test@example.com')
  await user.type(screen.getByPlaceholderText('First name (optional)'), 'John')
  await user.type(screen.getByPlaceholderText('Last name'), 'Doe')
  await user.type(screen.getByPlaceholderText('Address'), '123 Main St')
  await user.type(screen.getByPlaceholderText('City'), 'New York')
  await user.type(screen.getByPlaceholderText('State'), 'NY')
  await user.type(screen.getByPlaceholderText('ZIP code'), '10001')
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

    it('should render Contact section heading', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
      })
    })

    it('should render Delivery section heading', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Delivery' })).toBeInTheDocument()
      })
    })

    it('should render Payment section heading', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Payment' })).toBeInTheDocument()
      })
    })

    it('should display cart item title in order summary', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Test Artwork')).toBeInTheDocument()
      })
    })
  })

  describe('Payment Intent', () => {
    const testItems = [createMockCartItem()]

    it('should fetch payment intent on mount', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

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

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Unable to initialize payment. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show Try Again button on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      })
    })

    it('should render Stripe Elements after payment intent loads', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('stripe-elements')).toBeInTheDocument()
      })
    })
  })

  describe('Checkout Form', () => {
    const testItems = [createMockCartItem()]

    it('should render email input', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email or mobile phone number')).toBeInTheDocument()
      })
    })

    it('should render pay button', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await fillShippingForm(user)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Pay now' })).toBeInTheDocument()
      })
    })

    it('should show secure transaction message', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/All transactions are secure and encrypted/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should render logo link to home', async () => {
      render(
        <TestWrapper cartItems={[createMockCartItem()]}>
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        // Logo link goes to home page
        const logoLink = screen.getByRole('link', { name: /Gallery Store/i })
        expect(logoLink).toHaveAttribute('href', '/')
      })
    })
  })

  describe('Success State', () => {
    it('should show success message on redirect', async () => {
      render(
        <TestWrapper initialRoute="/checkout?success=true">
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Thank you for your order!')).toBeInTheDocument()
      })
    })

    it('should show continue shopping button', async () => {
      render(
        <TestWrapper initialRoute="/checkout?success=true">
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Continue Shopping' })).toBeInTheDocument()
      })
    })

    it('should handle redirect_status=succeeded', async () => {
      render(
        <TestWrapper initialRoute="/checkout?redirect_status=succeeded">
          <Checkout />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Thank you for your order!')).toBeInTheDocument()
      })
    })
  })
})
