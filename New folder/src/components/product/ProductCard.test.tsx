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

function renderProductCard(product = mockProduct, index = 0) {
  return render(
    <BrowserRouter>
      <ProductCard product={product} index={index} />
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

    it('should render product year', () => {
      renderProductCard()
      expect(screen.getByText('1899')).toBeInTheDocument()
    })

    it('should render starting price', () => {
      const { container } = renderProductCard()
      // Price shows as "$ 45" split by whitespace
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
    it('should have lazy loading attribute', () => {
      renderProductCard()
      const img = screen.getByAltText('The Gulf Stream')
      expect(img.getAttribute('loading')).toBe('lazy')
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
        // Should switch to Smithsonian direct URL
        expect(newSrc).not.toBe(originalSrc)
        expect(newSrc).toContain('ids.si.edu')
      })
    })
  })

  describe('animation', () => {
    it('should have fade-in class', () => {
      renderProductCard()
      const link = screen.getByRole('link')
      expect(link.classList.contains('fade-in')).toBe(true)
    })
  })

  describe('hover state', () => {
    it('should have View Print overlay', () => {
      renderProductCard()
      expect(screen.getByText('View Print')).toBeInTheDocument()
    })
  })
})
