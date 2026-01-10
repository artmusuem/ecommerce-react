import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../../context/CartContext'
import { getResizedImage } from '../../utils/images'
import type { ProductRouterState } from '../../types'

// Frame colors for display
const frameColors: Record<string, string> = {
  'Unframed': '#f5f5f5',
  'Black Frame': '#1a1a1a',
  'White Frame': '#ffffff',
  'Natural Wood': '#c4a574',
}

export default function Cart() {
  const { items, isOpen, total } = useCart()
  const dispatch = useCartDispatch()

  return (
    <>
      {/* Backdrop - fades in/out */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      />
      
      {/* Cart Panel - slides in/out from right */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col bg-white transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Cart ({items.length})
          </h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center bg-gray-100">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="font-medium mb-1 text-gray-800">
                Your cart is empty
              </p>
              <p className="text-sm text-gray-500">
                Add prints to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const frameColor = frameColors[item.frameId] || '#1a1a1a'

                // Build product state with selected options for the Product page
                const productState: ProductRouterState = {
                  product: {
                    id: item.productId,
                    title: item.title,
                    artist: item.artist,
                    image: item.image,
                    year: '',
                    origin: '',
                    medium: '',
                    description: '',
                    tags: []
                  },
                  selectedSizeId: item.sizeId,
                  selectedFrameId: item.frameId
                }

                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl bg-white"
                  >
                    <div className="flex gap-3">
                      {/* Clickable image with frame color border */}
                      <Link
                        to={`/product/${encodeURIComponent(item.productId)}`}
                        state={productState}
                        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                        className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity bg-gray-100"
                        style={{
                          border: `3px solid ${frameColor}`,
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
                          <h3 className="font-medium text-sm leading-tight line-clamp-2 text-gray-800">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-xs mt-0.5 text-gray-500">
                          {item.artist}
                        </p>
                        {/* Display selected options */}
                        <p className="text-xs mt-1 text-gray-400">
                          {item.sizeId} • {item.frameId}
                        </p>
                      </div>

                      {/* Price */}
                      <span className="font-semibold text-sm whitespace-nowrap text-gray-800">
                        ${(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border rounded-lg border-gray-200">
                        <button
                          onClick={() => dispatch({
                            type: 'UPDATE_QUANTITY',
                            payload: { key: item.key, quantity: item.quantity - 1 }
                          })}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50 rounded-l-lg text-gray-600"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch({
                            type: 'UPDATE_QUANTITY',
                            payload: { key: item.key, quantity: item.quantity + 1 }
                          })}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50 rounded-r-lg text-gray-600"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.key })}
                        className="text-xs underline transition-colors text-gray-400 hover:text-gray-600"
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
          <div className="px-5 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-semibold text-gray-900">
                ${total.toFixed(0)}
              </span>
            </div>
            
            <p className="text-xs mb-4 text-gray-500">
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
