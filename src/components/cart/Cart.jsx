import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../../context/CartContext'
import { getResizedImage } from '../../utils/images'
import { sizes, frames, calculatePrice } from '../../data/products'

export default function Cart() {
  const { items, isOpen, total } = useCart()
  const dispatch = useCartDispatch()

  if (!isOpen) return null

  // Handle option change - remove old item, add new one with same quantity
  const handleOptionChange = (item, newSizeId, newFrameId) => {
    const oldQuantity = item.quantity
    
    // Remove the old item
    dispatch({ type: 'REMOVE_ITEM', payload: item.key })
    
    // Add new item(s) - loop to preserve quantity
    for (let i = 0; i < oldQuantity; i++) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          productId: item.productId,
          sizeId: newSizeId,
          frameId: newFrameId,
          title: item.title,
          artist: item.artist,
          image: item.image
        }
      })
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      />
      
      {/* Cart Panel */}
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col"
        style={{ backgroundColor: 'var(--color-white)' }}
      >
        {/* Header */}
        <div 
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-gray-200)' }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: 'var(--color-gray-900)' }}
          >
            Cart ({items.length})
          </h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-gray-500)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div 
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ backgroundColor: 'var(--color-gray-50)' }}
        >
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-gray-100)' }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-gray-400)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p 
                className="font-medium mb-1"
                style={{ color: 'var(--color-gray-800)' }}
              >
                Your cart is empty
              </p>
              <p 
                className="text-sm"
                style={{ color: 'var(--color-gray-500)' }}
              >
                Add prints to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const currentSize = sizes.find(s => s.id === item.sizeId)
                const currentFrame = frames.find(f => f.id === item.frameId)
                
                // Build product state with selected options for the Product page
                const productState = {
                  product: {
                    id: item.productId,
                    title: item.title,
                    artist: item.artist,
                    image: item.image
                  },
                  selectedSizeId: item.sizeId,
                  selectedFrameId: item.frameId
                }

                return (
                  <div 
                    key={item.key} 
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'var(--color-white)' }}
                  >
                    <div className="flex gap-3">
                      {/* Clickable image with frame color border */}
                      <Link
                        to={`/product/${encodeURIComponent(item.productId)}`}
                        state={productState}
                        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                        className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                        style={{ 
                          backgroundColor: 'var(--color-gray-100)',
                          border: `3px solid ${currentFrame?.color || '#333'}`,
                          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <img
                          src={getResizedImage(item.image, 100)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* Clickable title link to product */}
                        <Link
                          to={`/product/${encodeURIComponent(item.productId)}`}
                          state={productState}
                          onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                          className="block hover:underline"
                        >
                          <h3 
                            className="font-medium text-sm leading-tight line-clamp-2"
                            style={{ color: 'var(--color-gray-800)' }}
                          >
                            {item.title}
                          </h3>
                        </Link>
                        <p 
                          className="text-xs mt-0.5"
                          style={{ color: 'var(--color-gray-500)' }}
                        >
                          {item.artist}
                        </p>
                      </div>

                      {/* Price */}
                      <span 
                        className="font-semibold text-sm whitespace-nowrap"
                        style={{ color: 'var(--color-gray-800)' }}
                      >
                        ${item.price * item.quantity}
                      </span>
                    </div>

                    {/* Options Dropdowns - Etsy style */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {/* Size Dropdown */}
                      <div>
                        <label 
                          className="block text-xs mb-1"
                          style={{ color: 'var(--color-gray-500)' }}
                        >
                          Size
                        </label>
                        <select
                          value={item.sizeId}
                          onChange={(e) => handleOptionChange(item, e.target.value, item.frameId)}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg cursor-pointer"
                          style={{ 
                            borderColor: 'var(--color-gray-200)',
                            color: 'var(--color-gray-700)',
                            backgroundColor: 'var(--color-white)'
                          }}
                        >
                          {sizes.map(size => (
                            <option key={size.id} value={size.id}>
                              {size.name} - ${size.basePrice}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Frame Dropdown with color indicator */}
                      <div>
                        <label 
                          className="block text-xs mb-1 flex items-center gap-1"
                          style={{ color: 'var(--color-gray-500)' }}
                        >
                          Frame
                          <span 
                            className="inline-block w-3 h-3 rounded border"
                            style={{ 
                              backgroundColor: currentFrame?.color,
                              borderColor: 'var(--color-gray-300)'
                            }}
                          />
                        </label>
                        <select
                          value={item.frameId}
                          onChange={(e) => handleOptionChange(item, item.sizeId, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg cursor-pointer"
                          style={{ 
                            borderColor: 'var(--color-gray-200)',
                            color: 'var(--color-gray-700)',
                            backgroundColor: 'var(--color-white)'
                          }}
                        >
                          {frames.map(frameOption => (
                            <option key={frameOption.id} value={frameOption.id}>
                              {frameOption.name}{frameOption.priceAdd > 0 ? ` (+$${frameOption.priceAdd})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-3 flex items-center justify-between">
                      <div 
                        className="flex items-center border rounded-lg"
                        style={{ borderColor: 'var(--color-gray-200)' }}
                      >
                        <button
                          onClick={() => dispatch({ 
                            type: 'UPDATE_QUANTITY', 
                            payload: { key: item.key, quantity: item.quantity - 1 }
                          })}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50 rounded-l-lg"
                          style={{ color: 'var(--color-gray-600)' }}
                        >
                          −
                        </button>
                        <span 
                          className="w-8 text-center text-sm"
                          style={{ color: 'var(--color-gray-800)' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch({ 
                            type: 'UPDATE_QUANTITY', 
                            payload: { key: item.key, quantity: item.quantity + 1 }
                          })}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50 rounded-r-lg"
                          style={{ color: 'var(--color-gray-600)' }}
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.key })}
                        className="text-xs underline transition-colors"
                        style={{ color: 'var(--color-gray-400)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gray-600)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray-400)'}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div 
            className="px-5 py-4 border-t"
            style={{ borderColor: 'var(--color-gray-200)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: 'var(--color-gray-600)' }}>Subtotal</span>
              <span 
                className="text-xl font-semibold"
                style={{ color: 'var(--color-gray-900)' }}
              >
                ${total}
              </span>
            </div>
            
            <p 
              className="text-xs mb-4"
              style={{ color: 'var(--color-gray-500)' }}
            >
              Shipping calculated at checkout
            </p>
            
            <Link
              to="/checkout"
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="block w-full py-3 text-center text-white font-medium rounded-lg btn-primary"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
