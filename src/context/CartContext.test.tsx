import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartProvider, useCart, useCartDispatch } from './CartContext'
import type { ReactNode } from 'react'

// Test component that exposes cart state
function CartTestComponent() {
  const { items, total, itemCount, isOpen } = useCart()
  const dispatch = useCartDispatch()
  
  return (
    <div>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="total">{total}</span>
      <span data-testid="is-open">{isOpen ? 'open' : 'closed'}</span>
      <span data-testid="items">{JSON.stringify(items)}</span>
      <button
        data-testid="add-item"
        onClick={() => dispatch({
          type: 'ADD_ITEM',
          payload: {
            productId: 'test-product-1',
            variantId: 'gid://shopify/ProductVariant/12345',
            sizeId: '8x10',
            frameId: 'black',
            title: 'Test Artwork',
            artist: 'Test Artist',
            image: 'https://example.com/image.jpg',
            price: 45
          }
        })}
      >
        Add Item
      </button>
      <button
        data-testid="add-premium"
        onClick={() => dispatch({
          type: 'ADD_ITEM',
          payload: {
            productId: 'test-product-2',
            variantId: 'gid://shopify/ProductVariant/67890',
            sizeId: '24x30',
            frameId: 'gold',
            title: 'Premium Artwork',
            artist: 'Premium Artist',
            image: 'https://example.com/premium.jpg',
            price: 170
          }
        })}
      >
        Add Premium
      </button>
      <button 
        data-testid="toggle-cart"
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      >
        Toggle Cart
      </button>
      <button 
        data-testid="clear-cart"
        onClick={() => dispatch({ type: 'CLEAR_CART' })}
      >
        Clear Cart
      </button>
    </div>
  )
}

// Wrapper for rendering with CartProvider
function renderWithCart(ui: ReactNode) {
  return render(
    <CartProvider>{ui}</CartProvider>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should start with empty cart', () => {
      renderWithCart(<CartTestComponent />)
      
      expect(screen.getByTestId('item-count').textContent).toBe('0')
      expect(screen.getByTestId('total').textContent).toBe('0')
    })

    it('should start with cart closed', () => {
      renderWithCart(<CartTestComponent />)
      
      expect(screen.getByTestId('is-open').textContent).toBe('closed')
    })
  })

  describe('ADD_ITEM action', () => {
    it('should add item to cart', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-item').click()
      })
      
      expect(screen.getByTestId('item-count').textContent).toBe('1')
    })

    it('should calculate correct price for 8x10 + black frame ($45)', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-item').click()
      })
      
      expect(screen.getByTestId('total').textContent).toBe('45')
    })

    it('should calculate correct price for 24x30 + gold frame ($170)', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-premium').click()
      })
      
      expect(screen.getByTestId('total').textContent).toBe('170')
    })

    it('should increment quantity for duplicate items', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-item').click()
        screen.getByTestId('add-item').click()
      })
      
      expect(screen.getByTestId('item-count').textContent).toBe('2')
      expect(screen.getByTestId('total').textContent).toBe('90') // 2 × $45
    })

    it('should create separate entries for different options', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-item').click()
        screen.getByTestId('add-premium').click()
      })
      
      expect(screen.getByTestId('item-count').textContent).toBe('2')
      expect(screen.getByTestId('total').textContent).toBe('215') // $45 + $170
    })

    it('should open cart when item is added', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-item').click()
      })
      
      expect(screen.getByTestId('is-open').textContent).toBe('open')
    })
  })

  describe('TOGGLE_CART action', () => {
    it('should toggle cart open state', () => {
      renderWithCart(<CartTestComponent />)
      
      expect(screen.getByTestId('is-open').textContent).toBe('closed')
      
      act(() => {
        screen.getByTestId('toggle-cart').click()
      })
      
      expect(screen.getByTestId('is-open').textContent).toBe('open')
      
      act(() => {
        screen.getByTestId('toggle-cart').click()
      })
      
      expect(screen.getByTestId('is-open').textContent).toBe('closed')
    })
  })

  describe('CLEAR_CART action', () => {
    it('should remove all items', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-item').click()
        screen.getByTestId('add-premium').click()
      })
      
      expect(screen.getByTestId('item-count').textContent).toBe('2')
      
      act(() => {
        screen.getByTestId('clear-cart').click()
      })
      
      expect(screen.getByTestId('item-count').textContent).toBe('0')
      expect(screen.getByTestId('total').textContent).toBe('0')
    })
  })

  describe('cart item structure', () => {
    it('should store correct item data', () => {
      renderWithCart(<CartTestComponent />)
      
      act(() => {
        screen.getByTestId('add-item').click()
      })
      
      const items = JSON.parse(screen.getByTestId('items').textContent || '[]')
      
      expect(items).toHaveLength(1)
      expect(items[0]).toMatchObject({
        productId: 'test-product-1',
        sizeId: '8x10',
        frameId: 'black',
        title: 'Test Artwork',
        artist: 'Test Artist',
        image: 'https://example.com/image.jpg',
        price: 45,
        quantity: 1
      })
    })

    it('should generate unique key from product and variant', () => {
      renderWithCart(<CartTestComponent />)

      act(() => {
        screen.getByTestId('add-item').click()
      })

      const items = JSON.parse(screen.getByTestId('items').textContent || '[]')

      // Key is now productId-variantId for Shopify integration
      expect(items[0].key).toBe('test-product-1-gid://shopify/ProductVariant/12345')
      expect(items[0].variantId).toBe('gid://shopify/ProductVariant/12345')
      expect(items[0].sizeId).toBe('8x10')
      expect(items[0].frameId).toBe('black')
    })
  })
})

describe('CartContext error handling', () => {
  it('should throw error when useCart is used outside provider', () => {
    // Suppress expected error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    function BadComponent() {
      useCart()
      return null
    }
    
    expect(() => render(<BadComponent />)).toThrow(
      'useCart must be used within a CartProvider'
    )
    
    consoleSpy.mockRestore()
  })

  it('should throw error when useCartDispatch is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    function BadComponent() {
      useCartDispatch()
      return null
    }
    
    expect(() => render(<BadComponent />)).toThrow(
      'useCartDispatch must be used within a CartProvider'
    )
    
    consoleSpy.mockRestore()
  })
})
