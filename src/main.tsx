import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App'
import { ShopifyProvider } from './context/ShopifyProvider'
import { CartProvider } from './context/CartContext'
import { GlobalErrorFallback } from './components/error/ErrorPage'
import './index.css'

/**
 * Application Entry Point
 * 
 * Wrapping order (outside to inside):
 * 1. StrictMode - Development checks for bugs
 * 2. ErrorBoundary - Catches errors in the entire app
 * 3. CartProvider - Global cart state
 * 4. App - Router and pages
 * 
 * WHY ERRORBOUNDARY AT TOP LEVEL?
 * If CartProvider or App crashes during initialization,
 * the error boundary catches it and shows a recovery UI
 * instead of a white screen.
 */

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(
    'Root element not found. Make sure there is a <div id="root"></div> in your index.html'
  )
}

// Warn about missing environment variables
if (!import.meta.env.VITE_CLOUDINARY_CLOUD) {
  console.warn(
    '⚠️ VITE_CLOUDINARY_CLOUD is not set. Images will load from Smithsonian directly (slower).'
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={(error, info) => {
        // Log errors to console in development
        // In production, you'd send to an error tracking service like Sentry
        console.error('Application error:', error)
        console.error('Component stack:', info.componentStack)
      }}
      onReset={() => {
        // Reset application state on recovery
        // This clears any corrupted state that might have caused the crash
        window.location.href = '/'
      }}
    >
      <ShopifyProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ShopifyProvider>
    </ErrorBoundary>
  </StrictMode>
)
