import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductCard from './ProductCard'

// Mock Cloudinary environment
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

const mockProduct = {
  id: 'test-artwork-1',
  title: 'The Gulf Stream',
  artist: 'Winslow Homer',
  year: '1899',
  origin: 'United States',
  medium: 'Oil on canvas',
  image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
  description: 'A powerful seascape',
  tags: ['painting', 'seascape'],
  museum: 'SAAM'
}

function renderProductCard(props: { product?: typeof mockProduct; priority?: boolean } = {}) {
  const { product = mockProduct, priority = false } = props
  return render(
    <BrowserRouter>
      <ProductCard product={product} priority={priority} />
    </BrowserRouter>
  )
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render product title', () => {
      renderProductCard()
      expect(screen.getByText('The Gulf Stream')).toBeInTheDocument()
    })

    it('should render product artist', () => {
      renderProductCard()
      expect(screen.getByText('Winslow Homer')).toBeInTheDocument()
    })

    it('should render starting price', () => {
      const { container } = renderProductCard()
      const priceSpan = container.querySelector('.font-semibold')
      expect(priceSpan?.textContent).toContain('45')
    })

    it('should render product image', () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      expect(img).toBeInTheDocument()
    })
  })

  describe('image optimization', () => {
    it('should use Cloudinary URL for image', () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('src')).toContain('res.cloudinary.com')
    })

    it('should use 400px thumbnail size', () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('src')).toContain('w_400')
    })

    it('should include auto quality transform', () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('src')).toContain('q_auto')
    })

    it('should include auto format transform', () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('src')).toContain('f_auto')
    })
  })

  describe('navigation', () => {
    it('should link to product page', () => {
      renderProductCard()
      const link = screen.getByRole('link')
      expect(link.getAttribute('href')).toContain('/product/')
    })

    it('should encode product ID in URL', () => {
      renderProductCard()
      const link = screen.getByRole('link')
      expect(link.getAttribute('href')).toBe('/product/test-artwork-1')
    })
  })

  describe('image loading states', () => {
    it('should have eager loading for priority images', () => {
      renderProductCard({ priority: true })
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('loading')).toBe('eager')
      expect(img.getAttribute('fetchpriority')).toBe('high')
    })

    it('should have lazy loading for non-priority images', () => {
      renderProductCard({ priority: false })
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('loading')).toBe('lazy')
      expect(img.getAttribute('fetchpriority')).toBe('auto')
    })

    it('should have async decoding attribute', () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('decoding')).toBe('async')
    })
  })

  describe('error handling', () => {
    it('should show unavailable text on image error', async () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      
      // Trigger error twice (first tries fallback, second shows error)
      fireEvent.error(img)
      fireEvent.error(img)
      
      await waitFor(() => {
        expect(screen.getByText('Unavailable')).toBeInTheDocument()
      })
    })

    it('should try fallback URL on first error', async () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      const originalSrc = img.getAttribute('src')
      
      fireEvent.error(img)
      
      await waitFor(() => {
        const newSrc = img.getAttribute('src')
        expect(newSrc).not.toBe(originalSrc)
        expect(newSrc).toContain('ids.si.edu')
      })
    })
  })

  describe('skeleton loading', () => {
    it('should show skeleton when not loaded', () => {
      const { container } = renderProductCard({ priority: false })
      expect(container.querySelector('.skeleton-pulse')).toBeInTheDocument()
    })

    it('should hide image until loaded', () => {
      renderProductCard({ priority: false })
      const img = screen.getByAltText('The Gulf Stream')
      expect(img).toHaveStyle({ opacity: '0' })
    })
  })

  describe('hover state', () => {
    it('should have View Print overlay', () => {
      renderProductCard()
      expect(screen.getByText('View Print')).toBeInTheDocument()
    })
  })
})
