import { Link } from 'react-router'

/**
 * Footer Component
 *
 * Site-wide footer with navigation links and branding.
 * Includes anchor links to specific sections on the About page.
 */
export default function Footer() {
  return (
    <footer className="bg-ink-900 text-paper-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-paper-50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#1a1a1a" strokeWidth="2"/>
                  <rect x="6" y="6" width="12" height="12" rx="1" stroke="#1a1a1a" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="#1a1a1a" opacity="0.9"/>
                </svg>
              </div>
              <span className="font-display text-xl text-paper-50">
                Gallery Store
              </span>
            </div>
            <p className="text-paper-100/70 text-sm max-w-xs">
              Bringing the Smithsonian American Art Museum to your walls.
              Restored prints on archival paper, shipped free worldwide.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-medium text-paper-50 mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3 text-paper-100/70 text-sm">
              <li>
                <Link to="/collections" className="hover:text-paper-50 transition-colors">All prints</Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-paper-50 transition-colors">Cart</Link>
              </li>
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-medium text-paper-50 mb-4 text-sm uppercase tracking-wider">About</h4>
            <ul className="space-y-3 text-paper-100/70 text-sm">
              <li>
                <Link to="/about#story" className="hover:text-paper-50 transition-colors">Our story</Link>
              </li>
              <li>
                <a
                  href="https://www.si.edu/openaccess"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-paper-50 transition-colors"
                >
                  Smithsonian Open Access
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-medium text-paper-50 mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-paper-100/70 text-sm">
              <li>
                <Link to="/about#prints" className="hover:text-paper-50 transition-colors">Print quality</Link>
              </li>
              <li>
                <Link to="/about#shipping" className="hover:text-paper-50 transition-colors">Shipping</Link>
              </li>
              <li>
                <Link to="/about#framing" className="hover:text-paper-50 transition-colors">Framing options</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-paper-100/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-paper-100/50">
              © {new Date().getFullYear()} Gallery Store — All rights reserved
            </p>
            <p className="text-sm text-paper-100/50">
              Artwork courtesy of Smithsonian Open Access
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
