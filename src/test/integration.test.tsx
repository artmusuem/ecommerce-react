import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider, useCart, useCartDispatch } from '../context/CartContext'
import Cart from '../components/cart/Cart'
import type { ReactNode } from 'react'

// Mock Cloudinary environment
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')

// Test helper component that exposes cart state
function CartStateDisplay() {
  const { items, total, itemCount } = useCart()
  return (
    <div data-testid="cart-state">
      <span data-testid="count">{itemCount}</span>
      <span data-testid="total">{total}</span>
      <span data-testid="items">{items.length}</span>
    </div>
  )
}

// Helper to add items
function AddItemButton({
  productId = 'test-product',
  variantId = 'gid://shopify/ProductVariant/12345',
  sizeId = '8x10',
  frameId = 'black',
  price = 45
}: { productId?: string; variantId?: string; sizeId?: string; frameId?: string; price?: number }) {
  const dispatch = useCartDispatch()

  const handleAdd = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId,
        variantId,
        sizeId,
        frameId,
        title: 'Test',
        artist: 'Artist',
        image: 'https://example.com/img.jpg',
        price
      }
    })
  }

  return <button onClick={handleAdd} data-testid="add-btn">Add</button>
}

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <CartProvider>
        {children}
      </CartProvider>
    </MemoryRouter>
  )
}

describe('Integration: Cart Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Add to Cart Flow', () => {
    it('should add item and update count', async () => {
      render(
        <TestWrapper>
          <CartStateDisplay />
          <AddItemButton />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('count')).toHaveTextContent('0')
      
      fireEvent.click(screen.getByTestId('add-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1')
      })
    })

    it('should calculate correct total', async () => {
      render(
        <TestWrapper>
          <CartStateDisplay />
          <AddItemButton sizeId="8x10" frameId="black" />
        </TestWrapper>
      )
      
      fireEvent.click(screen.getByTestId('add-btn'))
      
      await waitFor(() => {
        // 8x10 ($45) + black frame ($0) = $45
        expect(screen.getByTestId('total')).toHaveTextContent('45')
      })
    })
  })

  describe('Cart Updates', () => {
    it('should update quantity correctly', async () => {
      render(
        <TestWrapper>
          <CartStateDisplay />
          <AddItemButton />
        </TestWrapper>
      )
      
      // Add same item twice
      fireEvent.click(screen.getByTestId('add-btn'))
      fireEvent.click(screen.getByTestId('add-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('2')
      })
    })

    it('should handle multiple different items', async () => {
      const MultiAddHelper = () => {
        const dispatch = useCartDispatch()
        const handleAdd = () => {
          dispatch({
            type: 'ADD_ITEM',
            payload: {
              productId: 'product-1',
              variantId: 'gid://shopify/ProductVariant/11111',
              sizeId: '8x10',
              frameId: 'black',
              title: 'Test 1',
              artist: 'Artist',
              image: 'https://example.com/1.jpg',
              price: 45
            }
          })
          dispatch({
            type: 'ADD_ITEM',
            payload: {
              productId: 'product-2',
              variantId: 'gid://shopify/ProductVariant/22222',
              sizeId: '11x14',
              frameId: 'gold',
              title: 'Test 2',
              artist: 'Artist',
              image: 'https://example.com/2.jpg',
              price: 90
            }
          })
        }
        return <button onClick={handleAdd} data-testid="add-multi">Add Both</button>
      }

      render(
        <TestWrapper>
          <CartStateDisplay />
          <MultiAddHelper />
        </TestWrapper>
      )

      fireEvent.click(screen.getByTestId('add-multi'))

      await waitFor(() => {
        expect(screen.getByTestId('items')).toHaveTextContent('2')
        // $45 + $90 = $135
        expect(screen.getByTestId('total')).toHaveTextContent('135')
      })
    })
  })

  describe('Price Calculations', () => {
    it('should use variant price from Shopify', async () => {
      render(
        <TestWrapper>
          <CartStateDisplay />
          <AddItemButton sizeId="8x10" frameId="gold" price={70} />
        </TestWrapper>
      )

      fireEvent.click(screen.getByTestId('add-btn'))

      await waitFor(() => {
        // Price comes from Shopify variant
        expect(screen.getByTestId('total')).toHaveTextContent('70')
      })
    })
  })

  describe('Cart Persistence', () => {
    it('should maintain cart state during session', async () => {
      // Note: localStorage persistence would require CartContext to implement it
      // This test verifies state is maintained within the component lifecycle
      render(
        <TestWrapper>
          <CartStateDisplay />
          <AddItemButton />
        </TestWrapper>
      )
      
      fireEvent.click(screen.getByTestId('add-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1')
      })
      
      // Add another item
      fireEvent.click(screen.getByTestId('add-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('2')
      })
    })
  })
})

describe('Integration: Image Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use optimized URLs in cart', async () => {
    const { container } = render(
      <MemoryRouter>
        <CartProvider>
          <AddItemButton />
          <Cart />
        </CartProvider>
      </MemoryRouter>
    )
    
    fireEvent.click(screen.getByTestId('add-btn'))
    
    await waitFor(() => {
      const img = container.querySelector('img[alt="Test"]')
      expect(img).toBeTruthy()
      expect(img?.getAttribute('src')).toContain('cloudinary.com')
      expect(img?.getAttribute('src')).toContain('w_100')
    })
  })
})
