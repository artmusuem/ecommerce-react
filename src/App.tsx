import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Header from './components/layout/Header'
import Cart from './components/cart/Cart'
import Home from './pages/Home'
import Product from './pages/Product'
import { ErrorPage } from './components/error/ErrorPage'

// Lazy load Checkout - Stripe checkout for full headless experience
// Payment via Stripe, orders created in Shopify after payment
const Checkout = lazy(() => import('./pages/Checkout'))

// Loading fallback for Checkout page
function CheckoutLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg 
          className="animate-spin h-10 w-10 mx-auto mb-4 text-gray-400"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    </main>
  )
}

/**
 * Root Layout - Wraps all pages with Header and Cart
 * 
 * This pattern keeps the header/cart persistent across routes
 * while allowing the main content to change.
 */
function RootLayout() {
  return (
    <>
      <Header />
      <Cart />
      <Outlet />
    </>
  )
}

/**
 * Router Configuration
 * 
 * Using createBrowserRouter instead of <Routes> because:
 * 1. Built-in error handling per route
 * 2. Data loading support (future use)
 * 3. Better TypeScript support
 * 
 * Each route has errorElement - if that route crashes,
 * only that part shows error, not the whole app.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'product/:id',
        element: <Product />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'checkout',
        element: (
          <Suspense fallback={<CheckoutLoading />}>
            <Checkout />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    // Catch-all for 404s
    path: '*',
    element: <ErrorPage />,
  },
])

/**
 * App Component
 * 
 * NOTE: BrowserRouter is NOT used here anymore.
 * RouterProvider uses the router config above.
 * CartProvider is in main.tsx (wraps the whole app).
 */
export default function App() {
  return <RouterProvider router={router} />
}
