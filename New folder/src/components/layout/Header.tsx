import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../../context/CartContext'

export default function Header() {
  const { itemCount } = useCart()
  const dispatch = useCartDispatch()

  return (
    <header className="sticky top-0 z-40 border-b bg-white border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* SVG Logo - Abstract frame/gallery icon */}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simple frame icon */}
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="6" y="6" width="12" height="12" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
            </svg>
          </div>
          
          <div>
            <span className="text-xl font-semibold tracking-tight block leading-tight text-gray-900">
              Gallery Store
            </span>
            <span className="text-xs tracking-wide text-gray-400">
              Smithsonian Collection
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Free shipping badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span>Free shipping $100+</span>
          </div>

          {/* Cart button */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="relative p-2.5 rounded-lg transition-all text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Shopping cart"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center bg-primary">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
