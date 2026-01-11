import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from './Header'
import { CartProvider, useCartDispatch } from '../../context/CartContext'
import { useEffect, type ReactNode } from 'react'

// Helper to wrap with providers
function renderHeader() {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Header />
      </CartProvider>
    </BrowserRouter>
  )
}

// Helper component to add items to cart
function HeaderWithCartHelper({ children }: { children?: ReactNode }) {
  const dispatch = useCartDispatch()
  
  useEffect(() => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: 'test',
        variantId: 'gid://shopify/ProductVariant/12345',
        sizeId: '8x10',
        frameId: 'black',
        title: 'Test',
        artist: 'Artist',
        image: 'http://example.com/img.jpg',
        price: 45
      }
    })
  }, [dispatch])
  
  return <>{children}</>
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Logo and Branding', () => {
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
      const logoLink = screen.getByRole('link')
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Free Shipping Badge', () => {
    it('should display free shipping message', () => {
      renderHeader()
      expect(screen.getByText('Free shipping $100+')).toBeInTheDocument()
    })
  })

  describe('Cart Button', () => {
    it('should render cart button', () => {
      renderHeader()
      expect(screen.getByRole('button', { name: /shopping cart/i })).toBeInTheDocument()
    })

    it('should have accessible label', () => {
      renderHeader()
      const cartButton = screen.getByRole('button', { name: /shopping cart/i })
      expect(cartButton).toHaveAttribute('aria-label', 'Shopping cart')
    })
  })

  describe('Cart Integration', () => {
    it('should show badge with item count when cart has items', () => {
      render(
        <BrowserRouter>
          <CartProvider>
            <HeaderWithCartHelper>
              <Header />
            </HeaderWithCartHelper>
          </CartProvider>
        </BrowserRouter>
      )
      
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should be sticky positioned', () => {
      renderHeader()
      const header = document.querySelector('header')
      expect(header).toHaveClass('sticky')
      expect(header).toHaveClass('top-0')
    })

    it('should have proper z-index', () => {
      renderHeader()
      const header = document.querySelector('header')
      expect(header).toHaveClass('z-40')
    })
  })
})
