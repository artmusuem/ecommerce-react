import { createContext, useContext, useReducer, useEffect, useState, type ReactNode, type Dispatch } from 'react'
import type { CartState, CartAction, CartContextValue } from '../types'

const CartContext = createContext<CartContextValue | null>(null)
const CartDispatchContext = createContext<Dispatch<CartAction> | null>(null)

const CART_STORAGE_KEY = 'gallery-store-cart'

// Initial state - always empty for consistent SSR/client initial render
const initialState: CartState = { items: [], isOpen: false }

// Load cart from localStorage (only called in useEffect on client)
function loadCartFromStorage(): CartState {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        isOpen: false
      }
    }
  } catch (err) {
    console.error('Failed to load cart from storage:', err)
  }
  return { items: [], isOpen: false }
}

// Save cart to localStorage (only in browser)
function saveCartToStorage(cart: CartState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: cart.items }))
  } catch (err) {
    console.error('Failed to save cart to storage:', err)
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { productId, variantId, sizeId, frameId, title, artist, image, price } = action.payload
      const itemKey = `${productId}-${variantId}`
      const existingIndex = state.items.findIndex(item => item.key === itemKey)

      if (existingIndex >= 0) {
        const newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        }
        return { ...state, items: newItems, isOpen: true }
      }

      return {
        ...state,
        items: [...state.items, {
          key: itemKey,
          productId,
          variantId,
          sizeId,
          frameId,
          title,
          artist,
          image,
          price,
          quantity: 1
        }],
        isOpen: true
      }
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.key !== action.payload)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.key !== key)
        }
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.key === key ? { ...item, quantity } : item
        )
      }
    }
    
    case 'TOGGLE_CART': {
      return { ...state, isOpen: !state.isOpen }
    }
    
    case 'CLOSE_CART': {
      return { ...state, isOpen: false }
    }
    
    case 'CLEAR_CART': {
      return { ...state, items: [] }
    }

    case 'LOAD_CART': {
      return { ...state, items: action.payload }
    }

    default:
      return state
  }
}

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage after hydration (client-side only)
  useEffect(() => {
    const storedCart = loadCartFromStorage()
    if (storedCart.items.length > 0) {
      dispatch({ type: 'LOAD_CART', payload: storedCart.items })
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever cart items change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(cart)
    }
  }, [cart.items, isHydrated])
  
  const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  
  const value: CartContextValue = {
    ...cart,
    total,
    itemCount
  }
  
  return (
    <CartContext.Provider value={value}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const cart = useContext(CartContext)
  if (cart === null) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return cart
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCartDispatch(): Dispatch<CartAction> {
  const dispatch = useContext(CartDispatchContext)
  if (dispatch === null) {
    throw new Error('useCartDispatch must be used within a CartProvider')
  }
  return dispatch
}
