import { lazy, Suspense } from "react";
import { Link } from "react-router";
import { checkoutConfig } from "@/config/checkout";
import { ErrorBoundary, CheckoutErrorFallback } from "@/components/ErrorBoundary";

// Lazy load both checkout components - only the configured one will be used
const StripeCheckout = lazy(() => import("@/pages/Checkout"));
const ShopifyCheckout = lazy(() => import("@/pages/ShopifyCheckout"));

function CheckoutLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg
          className="animate-spin h-10 w-10 mx-auto mb-4 text-gray-400"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-500">Preparing checkout...</p>
      </div>
    </main>
  );
}

function CheckoutConfigError({ error }: { error: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-lg">
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
        <h1 className="text-2xl font-display mb-4 text-gray-800">
          Checkout Not Configured
        </h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-2 bg-ink-900 text-white rounded-lg hover:bg-ink-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export function meta() {
  return [
    { title: "Checkout - Gallery Store" },
    { name: "description", content: "Complete your order" },
  ];
}

export default function Checkout() {
  // Check for configuration errors
  const configError = checkoutConfig.getConfigError();
  if (configError) {
    return <CheckoutConfigError error={configError} />;
  }

  // Select the appropriate checkout component based on effective mode
  const CheckoutComponent =
    checkoutConfig.effectiveMode === "shopify"
      ? ShopifyCheckout
      : StripeCheckout;

  return (
    <ErrorBoundary fallback={<CheckoutErrorFallback />}>
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
