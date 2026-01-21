import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useCart, useCartDispatch } from '../../context/CartContext'

/**
 * Header Component
 *
 * Main navigation header with logo, navigation links, and cart button.
 * Follows hikariandink.com's premium navigation pattern.
 *
 * Features:
 * - Sticky positioning for always-visible navigation
 * - Desktop: Logo | Collection | About | Cart
 * - Mobile: Hamburger | Logo | Cart (hamburger opens menu)
 * - Cart button with item count badge
 *
 * @example
 * ```tsx
 * // In app/root.tsx
 * <Header />
 * ```
 */
export default function Header() {
  const { itemCount } = useCart()
  const dispatch = useCartDispatch()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Collection' },
    { href: '/about', label: 'About' },
  ]

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

          <div className="hidden sm:block">
            <span className="text-xl font-semibold tracking-tight block leading-tight text-gray-900">
              Gallery Store
            </span>
            <span className="text-xs tracking-wide text-gray-400">
              Smithsonian Collection
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium tracking-wide transition-colors ${
                isActive(link.href)
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
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

      {/* Mobile Navigation Menu - animated slide/fade */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? 'max-h-40 opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <nav
          className="border-t border-gray-100 bg-white"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
