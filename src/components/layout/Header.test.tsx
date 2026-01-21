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
      // Collection is now a simple link, not a dropdown
      expect(screen.getAllByRole('link', { name: 'Collection' }).length).toBeGreaterThan(0)
    })

    it('should render About link', () => {
      renderHeader()
      // Multiple links exist (desktop + mobile), check at least one exists
      expect(screen.getAllByRole('link', { name: 'About' }).length).toBeGreaterThan(0)
    })

    it('should link Collection to collections page', () => {
      renderHeader()
      const collectionLinks = screen.getAllByRole('link', { name: 'Collection' })
      expect(collectionLinks[0]).toHaveAttribute('href', '/collections')
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

    it('should show Collection and About in mobile menu', () => {
      renderHeader()
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      fireEvent.click(hamburgerButton)

      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i })
      // Collection is a button (dropdown toggle) and About is a link in mobile menu
      const collectionButtons = screen.getAllByRole('button', { name: 'Collection' })
      expect(collectionButtons.length).toBeGreaterThan(0) // At least the mobile Collection button
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

    it('should open artist dropdown when Collection button is clicked', () => {
      renderHeader()
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      fireEvent.click(hamburgerButton)

      // Collection is now a button that toggles a dropdown
      const collectionButtons = screen.getAllByRole('button', { name: 'Collection' })
      const mobileCollectionButton = collectionButtons[collectionButtons.length - 1]
      fireEvent.click(mobileCollectionButton)

      // "All Artists" links should be visible (desktop + mobile dropdowns)
      const allArtistsLinks = screen.getAllByRole('link', { name: 'All Artists' })
      expect(allArtistsLinks.length).toBeGreaterThan(0)
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
