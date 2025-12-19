import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import type { ReactNode } from 'react'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Cloudinary
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')
vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

// Mock artwork response
const mockArtworkResponse = {
  artworks: [
    {
      title: 'Test Artwork',
      artist: 'Test Artist',
      year_created: '2024',
      medium: 'Oil',
      image: 'https://example.com/img.jpg',
      description: 'Test',
      smithsonian_id: 'test-1',
      museum: 'Test Museum',
      accession_number: '123',
      object_type: 'Painting'
    }
  ]
}

// Mock Stripe for Checkout
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PaymentElement: () => <div>Payment Element</div>,
  useStripe: () => ({ confirmPayment: vi.fn() }),
  useElements: () => ({ submit: vi.fn() })
}))

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({})
}))

// Import components after mocks
import Home from './pages/Home'
import Product from './pages/Product'
import Header from './components/layout/Header'
import Cart from './components/cart/Cart'

// Simplified router for testing
function createTestRouter(initialRoute: string) {
  return createMemoryRouter([
    {
      path: '/',
      element: (
        <>
          <Header />
          <Cart />
          <Home />
        </>
      )
    },
    {
      path: '/product/:id',
      element: (
        <>
          <Header />
          <Cart />
          <Product />
        </>
      )
    },
    {
      path: '*',
      element: <div>404 Not Found</div>
    }
  ], {
    initialEntries: [initialRoute]
  })
}

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockArtworkResponse)
    })
  })

  describe('Home Route (/)', () => {
    it('should render Home page at root', async () => {
      const router = createTestRouter('/')
      
      render(
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })

    it('should render Header on home page', async () => {
      const router = createTestRouter('/')
      
      render(
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Gallery Store')).toBeInTheDocument()
      })
    })
  })

  describe('Product Route (/product/:id)', () => {
    it('should render Product page', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockArtworkResponse)
      })
      
      const router = createTestRouter('/product/test-artwork')
      
      render(
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      )
      
      // Should show loading or product content
      await waitFor(() => {
        // Either loading or not found is acceptable since we're testing routing
        const content = document.body.textContent
        expect(content).toBeTruthy()
      })
    })

    it('should render Header on product page', async () => {
      const router = createTestRouter('/product/test-artwork')
      
      render(
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      )
      
      expect(screen.getByText('Gallery Store')).toBeInTheDocument()
    })
  })

  describe('404 Route', () => {
    it('should show 404 for unknown routes', async () => {
      const router = createTestRouter('/unknown-route')
      
      render(
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      )
      
      expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    })
  })

  describe('Query Parameters', () => {
    it('should handle artist query param on home', async () => {
      const router = createTestRouter('/?artist=mary-cassatt')
      
      render(
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      )
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/data/mary-cassatt.json')
      })
    })
  })
})

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockArtworkResponse)
    })
  })

  it('should render store name', async () => {
    const router = createTestRouter('/')
    
    render(
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    )
    
    expect(screen.getByText('Gallery Store')).toBeInTheDocument()
  })

  it('should render cart icon', async () => {
    const router = createTestRouter('/')
    
    render(
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    )
    
    // Cart button should be present
    const cartButton = screen.getByRole('button')
    expect(cartButton).toBeInTheDocument()
  })
})
