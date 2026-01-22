import { Component, type ReactNode } from 'react'
import { Link } from 'react-router'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component for catching React render errors.
 * Prevents entire app from crashing when a component throws.
 *
 * Usage:
 * <ErrorBoundary>
 *   <ComponentThatMightThrow />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // In production, you could send to error tracking service:
    // reportErrorToService(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-display mb-2 text-gray-800">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (dev only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

/**
 * Checkout-specific error fallback with helpful messaging
 */
export function CheckoutErrorFallback(): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-100">
          <svg
            className="h-8 w-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-display mb-2 text-gray-800">
          Checkout Unavailable
        </h1>
        <p className="text-gray-600 mb-6">
          We're having trouble loading checkout. Your cart is safe - please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800 transition-colors"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}
