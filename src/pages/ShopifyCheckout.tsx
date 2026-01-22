import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useCart } from '../context/CartContext'

const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const CUSTOM_CHECKOUT_DOMAIN = import.meta.env.VITE_SHOPIFY_CHECKOUT_DOMAIN

// GraphQL mutation to create a cart
const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

async function shopifyFetch(query: string, variables: Record<string, unknown>) {
  // Type assertions are safe here - the caller (createShopifyCartAndRedirect)
  // validates that these env vars exist before calling this function
  const res = await fetch(
    `https://${SHOPIFY_STORE}/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN as string,
      },
      body: JSON.stringify({ query, variables }),
    }
  )
  return res.json()
}

// Check if a variant ID is a valid Shopify GID
function isValidShopifyGid(variantId: string): boolean {
  return variantId.startsWith('gid://shopify/ProductVariant/')
}

export default function ShopifyCheckout() {
  const { items, total } = useCart()
  const [status, setStatus] = useState<'waiting' | 'loading' | 'error' | 'redirecting'>('waiting')
  const [errorMsg, setErrorMsg] = useState('')
  const checkoutStarted = useRef(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for client-side hydration to complete before checking cart
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Start checkout when we have items (after hydration)
  useEffect(() => {
    // Don't run until hydrated
    if (!isHydrated) return

    // Don't start checkout if already started or if no items
    if (checkoutStarted.current || items.length === 0) return

    // Mark as started to prevent double execution
    checkoutStarted.current = true

    async function createShopifyCartAndRedirect() {
      // Validate Shopify configuration
      if (!SHOPIFY_STORE || !SHOPIFY_TOKEN) {
        setStatus('error')
        setErrorMsg('Shopify is not configured. Please set VITE_SHOPIFY_STORE and VITE_SHOPIFY_STOREFRONT_TOKEN.')
        return
      }

      try {
        setStatus('loading')

        // Build line items using variant IDs already in cart
        const lines = []
        const invalidItems = []

        for (const item of items) {
          // Check if variantId is a valid Shopify GID
          if (isValidShopifyGid(item.variantId)) {
            lines.push({
              merchandiseId: item.variantId,
              quantity: item.quantity,
            })
          } else {
            console.warn(`Invalid variant ID for ${item.title}: ${item.variantId}`)
            invalidItems.push(item.title)
          }
        }

        if (lines.length === 0) {
          throw new Error(
            `Unable to checkout. ${invalidItems.length > 0
              ? `Items need valid Shopify variant IDs: ${invalidItems.join(', ')}.`
              : 'No valid items in cart.'
            } Please clear your cart and add items again.`
          )
        }

        // Warn about skipped items
        if (invalidItems.length > 0) {
          console.warn(`Skipping items without valid Shopify variant IDs: ${invalidItems.join(', ')}`)
        }

        // Create cart with items
        const cartRes = await shopifyFetch(CREATE_CART_MUTATION, {
          input: { lines },
        })

        const checkoutUrl = cartRes.data?.cartCreate?.cart?.checkoutUrl
        const errors = cartRes.data?.cartCreate?.userErrors

        if (errors?.length > 0) {
          throw new Error(errors[0].message)
        }

        if (!checkoutUrl) {
          throw new Error('Failed to create checkout')
        }

        // Apply custom checkout domain if configured (for headless stores)
        let finalCheckoutUrl = checkoutUrl
        if (CUSTOM_CHECKOUT_DOMAIN) {
          try {
            const url = new URL(checkoutUrl)
            const customUrl = new URL(CUSTOM_CHECKOUT_DOMAIN)
            url.hostname = customUrl.hostname
            finalCheckoutUrl = url.toString()
          } catch {
            // Keep original URL if custom domain is invalid
          }
        }

        // Redirect to Shopify checkout
        // Note: Don't clear the cart here - the page will unload on redirect.
        // If the user cancels checkout and returns, their cart should still have items.
        // The cart should only be cleared on successful order completion (via webhook or return URL).
        setStatus('redirecting')
        window.location.href = finalCheckoutUrl
      } catch (err) {
        console.error('Checkout error:', err)
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Checkout failed')
      }
    }

    createShopifyCartAndRedirect()
  }, [isHydrated, items, total])

  // Show loading while waiting for hydration
  if (!isHydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-2 text-gray-800">Loading...</h1>
        </div>
      </main>
    )
  }

  // Show empty cart after hydration if no items
  if (items.length === 0 && status !== 'loading' && status !== 'redirecting') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-4 text-gray-800">Your cart is empty</h1>
          <Link to="/" className="underline transition-colors text-primary hover:text-primary-dark">
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center">
        {(status === 'waiting' || status === 'loading') && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
              <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display mb-2 text-gray-800">Preparing checkout...</h1>
            <p className="text-gray-500">Creating your Shopify cart with {items.length} item(s)</p>
            <p className="text-sm text-gray-400 mt-2">Total: ${total}</p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-display mb-2 text-gray-800">Redirecting to Shopify...</h1>
            <p className="text-gray-500">You'll complete payment on Shopify's secure checkout</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-display mb-2 text-gray-800">Checkout Error</h1>
            <p className="text-red-600 mb-4">{errorMsg}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Try Again
              </button>
              <Link to="/" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Back to Shop
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
