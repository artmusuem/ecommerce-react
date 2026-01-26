import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useCartDispatch } from '@/context/CartContext'
import { trackPurchase } from '@/utils/analytics'

interface SessionData {
  status: string
  customer_email: string
  amount_total: number
  payment_intent: string
  shipping_details?: {
    name: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  metadata?: {
    cart_items?: string
  }
}

export default function CheckoutComplete() {
  const [searchParams] = useSearchParams()
  const dispatch = useCartDispatch()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [orderName, setOrderName] = useState<string>('')

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    async function fetchSessionAndCreateOrder() {
      try {
        // Fetch session details from Stripe
        const sessionResponse = await fetch(`/api/checkout-session?session_id=${sessionId}`)
        if (!sessionResponse.ok) {
          throw new Error('Failed to fetch session')
        }

        const data: SessionData = await sessionResponse.json()
        setSessionData(data)

        if (data.status === 'complete') {
          // Create order in Shopify
          const cartItems = data.metadata?.cart_items ? JSON.parse(data.metadata.cart_items) : []

          const orderResponse = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.customer_email,
              lineItems: cartItems.map((item: {
                title: string
                sizeId: string
                frameId: string
                price: number
                quantity: number
                variantId: string
                productId: string
              }) => ({
                title: `${item.title} - ${item.sizeId}, ${item.frameId} Frame`,
                quantity: item.quantity,
                price: String(item.price),
                variantId: item.variantId,
                productId: item.productId,
              })),
              shippingAddress: data.shipping_details ? {
                firstName: data.shipping_details.name.split(' ')[0] || '',
                lastName: data.shipping_details.name.split(' ').slice(1).join(' ') || '',
                address1: data.shipping_details.address.line1,
                address2: data.shipping_details.address.line2 || '',
                city: data.shipping_details.address.city,
                province: data.shipping_details.address.state,
                zip: data.shipping_details.address.postal_code,
                country: data.shipping_details.address.country,
                phone: '',
              } : null,
              paymentIntentId: data.payment_intent,
              total: (data.amount_total || 0) / 100,
            }),
          })

          const orderData = await orderResponse.json()
          const generatedOrderName = orderData.order?.name || sessionId?.slice(-8).toUpperCase() || 'ORDER'
          setOrderName(generatedOrderName)

          // Track purchase in analytics
          trackPurchase(
            generatedOrderName,
            cartItems.map((item: { productId: string; title: string; price: number; quantity: number; sizeId: string; frameId: string }) => ({
              id: item.productId,
              name: item.title,
              price: item.price,
              quantity: item.quantity,
              variant: `${item.sizeId} / ${item.frameId}`,
            })),
            (data.amount_total || 0) / 100,
            0,
            0
          )

          // Clear the cart
          dispatch({ type: 'CLEAR_CART' })
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch (err) {
        console.error('Error processing checkout completion:', err)
        setStatus('error')
      }
    }

    fetchSessionAndCreateOrder()
  }, [sessionId, dispatch])

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
            <svg className="animate-spin h-8 w-8 text-ink-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 className="text-xl font-display text-gray-800">
            Processing your order...
          </h1>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-4 text-gray-800">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't process your order. If you were charged, please contact support with your session ID.
          </p>
          {sessionId && (
            <p className="text-xs text-gray-400 mb-6">
              Session: {sessionId}
            </p>
          )}
          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-all bg-ink-900 hover:bg-ink-800"
          >
            Try Again
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-display font-semibold mb-4 text-gray-900">
          Thank you for your order!
        </h1>
        <p className="mb-2 text-gray-600">
          Your payment was successful and your prints are being prepared.
        </p>
        {sessionData?.customer_email && (
          <p className="text-sm text-gray-500 mb-2">
            Confirmation sent to {sessionData.customer_email}
          </p>
        )}
        <p className="text-sm mb-8 text-gray-400">
          Order: {orderName}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-all bg-ink-900 hover:bg-ink-800"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
