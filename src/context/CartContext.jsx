import { createContext, useContext, useReducer } from 'react'
import { calculatePrice } from '../data/products'

const CartContext = createContext(null)
const CartDispatchContext = createContext(null)

const initialState = {
  items: [],
  isOpen: false
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { productId, sizeId, frameId, title, artist, image } = action.payload
      const itemKey = `${productId}-${sizeId}-${frameId}`
      const existingIndex = state.items.findIndex(item => item.key === itemKey)
      
      if (existingIndex >= 0) {
        const newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        }
        return { ...state, items: newItems, isOpen: true }
      }
      
      const price = calculatePrice(sizeId, frameId)
      return {
        ...state,
        items: [...state.items, {
          key: itemKey,
          productId,
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
    
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState)
  
  return (
    <CartContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  )
}

export function useCart() {
  const cart = useContext(CartContext)
  if (cart === null) {
    throw new Error('useCart must be used within a CartProvider')
  }
  
  const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  
  return { ...cart, total, itemCount }
}

export function useCartDispatch() {
  const dispatch = useContext(CartDispatchContext)
  if (dispatch === null) {
    throw new Error('useCartDispatch must be used within a CartProvider')
  }
  return dispatch
}