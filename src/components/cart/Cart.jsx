import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../../context/CartContext'
import { sizes, frames } from '../../data/products'
import { getResizedImage } from '../../utils/images'

export default function Cart() {
  const { items, isOpen, total, itemCount } = useCart()
  const dispatch = useCartDispatch()
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => dispatch({ type: 'CLOSE_CART' })}
      />
      
      {/* Cart Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="text-lg font-display font-semibold text-stone-800">
            Your Cart ({itemCount})
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-stone-500 mb-4">Your cart is empty</p>
              <button
                onClick={() => dispatch({ type: 'CLOSE_CART' })}
                className="text-stone-800 underline hover:no-underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const size = sizes.find(s => s.id === item.sizeId)
                const frame = frames.find(f => f.id === item.frameId)
                
                return (
                  <div key={item.key} className="flex gap-4 bg-stone-50 rounded-xl p-4">
                    <img
                      src={getResizedImage(item.image, 100)}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-stone-800 line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">{item.artist}</p>
                      <p className="text-xs text-stone-400 mt-1">
                        {size?.name} • {frame?.name}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => dispatch({ 
                              type: 'UPDATE_QUANTITY', 
                              payload: { key: item.key, quantity: item.quantity - 1 }
                            })}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
                          >
                            −
                          </button>
                          <span className="text-sm w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => dispatch({ 
                              type: 'UPDATE_QUANTITY', 
                              payload: { key: item.key, quantity: item.quantity + 1 }
                            })}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold text-stone-800">${item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-5 space-y-4 bg-stone-50">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Subtotal</span>
              <span className="text-2xl font-display font-semibold text-stone-800">${total}</span>
            </div>
            <p className="text-xs text-stone-400">
              Shipping calculated at checkout
            </p>
            <Link
              to="/checkout"
              onClick={() => dispatch({ type: 'CLOSE_CART' })}
              className="block w-full bg-stone-800 text-white text-center py-4 rounded-xl font-semibold hover:bg-stone-700 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
