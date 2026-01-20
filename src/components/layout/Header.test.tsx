import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Header from './Header'
import { CartProvider, useCartDispatch } from '../../context/CartContext'
import { useEffect, type ReactNode } from 'react'

// Helper to wrap with providers
function renderHeader(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CartProvider>
        <Header />
      </CartProvider>
    </MemoryRouter>
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
    it('should render store name on larger screens', () => {
      renderHeader()
      expect(screen.getByText('Gallery Store')).toBeInTheDocument()
    })

    it('should render tagline', () => {
      renderHeader()
      expect(screen.getByText('Smithsonian Collection')).toBeInTheDocument()
    })

    it('should link logo to home page', () => {
      renderHeader()
      const logoLink = screen.getByRole('link', { name: /gallery store/i })
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Navigation Links', () => {
    it('should render Collection link', () => {
      renderHeader()
      expect(screen.getByRole('link', { name: 'Collection' })).toBeInTheDocument()
    })

    it('should render About link', () => {
      renderHeader()
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    })

    it('should link Collection to home page', () => {
      renderHeader()
      const collectionLink = screen.getByRole('link', { name: 'Collection' })
      expect(collectionLink).toHaveAttribute('href', '/')
    })

    it('should link About to about page', () => {
      renderHeader()
      const aboutLink = screen.getByRole('link', { name: 'About' })
      expect(aboutLink).toHaveAttribute('href', '/about')
    })
  })

  describe('Mobile Hamburger Menu', () => {
    it('should render hamburger button', () => {
      renderHeader()
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
    })

    it('should toggle menu on click', () => {
      renderHeader()
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })

      // Initially closed
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument()

      // Open menu
      fireEvent.click(hamburgerButton)
      expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument()

      // Close menu
      fireEvent.click(screen.getByRole('button', { name: /close menu/i }))
      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument()
    })

    it('should show Collection and About links in mobile menu', () => {
      renderHeader()
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      fireEvent.click(hamburgerButton)

      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i })
      expect(mobileNav).toContainElement(screen.getAllByText('Collection')[1])
      expect(mobileNav).toContainElement(screen.getAllByText('About')[1])
    })

    it('should close menu when link is clicked', () => {
      renderHeader()
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      fireEvent.click(hamburgerButton)

      const mobileLinks = screen.getAllByRole('link', { name: 'Collection' })
      fireEvent.click(mobileLinks[mobileLinks.length - 1]) // Click mobile link

      expect(screen.queryByRole('navigation', { name: /mobile navigation/i })).not.toBeInTheDocument()
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
        <MemoryRouter>
          <CartProvider>
            <HeaderWithCartHelper>
              <Header />
            </HeaderWithCartHelper>
          </CartProvider>
        </MemoryRouter>
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
