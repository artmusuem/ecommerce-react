/**
 * CartContext - Shopping cart state management with SSR-safe persistence
 *
 * Uses React 18's useSyncExternalStore for proper hydration without flicker.
 * The cart state is persisted to localStorage and syncs across browser tabs.
 *
 * Architecture:
 * - External store pattern (not useState/useReducer) for localStorage sync
 * - useSyncExternalStore provides different snapshots for server vs client
 * - Server always sees empty cart (consistent SSR HTML)
 * - Client hydrates with empty, then immediately syncs to localStorage value
 * - No hydration mismatch because React handles the transition internally
 *
 * @example
 * function Component() {
 *   const { items, total, itemCount } = useCart()
 *   const dispatch = useCartDispatch()
 *
 *   dispatch({ type: 'ADD_ITEM', payload: { ... } })
 * }
 */

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  useMemo,
  type ReactNode
} from 'react'
import { createPersistedStore } from '../lib/createPersistedStore'
import type { CartItem, CartState, CartAction, CartContextValue } from '../types'

// ============================================================================
// Store Setup
// ============================================================================

const CART_STORAGE_KEY = 'gallery-store-cart'

// Initial state - used for SSR and as default
const initialCartState: CartState = {
  items: [],
  isOpen: false
}

// Create the persisted store for cart items
// Only items are persisted - isOpen is transient UI state
const cartItemsStore = createPersistedStore<CartItem[]>(CART_STORAGE_KEY, [])

// Separate in-memory store for transient UI state (cart open/closed)
let cartIsOpen = false
const isOpenListeners = new Set<() => void>()

function subscribeToIsOpen(listener: () => void): () => void {
  isOpenListeners.add(listener)
  return () => isOpenListeners.delete(listener)
}

function getIsOpenSnapshot(): boolean {
  return cartIsOpen
}

function getIsOpenServerSnapshot(): boolean {
  return false
}

function setIsOpen(value: boolean): void {
  cartIsOpen = value
  isOpenListeners.forEach(listener => listener())
}

// ============================================================================
// Reducer Logic
// ============================================================================

function reduceCartItems(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { productId, variantId, sizeId, frameId, title, artist, image, price } = action.payload
      const itemKey = `${productId}-${variantId}`
      const existingIndex = items.findIndex(item => item.key === itemKey)

      if (existingIndex >= 0) {
        const newItems = [...items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        }
        return newItems
      }

      return [...items, {
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
      }]
    }

    case 'REMOVE_ITEM':
      return items.filter(item => item.key !== action.payload)

    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload
      if (quantity <= 0) {
        return items.filter(item => item.key !== key)
      }
      return items.map(item =>
        item.key === key ? { ...item, quantity } : item
      )
    }

    case 'CLEAR_CART':
      return []

    case 'LOAD_CART':
      return action.payload

    default:
      return items
  }
}

// ============================================================================
// Context
// ============================================================================

type CartDispatch = (action: CartAction) => void

const CartContext = createContext<CartContextValue | null>(null)
const CartDispatchContext = createContext<CartDispatch | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  // Subscribe to persisted items store using useSyncExternalStore
  // This is the React 18+ pattern for external state with SSR
  const items = useSyncExternalStore(
    cartItemsStore.subscribe,
    cartItemsStore.getSnapshot,
    cartItemsStore.getServerSnapshot
  )

  // Subscribe to transient isOpen state
  const isOpen = useSyncExternalStore(
    subscribeToIsOpen,
    getIsOpenSnapshot,
    getIsOpenServerSnapshot
  )

  // Dispatch function that updates both stores as needed
  const dispatch = useCallback<CartDispatch>((action) => {
    switch (action.type) {
      case 'TOGGLE_CART':
        setIsOpen(!cartIsOpen)
        break

      case 'CLOSE_CART':
        setIsOpen(false)
        break

      case 'ADD_ITEM':
        cartItemsStore.setState(prev => reduceCartItems(prev, action))
        setIsOpen(true) // Open cart when adding item
        break

      default:
        cartItemsStore.setState(prev => reduceCartItems(prev, action))
    }
  }, [])

  // Compute derived values
  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  // Build context value
  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    total,
    itemCount
  }), [items, isOpen, total, itemCount])

  return (
    <CartContext.Provider value={value}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  )
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access cart state (items, totals, open/closed)
 * @throws Error if used outside CartProvider
 */
export function useCart(): CartContextValue {
  const cart = useContext(CartContext)
  if (cart === null) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return cart
}

/**
 * Access cart dispatch function for actions
 * @throws Error if used outside CartProvider
 */
export function useCartDispatch(): CartDispatch {
  const dispatch = useContext(CartDispatchContext)
  if (dispatch === null) {
    throw new Error('useCartDispatch must be used within a CartProvider')
  }
  return dispatch
}
