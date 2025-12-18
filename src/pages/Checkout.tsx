import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { useCart, useCartDispatch } from '../context/CartContext'
import { sizes, frames } from '../data/products'
import { getResizedImage } from '../utils/images'

// DON'T load Stripe at module level - lazy load it when component mounts
let stripePromise: Promise<Stripe | null> | null = null

function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '')
  }
  return stripePromise
}

function CheckoutForm({ total }: { total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setProcessing(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?success=true`,
        receipt_email: email,
      },
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-gray-700)' }}
        >
          Email for receipt
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all"
          style={{ 
            borderColor: 'var(--color-gray-200)',
            backgroundColor: 'var(--color-white)'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-gray-200)'}
        />
      </div>

      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-gray-700)' }}
        >
          Payment details
        </label>
        <div 
          className="border-2 rounded-xl p-4"
          style={{ 
            borderColor: 'var(--color-gray-200)',
            backgroundColor: 'var(--color-white)'
          }}
        >
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div 
          className="px-4 py-3 rounded-xl text-sm"
          style={{ 
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626'
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 rounded-xl font-semibold text-lg text-white transition-all"
        style={{ 
          backgroundColor: processing ? 'var(--color-gray-400)' : 'var(--color-primary)',
          cursor: processing ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={(e) => !processing && (e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)')}
        onMouseLeave={(e) => !processing && (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${total}`
        )}
      </button>

      <p 
        className="text-xs text-center flex items-center justify-center gap-1"
        style={{ color: 'var(--color-gray-400)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Stripe
      </p>
    </form>
  )
}

function SuccessMessage() {
  const dispatch = useCartDispatch()
  const [searchParams] = useSearchParams()
  const paymentIntent = searchParams.get('payment_intent')

  useEffect(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [dispatch])

  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-gray-50)' }}
    >
      <div className="text-center">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#DCFCE7' }}
        >
          <svg className="w-10 h-10" fill="none" stroke="#16A34A" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 
          className="text-3xl font-display font-semibold mb-4"
          style={{ color: 'var(--color-gray-900)' }}
        >
          Thank you for your order!
        </h1>
        <p 
          className="mb-2"
          style={{ color: 'var(--color-gray-600)' }}
        >
          Your payment was successful and your prints are being prepared.
        </p>
        <p 
          className="text-sm mb-8"
          style={{ color: 'var(--color-gray-400)' }}
        >
          Order ID: {paymentIntent?.slice(-8).toUpperCase() || 'Processing...'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-all btn-primary"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}

export default function Checkout() {
  const { items, total } = useCart()
  const [clientSecret, setClientSecret] = useState('')
  const [stripeReady, setStripeReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()

  // Check for success redirect
  if (searchParams.get('success') || searchParams.get('redirect_status') === 'succeeded') {
    return <SuccessMessage />
  }

  // Lazy load Stripe only when this component mounts
  useEffect(() => {
    getStripe().then(() => setStripeReady(true))
  }, [])

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false)
      return
    }

    async function createPaymentIntent() {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, total })
        })

        if (!response.ok) {
          throw new Error('Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error('Payment intent error:', err)
        setError('Unable to initialize payment. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [items, total])

  if (items.length === 0) {
    return (
      <main 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--color-gray-50)' }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-gray-100)' }}
          >
            <svg 
              className="w-8 h-8" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--color-gray-400)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 
            className="text-2xl font-display mb-4"
            style={{ color: 'var(--color-gray-800)' }}
          >
            Your cart is empty
          </h1>
          <Link 
            to="/" 
            className="underline transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0A5EB8',
      colorBackground: '#ffffff',
      colorText: '#1E293B',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '12px',
    }
  }

  return (
    <main 
      className="min-h-screen py-8"
      style={{ backgroundColor: 'var(--color-gray-50)' }}
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 text-sm mb-6 transition-colors"
          style={{ color: 'var(--color-gray-500)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gray-700)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray-500)'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to shop
        </Link>

        <h1 
          className="text-3xl font-display font-semibold mb-8"
          style={{ color: 'var(--color-gray-900)' }}
        >
          Checkout
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-gray-800)' }}
            >
              Order Summary
            </h2>
            <div 
              className="rounded-2xl p-5 space-y-4"
              style={{ backgroundColor: 'var(--color-white)' }}
            >
              {items.map((item) => {
                const size = sizes.find(s => s.id === item.sizeId)
                const frame = frames.find(f => f.id === item.frameId)
                
                // Build product state with selected options for the Product page
                const productState = {
                  product: {
                    id: item.productId,
                    title: item.title,
                    artist: item.artist,
                    image: item.image
                  },
                  selectedSizeId: item.sizeId,
                  selectedFrameId: item.frameId
                }

                return (
                  <div key={item.key} className="flex gap-4">
                    {/* Clickable image with frame color border */}
                    <Link
                      to={`/product/${encodeURIComponent(item.productId)}`}
                      state={productState}
                      className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: 'var(--color-gray-100)',
                        border: `3px solid ${frame?.color || '#333'}`,
                        boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img
                        src={getResizedImage(item.image, 100)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      {/* Clickable title */}
                      <Link
                        to={`/product/${encodeURIComponent(item.productId)}`}
                        state={productState}
                        className="block hover:underline"
                      >
                        <h3 
                          className="font-medium text-sm line-clamp-1"
                          style={{ color: 'var(--color-gray-800)' }}
                        >
                          {item.title}
                        </h3>
                      </Link>
                      {/* Size and Frame with color indicator */}
                      <p 
                        className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ color: 'var(--color-gray-500)' }}
                      >
                        {size?.name} • {frame?.name}
                        <span 
                          className="inline-block w-3 h-3 rounded border"
                          style={{ 
                            backgroundColor: frame?.color,
                            borderColor: 'var(--color-gray-300)'
                          }}
                        />
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: 'var(--color-gray-400)' }}
                      >
                        Qty: {item.quantity}
                      </p>
                    </div>
                    
                    <span 
                      className="font-semibold"
                      style={{ color: 'var(--color-gray-800)' }}
                    >
                      ${item.price * item.quantity}
                    </span>
                  </div>
                )
              })}

              <div 
                className="border-t pt-4 flex justify-between items-center"
                style={{ borderColor: 'var(--color-gray-200)' }}
              >
                <span style={{ color: 'var(--color-gray-600)' }}>Total</span>
                <span 
                  className="text-2xl font-display font-semibold"
                  style={{ color: 'var(--color-gray-900)' }}
                >
                  ${total}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-gray-800)' }}
            >
              Payment
            </h2>
            <div 
              className="rounded-2xl p-6"
              style={{ backgroundColor: 'var(--color-white)' }}
            >
              {loading || !stripeReady ? (
                <div className="flex items-center justify-center py-12">
                  <svg 
                    className="animate-spin h-8 w-8" 
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--color-gray-400)' }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 text-white rounded-lg btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              ) : clientSecret && stripeReady ? (
                <Elements stripe={getStripe()} options={{ clientSecret, appearance }}>
                  <CheckoutForm total={total} />
                </Elements>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
