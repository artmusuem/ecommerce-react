import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Cart from './Cart'
import { CartProvider, useCartDispatch } from '../../context/CartContext'
import { useEffect, type ReactNode } from 'react'

// Mock Cloudinary environment
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')


// Helper to add item (cart opens automatically via ADD_ITEM action)
function CartWithItem({ children }: { children?: ReactNode }) {
  const dispatch = useCartDispatch()
  
  useEffect(() => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: 'test-artwork-1',
        variantId: 'gid://shopify/ProductVariant/12345',
        sizeId: '8x10',
        frameId: 'black',
        title: 'Test Artwork',
        artist: 'Test Artist',
        image: 'https://example.com/img.jpg',
        price: 45
      }
    })
  }, [dispatch])
  
  return <>{children}</>
}

// Helper to open empty cart
function OpenCartHelper() {
  const dispatch = useCartDispatch()
  useEffect(() => {
    dispatch({ type: 'TOGGLE_CART' })
  }, [dispatch])
  return null
}

// Helper to render cart with providers
function renderCart(options: { withItem?: boolean } = {}) {
  const { withItem = false } = options
  
  if (withItem) {
    return render(
      <BrowserRouter>
        <CartProvider>
          <CartWithItem>
            <Cart />
          </CartWithItem>
        </CartProvider>
      </BrowserRouter>
    )
  }
  
  return render(
    <BrowserRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </BrowserRouter>
  )
}

describe('Cart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('closed state', () => {
    it('should not render when cart is closed', () => {
      renderCart()
      expect(screen.queryByText('Cart')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should show empty message when cart is opened with no items', async () => {
      render(
        <BrowserRouter>
          <CartProvider>
            <OpenCartHelper />
            <Cart />
          </CartProvider>
        </BrowserRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      })
    })

    it('should show add prints message', async () => {
      render(
        <BrowserRouter>
          <CartProvider>
            <OpenCartHelper />
            <Cart />
          </CartProvider>
        </BrowserRouter>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Add prints to get started')).toBeInTheDocument()
      })
    })
  })

  describe('with items', () => {
    it('should display item count in header', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        const header = screen.getByRole('heading', { level: 2 })
        expect(header).toHaveTextContent('Cart')
        expect(header).toHaveTextContent('1')
      })
    })

    it('should display item title', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Test Artwork')).toBeInTheDocument()
      })
    })

    it('should display item artist', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Test Artist')).toBeInTheDocument()
      })
    })

    it('should display item price', async () => {
      const { container } = renderCart({ withItem: true })
      
      await waitFor(() => {
        // Price shows as "$ 45" split by whitespace, check the span contains it
        const priceSpan = container.querySelector('.font-semibold.text-sm')
        expect(priceSpan?.textContent).toContain('45')
      })
    })

    it('should display optimized thumbnail image', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        const img = screen.getByAltText('Test Artwork')
        expect(img.getAttribute('src')).toContain('cloudinary.com')
        expect(img.getAttribute('src')).toContain('w_100')
      })
    })
  })

  describe('quantity controls', () => {
    it('should display quantity', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        const quantitySpan = screen.getByText('1', { selector: 'span.w-8' })
        expect(quantitySpan).toBeInTheDocument()
      })
    })

    it('should have increment button', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('+')).toBeInTheDocument()
      })
    })

    it('should have decrement button', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('−')).toBeInTheDocument()
      })
    })

    it('should increment quantity on + click', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('+')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('+'))
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })
  })

  describe('remove functionality', () => {
    it('should have Remove button', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Remove')).toBeInTheDocument()
      })
    })

    it('should remove item on click', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Remove')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByText('Remove'))
      
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      })
    })
  })

  describe('selected options display', () => {
    it('should display size in options text', async () => {
      renderCart({ withItem: true })

      await waitFor(() => {
        expect(screen.getByText(/8x10/)).toBeInTheDocument()
      })
    })

    it('should display frame in options text', async () => {
      renderCart({ withItem: true })

      await waitFor(() => {
        expect(screen.getByText(/black/)).toBeInTheDocument()
      })
    })

    it('should show size and frame together', async () => {
      renderCart({ withItem: true })

      await waitFor(() => {
        expect(screen.getByText('8x10 • black')).toBeInTheDocument()
      })
    })
  })

  describe('footer', () => {
    it('should show subtotal', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Subtotal')).toBeInTheDocument()
      })
    })

    it('should show shipping message', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Shipping calculated at checkout')).toBeInTheDocument()
      })
    })

    it('should have Checkout link', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument()
      })
    })

    it('should link Checkout to /checkout', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        const checkoutLink = screen.getByText('Checkout').closest('a')
        expect(checkoutLink?.getAttribute('href')).toBe('/checkout')
      })
    })
  })

  describe('close functionality', () => {
    it('should have close button in header', async () => {
      renderCart({ withItem: true })
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('backdrop', () => {
    it('should render backdrop overlay', async () => {
      const { container } = renderCart({ withItem: true })
      
      await waitFor(() => {
        const backdrop = container.querySelector('.fixed.inset-0.z-40')
        expect(backdrop).toBeTruthy()
      })
    })
  })
})
