import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Product from './Product'
import { CartProvider } from '../context/CartContext'
import type { ReactNode } from 'react'
import * as shopifyApi from '../data/shopify-api'

// Mock Cloudinary
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Mock Shopify API
vi.mock('../data/shopify-api', () => ({
  fetchShopifyProduct: vi.fn(),
  shopifyConfig: { isConfigured: true }
}))

// Test wrapper with route
function TestWrapper({
  children,
  initialRoute = '/product/the-gulf-stream',
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

// Mock product with Shopify variants
const mockProduct = {
  id: 'the-gulf-stream',
  title: 'The Gulf Stream',
  artist: 'Winslow Homer',
  year: '1899',
  origin: 'United States',
  medium: 'Oil on canvas',
  image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
  description: 'A dramatic seascape painting',
  tags: ['seascape', 'maritime'],
  museum: 'Smithsonian American Art Museum',
  accession_number: 'saam_1967.66.3',
  options: [
    { name: 'Size', values: ['8×10', '11×14', '16×20', '24×30'] },
    { name: 'Frame', values: ['Unframed', 'Black Frame', 'White Frame', 'Natural Wood'] }
  ],
  variants: [
    { id: 'gid://shopify/ProductVariant/1', title: '8×10 / Unframed', price: '45', availableForSale: true, selectedOptions: [{ name: 'Size', value: '8×10' }, { name: 'Frame', value: 'Unframed' }] },
    { id: 'gid://shopify/ProductVariant/2', title: '8×10 / Black Frame', price: '75', availableForSale: true, selectedOptions: [{ name: 'Size', value: '8×10' }, { name: 'Frame', value: 'Black Frame' }] },
    { id: 'gid://shopify/ProductVariant/3', title: '24×30 / Unframed', price: '145', availableForSale: true, selectedOptions: [{ name: 'Size', value: '24×30' }, { name: 'Frame', value: 'Unframed' }] },
    { id: 'gid://shopify/ProductVariant/4', title: '24×30 / Black Frame', price: '195', availableForSale: true, selectedOptions: [{ name: 'Size', value: '24×30' }, { name: 'Frame', value: 'Black Frame' }] }
  ],
  priceRange: { minPrice: '45', maxPrice: '195' }
}

describe('Product Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(shopifyApi.fetchShopifyProduct).mockResolvedValue(mockProduct)
  })

  describe('With Router State (from navigation)', () => {
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

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Gulf Stream')
    })

    it('should render artist name', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByText('Winslow Homer')).toBeInTheDocument()
    })

    it('should render product description', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByText('A dramatic seascape painting')).toBeInTheDocument()
    })

    it('should not fetch when router state has variants', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(shopifyApi.fetchShopifyProduct).not.toHaveBeenCalled()
    })
  })

  describe('Direct URL Access (no router state)', () => {
    it('should fetch product by handle', async () => {
      render(
        <TestWrapper initialRoute="/product/the-gulf-stream">
          <Product />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(shopifyApi.fetchShopifyProduct).toHaveBeenCalledWith('the-gulf-stream')
      })
    })

    it('should show not found for invalid handle', async () => {
      vi.mocked(shopifyApi.fetchShopifyProduct).mockResolvedValue(null)

      render(
        <TestWrapper initialRoute="/product/invalid-product">
          <Product />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Product not found')).toBeInTheDocument()
      })
    })

    it('should show return to gallery link on not found', async () => {
      vi.mocked(shopifyApi.fetchShopifyProduct).mockResolvedValue(null)

      render(
        <TestWrapper initialRoute="/product/invalid-product">
          <Product />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Return to gallery/i })).toBeInTheDocument()
      })
    })
  })

  describe('Size Selection', () => {
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render size dropdown label', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByText('Print Size')).toBeInTheDocument()
    })

    it('should have size options from Shopify', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByRole('option', { name: '8×10' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '11×14' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '16×20' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '24×30' })).toBeInTheDocument()
    })

    it('should update price when size changes', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      // Default is 8×10 / Unframed = $45
      expect(screen.getByText('$45')).toBeInTheDocument()

      // Find size select (first combobox)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: '24×30' } })

      // 24×30 / Unframed = $145
      expect(screen.getByText('$145')).toBeInTheDocument()
    })
  })

  describe('Frame Selection', () => {
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render frame dropdown label', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByText('Frame Style')).toBeInTheDocument()
    })

    it('should have frame options from Shopify', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByRole('option', { name: 'Unframed' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Black Frame' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'White Frame' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Natural Wood' })).toBeInTheDocument()
    })

    it('should update price when frame changes', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      // Default is 8×10 / Unframed = $45
      expect(screen.getByText('$45')).toBeInTheDocument()

      // Find frame select (second combobox)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[1], { target: { value: 'Black Frame' } })

      // 8×10 / Black Frame = $75
      expect(screen.getByText('$75')).toBeInTheDocument()
    })
  })

  describe('Add to Cart', () => {
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
  })

  describe('Navigation', () => {
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render back to gallery link', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByRole('link', { name: /Back to gallery/i })).toBeInTheDocument()
    })
  })

  describe('Image Display', () => {
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

  describe('Product Details Section', () => {
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

      expect(screen.getByText('1899')).toBeInTheDocument()
      expect(screen.getByText('Oil on canvas')).toBeInTheDocument()
    })

    it('should have link to Smithsonian', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      const smithsonianLink = screen.getByRole('link', { name: /View original on Smithsonian/i })
      expect(smithsonianLink).toHaveAttribute('target', '_blank')
    })

    it('should show shipping info', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByText(/Free shipping on orders over \$100/i)).toBeInTheDocument()
    })
  })

  describe('Tags', () => {
    const routerState = { product: mockProduct, artistId: 'winslow-homer' }

    it('should render product tags', () => {
      render(
        <TestWrapper state={routerState}>
          <Product />
        </TestWrapper>
      )

      expect(screen.getByText('seascape')).toBeInTheDocument()
      expect(screen.getByText('maritime')).toBeInTheDocument()
    })
  })
})
