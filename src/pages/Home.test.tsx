import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import { CartProvider } from '../context/CartContext'
import type { ReactNode } from 'react'
import * as shopifyApi from '../data/shopify-api'

// Mock Cloudinary
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Mock Shopify API
vi.mock('../data/shopify-api', () => ({
  fetchCollections: vi.fn(),
  fetchCollectionProducts: vi.fn(),
  fetchShopifyProducts: vi.fn(),
  shopifyConfig: { isConfigured: true }
}))

// Test wrapper
function TestWrapper({ children, initialRoute = '/' }: { children: ReactNode; initialRoute?: string }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        {children}
      </CartProvider>
    </MemoryRouter>
  )
}

// Mock collections data
const mockCollections = [
  { id: 'gid://shopify/Collection/1', handle: 'winslow-homer', title: 'Winslow Homer', description: 'American artist', productsCount: 9 },
  { id: 'gid://shopify/Collection/2', handle: 'mary-cassatt', title: 'Mary Cassatt', description: 'Impressionist painter', productsCount: 4 },
  { id: 'gid://shopify/Collection/3', handle: 'thomas-cole', title: 'Thomas Cole', description: 'Hudson River School', productsCount: 4 }
]

// Mock products data
const mockProducts = [
  {
    id: 'the-gulf-stream',
    title: 'The Gulf Stream',
    artist: 'Winslow Homer',
    year: 'Contemporary',
    origin: 'Shopify Store',
    medium: 'Print',
    image: 'https://cdn.shopify.com/test/gulf-stream.jpg',
    description: 'A dramatic seascape',
    tags: ['seascape'],
    priceRange: { minPrice: '45', maxPrice: '195' },
    variants: [{ id: 'gid://shopify/ProductVariant/1', title: '8×10 / Unframed', price: '45', availableForSale: true, selectedOptions: [] }]
  },
  {
    id: 'breezing-up',
    title: 'Breezing Up',
    artist: 'Winslow Homer',
    year: 'Contemporary',
    origin: 'Shopify Store',
    medium: 'Print',
    image: 'https://cdn.shopify.com/test/breezing-up.jpg',
    description: 'A sailing scene',
    tags: ['sailing'],
    priceRange: { minPrice: '45', maxPrice: '195' },
    variants: [{ id: 'gid://shopify/ProductVariant/2', title: '8×10 / Unframed', price: '45', availableForSale: true, selectedOptions: [] }]
  }
]

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementations
    vi.mocked(shopifyApi.fetchCollections).mockResolvedValue(mockCollections)
    vi.mocked(shopifyApi.fetchShopifyProducts).mockResolvedValue(mockProducts)
    vi.mocked(shopifyApi.fetchCollectionProducts).mockResolvedValue(mockProducts)
  })

  describe('Initial Render', () => {
    it('should render All Prints heading by default', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('All Prints')
      })
    })

    it('should show default description', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        // Text appears in both header and footer
        const elements = screen.getAllByText('Museum-quality prints from the Smithsonian')
        expect(elements.length).toBeGreaterThan(0)
      })
    })

    it('should fetch collections on mount', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(shopifyApi.fetchCollections).toHaveBeenCalled()
      })
    })

    it('should fetch all products on mount', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(shopifyApi.fetchShopifyProducts).toHaveBeenCalled()
      })
    })
  })

  describe('Collection Selection', () => {
    it('should render artist dropdown', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        const select = screen.getByRole('combobox')
        expect(select).toBeInTheDocument()
      })
    })

    it('should have All Artists option', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'All Artists' })).toBeInTheDocument()
      })
    })

    it('should show collections in dropdown', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Winslow Homer/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Mary Cassatt/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Thomas Cole/ })).toBeInTheDocument()
      })
    })

    it('should change heading when collection selected', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('All Prints')
      })

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'winslow-homer' } })

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Winslow Homer')
      })
    })

    it('should fetch collection products when collection selected', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'winslow-homer' } })

      await waitFor(() => {
        expect(shopifyApi.fetchCollectionProducts).toHaveBeenCalledWith('winslow-homer')
      })
    })
  })

  describe('Product Grid', () => {
    it('should render products after loading', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('The Gulf Stream')).toBeInTheDocument()
        expect(screen.getByText('Breezing Up')).toBeInTheDocument()
      })
    })

    it('should show product count badge', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('2 prints')).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loaders while loading', async () => {
      // Delay the response to catch loading state
      vi.mocked(shopifyApi.fetchShopifyProducts).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockProducts), 100))
      )

      const { container } = render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      // Should show skeleton pulse elements
      expect(container.querySelector('.skeleton-pulse')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      vi.mocked(shopifyApi.fetchShopifyProducts).mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to load artwork. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show Try Again button on error', async () => {
      vi.mocked(shopifyApi.fetchShopifyProducts).mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no products found', async () => {
      vi.mocked(shopifyApi.fetchShopifyProducts).mockResolvedValue([])

      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/No artwork found/)).toBeInTheDocument()
      })
    })
  })

  describe('Footer', () => {
    it('should render footer with store name', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Gallery Store')).toBeInTheDocument()
      })
    })

    it('should have Smithsonian Open Access link', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Smithsonian Open Access' })
        expect(link).toHaveAttribute('href', 'https://www.si.edu/openaccess')
      })
    })

    it('should show free shipping message', async () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Free shipping on orders $100+')).toBeInTheDocument()
      })
    })
  })

  describe('URL State', () => {
    it('should load collection from URL param', async () => {
      render(
        <TestWrapper initialRoute="/?collection=winslow-homer">
          <Home />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Winslow Homer')
      })
    })
  })
})
