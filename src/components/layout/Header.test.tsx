import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from './Header'
import { CartProvider, useCartDispatch } from '../../context/CartContext'
import { useEffect, type ReactNode } from 'react'

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

function renderHeader(options: { withItem?: boolean } = {}) {
  const { withItem = false } = options
  
  if (withItem) {
    return render(
      <BrowserRouter>
        <CartProvider>
          <CartWithItem>
            <Header />
          </CartWithItem>
        </CartProvider>
      </BrowserRouter>
    )
  }
  
  return render(
    <BrowserRouter>
      <CartProvider>
        <Header />
      </CartProvider>
    </BrowserRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('branding', () => {
    it('should render store name', () => {
      renderHeader()
      expect(screen.getByText('Gallery Store')).toBeInTheDocument()
    })

    it('should render tagline', () => {
      renderHeader()
      expect(screen.getByText('Smithsonian Collection')).toBeInTheDocument()
    })

    it('should link logo to home page', () => {
      renderHeader()
      const link = screen.getByRole('link')
      expect(link.getAttribute('href')).toBe('/')
    })
  })

  describe('shipping badge', () => {
    it('should display free shipping message', () => {
      renderHeader()
      expect(screen.getByText('Free shipping $100+')).toBeInTheDocument()
    })
  })

  describe('cart button', () => {
    it('should render cart button with aria-label', () => {
      renderHeader()
      const button = screen.getByRole('button', { name: /shopping cart/i })
      expect(button).toBeInTheDocument()
      expect(button.getAttribute('aria-label')).toBe('Shopping cart')
    })

    it('should not show badge when cart is empty', () => {
      const { container } = renderHeader()
      const badge = container.querySelector('.absolute.-top-1.-right-1')
      expect(badge).not.toBeInTheDocument()
    })

    it('should show badge with count when cart has items', async () => {
      renderHeader({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument()
      })
    })
  })

  describe('layout', () => {
    it('should be sticky', () => {
      const { container } = renderHeader()
      const header = container.querySelector('header')
      expect(header?.classList.contains('sticky')).toBe(true)
    })

    it('should have z-index for layering', () => {
      const { container } = renderHeader()
      const header = container.querySelector('header')
      expect(header?.classList.contains('z-40')).toBe(true)
    })
  })
})
