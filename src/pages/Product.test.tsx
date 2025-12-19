import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Product from './Product'
import { CartProvider } from '../context/CartContext'

// Mock Cloudinary environment
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock product for router state
const mockProduct = {
  id: 'test-artwork-1',
  title: 'The Gulf Stream',
  artist: 'Winslow Homer',
  year: '1899',
  origin: 'United States',
  medium: 'Oil on canvas',
  image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
  description: 'A dramatic seascape painting',
  tags: ['oil painting', 'seascape'],
  museum: 'SAAM',
  accession_number: '1967.66.3'
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
      accession_number: '1967.66.3'
    }
  ]
}

interface RenderOptions {
  state?: {
    product?: typeof mockProduct
    artistId?: string
    selectedSizeId?: string
    selectedFrameId?: string
  } | null
  route?: string
}

function renderProduct(options: RenderOptions = {}) {
  const { state = { product: mockProduct, artistId: 'winslow-homer' }, route = '/product/test-artwork-1' } = options
  
  return render(
    <MemoryRouter initialEntries={[{ pathname: route, state }]}>
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={<Product />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  )
}

describe('Product', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockArtworkResponse)
    })
  })

  describe('with router state', () => {
    it('should render product title', () => {
      renderProduct()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Gulf Stream')
    })

    it('should render artist name', () => {
      renderProduct()
      expect(screen.getByText('Winslow Homer')).toBeInTheDocument()
    })

    it('should render product description', () => {
      renderProduct()
      expect(screen.getByText('A dramatic seascape painting')).toBeInTheDocument()
    })

    it('should not fetch when router state provided', () => {
      renderProduct()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('direct URL access', () => {
    it('should show loading initially', () => {
      renderProduct({ state: null })
      expect(screen.getByText('Loading artwork...')).toBeInTheDocument()
    })

    it('should show not found for invalid product', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ artworks: [] })
      })
      
      renderProduct({ state: null, route: '/product/invalid-id' })
      
      await waitFor(() => {
        expect(screen.getByText('Product not found')).toBeInTheDocument()
      })
    })
  })

  describe('size selection', () => {
    it('should render size dropdown', () => {
      renderProduct()
      expect(screen.getByText('Print Size')).toBeInTheDocument()
    })

    it('should have all size options', () => {
      renderProduct()
      expect(screen.getByRole('option', { name: /8" × 10"/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /11" × 14"/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /16" × 20"/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /24" × 30"/ })).toBeInTheDocument()
    })

    it('should update price on size change', () => {
      renderProduct()
      
      // Default 8x10 = $45
      expect(screen.getByText('$45')).toBeInTheDocument()
      
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: '24x30' } })
      
      expect(screen.getByText('$145')).toBeInTheDocument()
    })
  })

  describe('frame selection', () => {
    it('should render frame dropdown', () => {
      renderProduct()
      expect(screen.getByText('Frame Style')).toBeInTheDocument()
    })

    it('should have all frame options', () => {
      renderProduct()
      expect(screen.getByRole('option', { name: /Matte Black/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Natural Oak/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Rich Walnut/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Antique Gold/ })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Gallery White/ })).toBeInTheDocument()
    })

    it('should update price on frame change', () => {
      renderProduct()
      
      // Default 8x10 ($45) + black ($0) = $45
      expect(screen.getByText('$45')).toBeInTheDocument()
      
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'gold' } })
      
      // 8x10 ($45) + gold ($25) = $70
      expect(screen.getByText('$70')).toBeInTheDocument()
    })
  })

  describe('add to cart', () => {
    it('should render Add to Cart button', () => {
      renderProduct()
      expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument()
    })

    it('should show confirmation after adding', async () => {
      renderProduct()
      
      fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))
      
      await waitFor(() => {
        expect(screen.getByText(/Added to Cart/)).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('should render back to gallery link', () => {
      renderProduct()
      expect(screen.getByRole('link', { name: /Back to gallery/i })).toBeInTheDocument()
    })

    it('should link to correct artist gallery', () => {
      renderProduct()
      const link = screen.getByRole('link', { name: /Back to gallery/i })
      expect(link.getAttribute('href')).toBe('/?artist=winslow-homer')
    })
  })

  describe('image display', () => {
    it('should render product images', () => {
      renderProduct()
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })

    it('should use Cloudinary URLs', () => {
      renderProduct()
      const images = screen.getAllByRole('img')
      const cloudinaryImage = images.find(img => img.getAttribute('src')?.includes('cloudinary'))
      expect(cloudinaryImage).toBeTruthy()
    })

    it('should show click to enlarge hint', () => {
      renderProduct()
      expect(screen.getByText('Click image to enlarge')).toBeInTheDocument()
    })
  })

  describe('product details', () => {
    it('should show artwork details section', () => {
      renderProduct()
      expect(screen.getByRole('heading', { name: 'Artwork Details' })).toBeInTheDocument()
    })

    it('should show about this print section', () => {
      renderProduct()
      expect(screen.getByRole('heading', { name: 'About This Print' })).toBeInTheDocument()
    })

    it('should show year and medium', () => {
      renderProduct()
      expect(screen.getByText('1899')).toBeInTheDocument()
      expect(screen.getByText('Oil on canvas')).toBeInTheDocument()
    })

    it('should have Smithsonian link', () => {
      renderProduct()
      const link = screen.getByRole('link', { name: /View original on Smithsonian/i })
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('should show shipping info', () => {
      renderProduct()
      expect(screen.getByText(/Free shipping on orders over \$100/i)).toBeInTheDocument()
    })
  })

  describe('pre-selected options', () => {
    it('should respect pre-selected size from cart', () => {
      renderProduct({
        state: {
          product: mockProduct,
          artistId: 'winslow-homer',
          selectedSizeId: '24x30',
          selectedFrameId: 'black'
        }
      })
      
      expect(screen.getByText('$145')).toBeInTheDocument()
    })

    it('should respect pre-selected frame from cart', () => {
      renderProduct({
        state: {
          product: mockProduct,
          artistId: 'winslow-homer',
          selectedSizeId: '8x10',
          selectedFrameId: 'gold'
        }
      })
      
      expect(screen.getByText('$70')).toBeInTheDocument()
    })
  })

  describe('tags', () => {
    it('should render product tags', () => {
      renderProduct()
      expect(screen.getByText('oil painting')).toBeInTheDocument()
      expect(screen.getByText('seascape')).toBeInTheDocument()
    })
  })
})
