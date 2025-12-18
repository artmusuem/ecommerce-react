import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart, useCartDispatch } from '../context/CartContext'
import { sizes, frames } from '../data/products'
import { getResizedImage } from '../utils/images'

// Load Stripe outside component to avoid recreating on render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder')

function CheckoutForm({ total }) {
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useCartDispatch()
  const [email, setEmail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message)
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
      setError(confirmError.message)
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Email for receipt
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Payment details
        </label>
        <div className="bg-white border border-stone-300 rounded-xl p-4">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
          processing
            ? 'bg-stone-400 cursor-not-allowed'
            : 'bg-stone-800 hover:bg-stone-700'
        } text-white`}
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

      <p className="text-xs text-center text-stone-400 flex items-center justify-center gap-1">
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
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-display font-semibold text-stone-800 mb-4">
        Thank you for your order!
      </h1>
      <p className="text-stone-600 mb-2">
        Your payment was successful and your prints are being prepared.
      </p>
      <p className="text-sm text-stone-400 mb-8">
        Order ID: {paymentIntent?.slice(-8).toUpperCase() || 'Processing...'}
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </main>
  )
}

export default function Checkout() {
  const { items, total } = useCart()
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()

  // Check for success redirect
  if (searchParams.get('success') || searchParams.get('redirect_status') === 'succeeded') {
    return <SuccessMessage />
  }

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
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-display text-stone-800 mb-4">Your cart is empty</h1>
        <Link to="/" className="text-stone-600 underline hover:text-stone-800">
          Continue shopping
        </Link>
      </main>
    )
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#292524',
      colorBackground: '#ffffff',
      colorText: '#1c1917',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '12px',
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-semibold text-stone-800 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary - First on mobile, Left on desktop */}
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Order Summary</h2>
          <div className="bg-stone-50 rounded-2xl p-5 space-y-4">
            {items.map((item) => {
              const size = sizes.find(s => s.id === item.sizeId)
              const frame = frames.find(f => f.id === item.frameId)
              
              return (
                <div key={item.key} className="flex gap-4">
                  <img
                    src={getResizedImage(item.image, 100)}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-800 text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {size?.name} • {frame?.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-stone-800">${item.price * item.quantity}</span>
                </div>
              )
            })}
            
            <div className="border-t border-stone-200 pt-4 flex justify-between items-center">
              <span className="text-stone-600">Total</span>
              <span className="text-2xl font-display font-semibold text-stone-800">${total}</span>
            </div>
          </div>
        </div>

        {/* Payment Form - Second on mobile, Right on desktop */}
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Payment</h2>
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-stone-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
                >
                  Try Again
                </button>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                <CheckoutForm total={total} />
              </Elements>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link to="/" className="text-stone-500 hover:text-stone-700 transition-colors inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Continue shopping
        </Link>
      </div>
    </main>
  )
}
