import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useCart, useCartDispatch } from '../../context/CartContext'
import { useProducts } from '../../context/ProductsContext'

/**
 * Convert artist name to URL-safe handle
 */
function toHandle(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * Header Component
 *
 * Main navigation header with logo, navigation links, and cart button.
 *
 * Features:
 * - Sticky positioning for always-visible navigation
 * - Desktop: Logo | Collection (dropdown) | About | Cart
 * - Mobile: Hamburger | Logo | Cart (hamburger opens menu with artist dropdown)
 * - Cart button with item count badge
 * - Smooth dropdown animations
 */
export default function Header() {
  const { itemCount } = useCart()
  const dispatch = useCartDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const products = useProducts()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false)
  const [mobileArtistDropdownOpen, setMobileArtistDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive artists from products
  const artists = useMemo(() => {
    const artistData = new Map<string, { count: number; image: string }>()
    products.forEach((product) => {
      if (product.artist) {
        const existing = artistData.get(product.artist)
        if (existing) {
          artistData.set(product.artist, {
            count: existing.count + 1,
            image: existing.image,
          })
        } else {
          artistData.set(product.artist, {
            count: 1,
            image: product.image || '',
          })
        }
      }
    })

    return Array.from(artistData.entries())
      .filter(([, data]) => data.count >= 2)
      .map(([name, data]) => ({
        name,
        handle: toHandle(name),
        productCount: data.count,
        image: data.image,
      }))
      .sort((a, b) => b.productCount - a.productCount)
  }, [products])

  const isActive = (href: string) => {
    if (href === '/collections') return location.pathname.startsWith('/collections')
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCollectionDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle dropdown hover with delay
  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setCollectionDropdownOpen(true)
  }

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setCollectionDropdownOpen(false)
    }, 150)
  }

  const handleArtistClick = (handle: string) => {
    setCollectionDropdownOpen(false)
    setMobileMenuOpen(false)
    setMobileArtistDropdownOpen(false)
    navigate(`/collections/${handle}`)
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
          {/* Collection Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <Link
              to="/collections"
              className={`text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-1 ${
                isActive('/collections')
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Collection
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  collectionDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Dropdown Menu */}
            <div
              className={`absolute left-0 top-full pt-2 w-64 transition-all duration-300 ease-out ${
                collectionDropdownOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-80 overflow-y-auto">
                <Link
                  to="/collections"
                  onClick={() => setCollectionDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  All Artists
                </Link>
                <div className="border-t border-gray-100 my-1" />
                {artists.map((artist) => (
                  <button
                    key={artist.handle}
                    onClick={() => handleArtistClick(artist.handle)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between"
                  >
                    <span>{artist.name}</span>
                    <span className="text-xs text-gray-400">{artist.productCount}</span>
                  </button>
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

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav
          className="border-t border-gray-100 bg-white"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-1">
            {/* Collection with Artist Dropdown */}
            <div>
              <button
                onClick={() => setMobileArtistDropdownOpen(!mobileArtistDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive('/collections')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>Collection</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    mobileArtistDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mobile Artist Dropdown */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  mobileArtistDropdownOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pl-4 space-y-1 max-h-64 overflow-y-auto">
                  <Link
                    to="/collections"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setMobileArtistDropdownOpen(false)
                    }}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    All Artists
                  </Link>
                  {artists.map((artist) => (
                    <button
                      key={artist.handle}
                      onClick={() => handleArtistClick(artist.handle)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between"
                    >
                      <span>{artist.name}</span>
                      <span className="text-xs text-gray-400">{artist.productCount}</span>
                    </button>
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
