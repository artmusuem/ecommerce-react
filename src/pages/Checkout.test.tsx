import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Checkout from './Checkout'
import { CartProvider, useCartDispatch } from '../context/CartContext'
import { mockCartItems, createMockCartItem } from '../test/mocks'
import type { ReactNode } from 'react'

// Mock fetch for payment intent
const mockFetch = vi.fn()
global.fetch = mockFetch

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
function CartLoader({ items }: { items: typeof mockCartItems }) {
  const dispatch = useCartDispatch()
  
  // Add items on mount
  React.useEffect(() => {
    items.forEach(item => {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          productId: item.productId,
          sizeId: item.sizeId,
          frameId: item.frameId,
          title: item.title,
          artist: item.artist,
          image: item.image
        }
      })
    })
  }, [dispatch, items])
  
  return null
}

import React from 'react'

// Test wrapper
function TestWrapper({ 
  children, 
  initialRoute = '/checkout',
  cartItems = []
}: { 
  children: ReactNode
  initialRoute?: string
  cartItems?: typeof mockCartItems
}) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        <CartLoader items={cartItems} />
        <Routes>
          <Route path="/checkout" element={children} />
          <Route path="/product/:id" element={<div>Product Page</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
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

    it('should not fetch payment intent for empty cart', async () => {
      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      })
      
      expect(mockFetch).not.toHaveBeenCalled()
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

    it('should render checkout heading', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
      })
    })

    it('should show order summary heading', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Order Summary' })).toBeInTheDocument()
      })
    })

    it('should show payment heading', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Payment' })).toBeInTheDocument()
      })
    })

    it('should display cart item title', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Test Artwork')).toBeInTheDocument()
      })
    })

    it('should display item price', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('$45')).toBeInTheDocument()
      })
    })

    it('should display item size and frame', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/8" × 10"/)).toBeInTheDocument()
        expect(screen.getByText(/Matte Black/)).toBeInTheDocument()
      })
    })

    it('should display quantity', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Qty: 1/)).toBeInTheDocument()
      })
    })

    it('should display total', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        // Total label and amount
        expect(screen.getByText('Total')).toBeInTheDocument()
      })
    })

    it('should use optimized image URLs', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        const img = screen.getByRole('img', { name: 'Test Artwork' })
        expect(img.getAttribute('src')).toContain('cloudinary')
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

    it('should show loading while fetching payment intent', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        // Should show loading spinner
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
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

    it('should render Payment Element', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('payment-element')).toBeInTheDocument()
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
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
      })
    })

    it('should render email label', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Email for receipt')).toBeInTheDocument()
      })
    })

    it('should render pay button with total', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Pay \$/ })).toBeInTheDocument()
      })
    })

    it('should show secured by Stripe message', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Secured by Stripe/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    const testItems = [createMockCartItem()]

    it('should render back to shop link', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Back to shop/i })).toBeInTheDocument()
      })
    })

    it('should link back to home', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /Back to shop/i })
        expect(backLink).toHaveAttribute('href', '/')
      })
    })

    it('should link product title to product page', async () => {
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        const productLink = screen.getByRole('link', { name: 'Test Artwork' })
        expect(productLink.getAttribute('href')).toContain('/product/')
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

    it('should show payment successful message', async () => {
      render(
        <TestWrapper initialRoute="/checkout?success=true">
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText(/Your payment was successful/)).toBeInTheDocument()
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

  describe('Multiple Items', () => {
    const multipleItems = [
      createMockCartItem({
        productId: 'product-1',
        title: 'First Artwork',
        sizeId: '8x10',
        frameId: 'black',
        price: 45
      }),
      createMockCartItem({
        productId: 'product-2',
        title: 'Second Artwork',
        sizeId: '24x30',
        frameId: 'gold',
        price: 170
      })
    ]

    it('should display all items', async () => {
      render(
        <TestWrapper cartItems={multipleItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('First Artwork')).toBeInTheDocument()
        expect(screen.getByText('Second Artwork')).toBeInTheDocument()
      })
    })

    it('should calculate correct total', async () => {
      render(
        <TestWrapper cartItems={multipleItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        // $45 + $170 = $215
        expect(screen.getByText('$215')).toBeInTheDocument()
      })
    })
  })

  describe('Frame Color Indicator', () => {
    it('should show frame color indicator', async () => {
      const testItems = [createMockCartItem({
        frameId: 'gold'
      })]
      
      render(
        <TestWrapper cartItems={testItems}>
          <Checkout />
        </TestWrapper>
      )
      
      await waitFor(() => {
        // Check for Antique Gold frame text
        expect(screen.getByText(/Antique Gold/)).toBeInTheDocument()
      })
    })
  })
})
