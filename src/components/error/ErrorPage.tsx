import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

/**
 * ErrorPage - Displays when React Router catches an error
 * 
 * This handles:
 * - 404 Not Found
 * - Route errors
 * - Unexpected crashes in route components
 * 
 * WHY THIS MATTERS:
 * Without error handling, users see a blank white screen.
 * With error handling, users see a helpful message and can recover.
 */
export function ErrorPage() {
  const error = useRouteError()
  
  // Check if it's a known route error (404, etc.)
  if (isRouteErrorResponse(error)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">
            {error.status}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {error.status === 404 ? 'Page Not Found' : 'Something Went Wrong'}
          </h2>
          <p className="text-gray-500 mb-8">
            {error.status === 404 
              ? "The page you're looking for doesn't exist."
              : error.statusText || 'An unexpected error occurred.'
            }
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gallery
          </Link>
        </div>
      </main>
    )
  }

  // Unknown error - could be a bug in component code
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-500 mb-6">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            Refresh Page
          </button>
          <Link
            to="/"
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-colors"
          >
            Go Home
          </Link>
        </div>
        {/* Show error details in development only */}
        {import.meta.env.DEV && error instanceof Error && (
          <details className="mt-8 text-left bg-gray-100 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600">
              Error Details (dev only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}

/**
 * GlobalErrorFallback - For react-error-boundary
 * 
 * This catches errors that happen OUTSIDE of routing,
 * like errors in context providers or the App component itself.
 */
interface FallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Application Error
        </h1>
        <p className="text-gray-500 mb-6">
          Something went wrong loading the application. Please try again.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
        >
          Try Again
        </button>
        {import.meta.env.DEV && (
          <details className="mt-8 text-left bg-gray-100 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600">
              Error Details (dev only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}
