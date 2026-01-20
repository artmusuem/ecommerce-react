import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  type LinksFunction,
} from "react-router";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Cart from "@/components/cart/Cart";

import "./app.css";

export const links: LinksFunction = () => [
  // CDN preconnects for images
  { rel: "preconnect", href: "https://res.cloudinary.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://cdn.shopify.com", crossOrigin: "anonymous" },
  // Fonts are self-hosted in /public/fonts/ - see app.css @font-face
];

/**
 * Global error fallback component
 * Displayed when an unhandled error occurs outside of routing
 */
function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  // Log error for debugging (in production, this could go to Sentry)
  console.error("Unhandled error:", error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left bg-red-50 rounded-lg p-4">
            <summary className="text-sm font-medium text-red-800 cursor-pointer">
              Error details (development only)
            </summary>
            <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Error logging handler
 * In production, this would send to error tracking service
 */
function logError(error: Error, info: { componentStack?: string | null }) {
  // In production, send to Sentry/DataDog/etc.
  console.error("Error boundary caught:", error);
  if (info.componentStack) {
    console.error("Component stack:", info.componentStack);
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ReactErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={logError}
      onReset={() => {
        // Clear any error state on reset
        window.location.href = "/";
      }}
    >
      <CartProvider>
        <Header />
        <Cart />
        <Outlet />
      </CartProvider>
    </ReactErrorBoundary>
  );
}

/**
 * Route-level error boundary
 * Handles errors within the routing system (404s, loader errors, etc.)
 */
export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">{message}</h1>
        <p className="text-gray-600 mb-8">{details}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Go Home
        </a>
      </div>
    </main>
  );
}
