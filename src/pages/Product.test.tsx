import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Product from './Product'
import { CartProvider } from '../context/CartContext'
import { mockProducts, createMockProduct } from '../test/mocks'
import type { ReactNode } from 'react'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Cloudinary
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Test wrapper with route
function TestWrapper({ 
  children, 
  initialRoute = '/product/test-artwork-1',
  state = null
}: { 
  children: ReactNode
  initialRoute?: string
  state?: unknown
}) {
  return (
    <MemoryRouter initialEntries={[{ pathname: initialRoute, state }]}>
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={children} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  )
}

// Mock artwork response for fetch
const mockArtworkResponse = {
  artworks: [
    {
      title: 'The Gulf Stream',
      artist: 'Homer, Winslow',
      year_created: '1899',
      medium: 'Oil on canvas',
      image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
      description: 'A dramatic seascape',
      smithsonian_id: 'saam-1967.66.3',
      museum: 'Smithsonian American Art Museum',
      accession_number: '1967.66.3',
      object_type: 'Painting'
    }
  ]
}

describe('Product Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockArtworkResponse)
    })
  })

  describe('With Router State (from navigation)', () => {
    const mockProduct = mockProducts[0]
    const routerState = {
      product: mockProduct,
      artistId: 'winslow-homer'
    }

    it('should render product title', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockProduct.title)
    })

    it('should render artist name', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText(mockProduct.artist)).toBeInTheDocument()
    })

    it('should render product description', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
    })

    it('should not fetch when router state provided', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Direct URL Access (no router state)', () => {
    it('should show loading state initially', () => {
      render(
        <TestWrapper initialRoute="/product/test-artwork-1">
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText('Loading artwork...')).toBeInTheDocument()
    })

    it('should fetch product by ID', async () => {
      render(
        <TestWrapper initialRoute="/product/art-0-the-gulf-stream">
          <Product />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })
    })

    it('should show not found for invalid ID', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ artworks: [] })
      })
      
      render(
        <TestWrapper initialRoute="/product/invalid-id">
          <Product />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Product not found')).toBeInTheDocument()
      })
    })

    it('should show return to gallery link on not found', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ artworks: [] })
      })
      
      render(
        <TestWrapper initialRoute="/product/invalid-id">
          <Product />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Return to gallery/i })).toBeInTheDocument()
      })
    })
  })

  describe('Size Selection', () => {
    const mockProduct = mockProducts[0]
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render size dropdown', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByLabelText(/Print Size/i)).toBeInTheDocument()
    })

    it('should have all size options', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByRole('option', { name: /8" × 10"/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /11" × 14"/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /16" × 20"/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /24" × 30"/ })).toBeInTheDocument()
    })

    it('should update price when size changes', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      // Default is 8x10 = $45
      expect(screen.getByText('$45')).toBeInTheDocument()
      
      // Change to 24x30 = $145
      const sizeSelect = screen.getByLabelText(/Print Size/i)
      fireEvent.change(sizeSelect, { target: { value: '24x30' } })
      
      expect(screen.getByText('$145')).toBeInTheDocument()
    })
  })

  describe('Frame Selection', () => {
    const mockProduct = mockProducts[0]
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render frame dropdown', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByLabelText(/Frame Style/i)).toBeInTheDocument()
    })

    it('should have all frame options', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByRole('option', { name: /Matte Black/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Natural Oak/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Rich Walnut/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Antique Gold/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Gallery White/ })).toBeInTheDocument()
    })

    it('should update price when frame changes', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      // Default is 8x10 ($45) + black ($0) = $45
      expect(screen.getByText('$45')).toBeInTheDocument()
      
      // Change to gold frame (+$25) = $70
      const frameSelect = screen.getByLabelText(/Frame Style/i)
      fireEvent.change(frameSelect, { target: { value: 'gold' } })
      
      expect(screen.getByText('$70')).toBeInTheDocument()
    })

    it('should show frame color preview', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText('Matte Black Frame')).toBeInTheDocument()
    })
  })

  describe('Add to Cart', () => {
    const mockProduct = mockProducts[0]
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render Add to Cart button', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument()
    })

    it('should show confirmation after adding', async () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      const addButton = screen.getByRole('button', { name: 'Add to Cart' })
      fireEvent.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Added to Cart/i)).toBeInTheDocument()
      })
    })

    it('should revert button text after timeout', async () => {
      vi.useFakeTimers()
      
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      const addButton = screen.getByRole('button', { name: 'Add to Cart' })
      fireEvent.click(addButton)
      
      expect(screen.getByText(/Added to Cart/i)).toBeInTheDocument()
      
      vi.advanceTimersByTime(2100)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument()
      })
      
      vi.useRealTimers()
    })
  })

  describe('Navigation', () => {
    const mockProduct = mockProducts[0]
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render back to gallery link', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByRole('link', { name: /Back to gallery/i })).toBeInTheDocument()
    })

    it('should link to correct artist gallery', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      const backLink = screen.getByRole('link', { name: /Back to gallery/i })
      expect(backLink).toHaveAttribute('href', '/?artist=winslow-homer')
    })
  })

  describe('Image Display', () => {
    const mockProduct = mockProducts[0]
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render product image', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should use Cloudinary URLs for images', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      const images = screen.getAllByRole('img')
      const cloudinaryImage = images.find(img => img.getAttribute('src')?.includes('cloudinary'))
      expect(cloudinaryImage).toBeTruthy()
    })

    it('should show click to enlarge hint', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText('Click image to enlarge')).toBeInTheDocument()
    })
  })

  describe('Lightbox', () => {
    const mockProduct = mockProducts[0]
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should open lightbox on image click', async () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      // Find the clickable image container
      const imageContainer = document.querySelector('.cursor-zoom-in')
      if (imageContainer) {
        fireEvent.click(imageContainer)
        
        await waitFor(() => {
          expect(screen.getByText(/Click outside image/i)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Product Details Section', () => {
    const mockProduct = mockProducts[0]
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should show artwork details heading', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByRole('heading', { name: 'Artwork Details' })).toBeInTheDocument()
    })

    it('should show about this print heading', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByRole('heading', { name: 'About This Print' })).toBeInTheDocument()
    })

    it('should show year and medium', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText(mockProduct.year)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.medium)).toBeInTheDocument()
    })

    it('should have link to Smithsonian', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      const smithsonianLink = screen.getByRole('link', { name: /View original on Smithsonian/i })
      expect(smithsonianLink).toHaveAttribute('href')
      expect(smithsonianLink).toHaveAttribute('target', '_blank')
    })

    it('should show shipping info', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText(/Free shipping on orders over \$100/i)).toBeInTheDocument()
      expect(screen.getByText(/Ships in 5-7 days/i)).toBeInTheDocument()
    })
  })

  describe('Pre-selected Options (from cart)', () => {
    const mockProduct = mockProducts[0]

    it('should respect pre-selected size from cart', () => {
      const routerState = {
        product: mockProduct,
        artistId: 'winslow-homer',
        selectedSizeId: '24x30',
        selectedFrameId: 'black'
      }
      
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      // Price should be $145 (24x30 base) + $0 (black frame)
      expect(screen.getByText('$145')).toBeInTheDocument()
    })

    it('should respect pre-selected frame from cart', () => {
      const routerState = {
        product: mockProduct,
        artistId: 'winslow-homer',
        selectedSizeId: '8x10',
        selectedFrameId: 'gold'
      }
      
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      // Price should be $45 (8x10 base) + $25 (gold frame) = $70
      expect(screen.getByText('$70')).toBeInTheDocument()
    })
  })

  describe('Tags', () => {
    it('should render product tags', () => {
      const productWithTags = createMockProduct({
        tags: ['oil painting', 'seascape', 'maritime']
      })
      const routerState = {
        product: productWithTags,
        artistId: 'winslow-homer'
      }
      
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )
      
      expect(screen.getByText('oil painting')).toBeInTheDocument()
      expect(screen.getByText('seascape')).toBeInTheDocument()
      expect(screen.getByText('maritime')).toBeInTheDocument()
    })
  })
})
