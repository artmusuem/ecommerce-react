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
    it('should render Collections dropdown button', () => {
      renderHeader()
      // Collections is now a dropdown button, not a link
      expect(screen.getAllByRole('button', { name: 'Collections' }).length).toBeGreaterThan(0)
    })

    it('should render About link', () => {
      renderHeader()
      // Multiple links exist (desktop + mobile), check at least one exists
      expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(0)
    })

    it('should show All Collections link in dropdown', () => {
      renderHeader()
      // The "All Collections" link should exist in the dropdown
      expect(screen.getAllByRole('link', { name: 'All Collections' }).length).toBeGreaterThan(0)
    })

    it('should link About to about page', () => {
      renderHeader()
      const aboutLinks = screen.getAllByRole('link', { name: 'About' })
      expect(aboutLinks[0]).toHaveAttribute('href', '/about')
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

      // Initially closed - menu wrapper has opacity-0
      const menuWrapper = screen.getByRole('navigation', { name: /mobile navigation/i }).parentElement
      expect(menuWrapper).toHaveClass('opacity-0')

      // Open menu
      fireEvent.click(hamburgerButton)
      expect(menuWrapper).toHaveClass('opacity-100')

      // Close menu
      fireEvent.click(screen.getByRole('button', { name: /close menu/i }))
      expect(menuWrapper).toHaveClass('opacity-0')
    })

    it('should show Collections button and About link in mobile menu', () => {
      renderHeader()
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      fireEvent.click(hamburgerButton)

      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i })
      // Collections is now a button in mobile menu too
      expect(mobileNav).toContainElement(screen.getAllByText('Collections')[1])
      expect(mobileNav).toContainElement(screen.getAllByText('About')[1])
    })

    it('should close menu when About link is clicked', () => {
      renderHeader()
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      fireEvent.click(hamburgerButton)

      const mobileAboutLinks = screen.getAllByRole('link', { name: 'About' })
      const menuWrapper = screen.getByRole('navigation', { name: /mobile navigation/i }).parentElement
      fireEvent.click(mobileAboutLinks[mobileAboutLinks.length - 1]) // Click mobile About link

      // Menu should be closed (opacity-0 after animation)
      expect(menuWrapper).toHaveClass('opacity-0')
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
