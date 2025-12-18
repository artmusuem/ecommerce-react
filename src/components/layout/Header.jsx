import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../../context/CartContext'
import { storeConfig } from '../../data/products'

export default function Header() {
  const { itemCount } = useCart()
  const dispatch = useCartDispatch()

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="group">
          <h1 className="text-2xl font-display font-semibold text-stone-800 group-hover:text-stone-600 transition-colors">
            {storeConfig.name}
          </h1>
          <p className="text-sm text-stone-500 font-light">{storeConfig.tagline}</p>
        </Link>
        
        <button
          onClick={() => dispatch({ type: 'TOGGLE_CART' })}
          className="relative p-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
          aria-label="Shopping cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-0 -right-0 bg-stone-800 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
