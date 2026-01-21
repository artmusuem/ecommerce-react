import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart, useCartDispatch } from '../../context/CartContext'

/**
 * Artist collections for dropdown menu
 */
const artistCollections = [
  { name: 'Winslow Homer', handle: 'winslow-homer' },
  { name: 'Mary Cassatt', handle: 'mary-cassatt' },
  { name: 'Thomas Cole', handle: 'thomas-cole' },
]

/**
 * Header Component
 *
 * Main navigation header with logo, navigation links, and cart button.
 *
 * Features:
 * - Sticky positioning for always-visible navigation
 * - Desktop: Logo | Collections (dropdown) | About | Cart
 * - Mobile: Hamburger | Logo | Cart (hamburger opens menu with dropdowns)
 * - Cart button with item count badge
 * - Smooth roll-down animation for dropdowns
 */
export default function Header() {
  const { itemCount } = useCart()
  const dispatch = useCartDispatch()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCollectionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Mobile: Hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

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

          {/* Brand text - always visible, subtitle only on larger screens */}
          <div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight block leading-tight text-gray-900">
              Gallery Store
            </span>
            <span className="hidden sm:block text-xs tracking-wide text-gray-400">
              Smithsonian Collection
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {/* Collections with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCollectionsOpen(!collectionsOpen)}
              className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-colors ${
                isActive('/collections')
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Collections
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${collectionsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Desktop Dropdown - slow roll-down animation (700ms open, 500ms close) */}
            <div
              className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden origin-top ${
                collectionsOpen
                  ? 'opacity-100 scale-y-100 translate-y-0 transition-all duration-700 ease-out'
                  : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none transition-all duration-500 ease-out'
              }`}
            >
              <div className="py-2">
                <Link
                  to="/collections"
                  onClick={() => setCollectionsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  All Collections
                </Link>
                <div className="border-t border-gray-100 my-1" />
                {artistCollections.map((artist) => (
                  <Link
                    key={artist.handle}
                    to={`/collections/${artist.handle}`}
                    onClick={() => setCollectionsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    {artist.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/about"
            className={`text-sm font-medium tracking-wide transition-colors ${
              isActive('/about')
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            About
          </Link>
        </nav>

        {/* Right side: Cart button */}
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

      {/* Mobile Navigation Menu - slow roll-down animation (700ms open, 500ms close) */}
      <div
        className={`md:hidden overflow-hidden ${
          mobileMenuOpen
            ? 'max-h-96 opacity-100 transition-all duration-700 ease-out'
            : 'max-h-0 opacity-0 transition-all duration-500 ease-out'
        }`}
      >
        <nav
          className="border-t border-gray-100 bg-white"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-1">
            {/* Collections with nested dropdown */}
            <div>
              <button
                onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive('/collections')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Collections
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${mobileCollectionsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mobile Collections dropdown - slow roll-down (700ms open, 500ms close) */}
              <div
                className={`overflow-hidden ${
                  mobileCollectionsOpen
                    ? 'max-h-48 opacity-100 transition-all duration-700 ease-out'
                    : 'max-h-0 opacity-0 transition-all duration-500 ease-out'
                }`}
              >
                <div className="pl-4 py-1 space-y-1">
                  <Link
                    to="/collections"
                    onClick={() => { setMobileMenuOpen(false); setMobileCollectionsOpen(false); }}
                    className="block px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    All Collections
                  </Link>
                  {artistCollections.map((artist) => (
                    <Link
                      key={artist.handle}
                      to={`/collections/${artist.handle}`}
                      onClick={() => { setMobileMenuOpen(false); setMobileCollectionsOpen(false); }}
                      className="block px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {artist.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              About
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
