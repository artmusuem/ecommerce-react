import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Header from './components/layout/Header'
import Cart from './components/cart/Cart'
import Home from './pages/Home'
import Product from './pages/Product'

// Lazy load Checkout - this prevents Stripe from loading on Home/Product pages
const Checkout = lazy(() => import('./pages/Checkout'))

// Loading fallback for Checkout page
function CheckoutLoading() {
  return (
    <main 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-gray-50)' }}
    >
      <div className="text-center">
        <svg 
          className="animate-spin h-10 w-10 mx-auto mb-4" 
          viewBox="0 0 24 24"
          style={{ color: 'var(--color-gray-400)' }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p style={{ color: 'var(--color-gray-500)' }}>Loading checkout...</p>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Header />
        <Cart />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route 
            path="/checkout" 
            element={
              <Suspense fallback={<CheckoutLoading />}>
                <Checkout />
              </Suspense>
            } 
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
