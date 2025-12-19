import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'
import { CartProvider, useCartDispatch } from '../../context/CartContext'

// Helper to wrap with providers
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <CartProvider>
        {ui}
      </CartProvider>
    </MemoryRouter>
  )
}

describe('Header', () => {
  describe('Logo and Branding', () => {
    it('should render store name', () => {
      renderWithProviders(<Header />)
      expect(screen.getByText('Gallery Store')).toBeInTheDocument()
    })

    it('should render tagline', () => {
      renderWithProviders(<Header />)
      expect(screen.getByText('Smithsonian Collection')).toBeInTheDocument()
    })

    it('should link logo to home page', () => {
      renderWithProviders(<Header />)
      const logoLink = screen.getByRole('link')
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Free Shipping Badge', () => {
    it('should display free shipping message', () => {
      renderWithProviders(<Header />)
      expect(screen.getByText('Free shipping $100+')).toBeInTheDocument()
    })
  })

  describe('Cart Button', () => {
    it('should render cart button', () => {
      renderWithProviders(<Header />)
      expect(screen.getByRole('button', { name: /shopping cart/i })).toBeInTheDocument()
    })

    it('should have accessible label', () => {
      renderWithProviders(<Header />)
      const cartButton = screen.getByRole('button', { name: /shopping cart/i })
      expect(cartButton).toHaveAttribute('aria-label', 'Shopping cart')
    })
  })

  describe('Cart Integration', () => {
    function HeaderWithCartItem() {
      const dispatch = useCartDispatch()
      return (
        <>
          <Header />
          <button 
            data-testid="add-item"
            onClick={() => dispatch({
              type: 'ADD_ITEM',
              payload: {
                productId: 'test',
                sizeId: '8x10',
                frameId: 'black',
                title: 'Test',
                artist: 'Artist',
                image: 'http://example.com/img.jpg'
              }
            })}
          >
            Add
          </button>
        </>
      )
    }

    it('should show badge with item count when cart has items', () => {
      render(
        <MemoryRouter>
          <CartProvider>
            <HeaderWithCartItem />
          </CartProvider>
        </MemoryRouter>
      )
      
      fireEvent.click(screen.getByTestId('add-item'))
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should update badge when multiple items added', () => {
      render(
        <MemoryRouter>
          <CartProvider>
            <HeaderWithCartItem />
          </CartProvider>
        </MemoryRouter>
      )
      
      fireEvent.click(screen.getByTestId('add-item'))
      fireEvent.click(screen.getByTestId('add-item'))
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should be sticky positioned', () => {
      renderWithProviders(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('sticky')
      expect(header).toHaveClass('top-0')
    })

    it('should have proper z-index', () => {
      renderWithProviders(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('z-40')
    })
  })
})
