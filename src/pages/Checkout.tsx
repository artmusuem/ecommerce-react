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

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  province: string
  zip: string
  country: string
  phone: string
}

interface CartItem {
  key: string
  productId: string
  variantId: string
  title: string
  artist: string
  image: string
  sizeId: string
  frameId: string
  price: number
  quantity: number
}

interface CheckoutFormProps {
  total: number
  items: CartItem[]
  shippingAddress: ShippingAddress
  email: string
  onSuccess: (orderName: string) => void
}

function CheckoutForm({ total, items, shippingAddress, email, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    try {
      // Step 1: Submit payment element
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'Payment failed')
        setProcessing(false)
        return
      }

      // Step 2: Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: email,
        },
        redirect: 'if_required', // Don't redirect, handle inline
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setProcessing(false)
        return
      }

      // Step 3: Payment succeeded - create order in Shopify
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const lineItems = items.map(item => {
          const size = sizes.find(s => s.id === item.sizeId)
          const frame = frames.find(f => f.id === item.frameId)
          return {
            title: `${item.title} - ${size?.name || item.sizeId}, ${frame?.name || item.frameId} Frame`,
            quantity: item.quantity,
            price: String(item.price),
            variantId: item.variantId,
            productId: item.productId,
          }
        })

        const orderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            lineItems,
            shippingAddress,
            paymentIntentId: paymentIntent.id,
            total,
          }),
        })

        const orderData = await orderResponse.json()

        if (!orderResponse.ok) {
          console.error('Order creation failed:', orderData)
          // Payment succeeded but order creation failed - still show success
          // but log the error for manual resolution
          onSuccess(paymentIntent.id.slice(-8).toUpperCase())
          return
        }

        onSuccess(orderData.order?.name || paymentIntent.id.slice(-8).toUpperCase())
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An unexpected error occurred. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Payment details
        </label>
        <div className="border-2 rounded-xl p-4 border-gray-200 bg-white">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all ${
          processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark cursor-pointer'
        }`}
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

      <p className="text-xs text-center flex items-center justify-center gap-1 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Stripe
      </p>
    </form>
  )
}

function SuccessMessage({ orderName }: { orderName: string }) {
  const dispatch = useCartDispatch()

  useEffect(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [dispatch])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center">
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
        <p className="text-sm mb-8 text-gray-400">
          Order: {orderName}
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

// Shipping address form component
function ShippingForm({
  address,
  setAddress,
  email,
  setEmail
}: {
  address: ShippingAddress
  setAddress: (address: ShippingAddress) => void
  email: string
  setEmail: (email: string) => void
}) {
  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress({ ...address, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={address.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={address.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Address
        </label>
        <input
          type="text"
          value={address.address1}
          onChange={(e) => updateField('address1', e.target.value)}
          placeholder="Street address"
          required
          className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          value={address.address2}
          onChange={(e) => updateField('address2', e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            City
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => updateField('city', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            State/Province
          </label>
          <input
            type="text"
            value={address.province}
            onChange={(e) => updateField('province', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            ZIP/Postal Code
          </label>
          <input
            type="text"
            value={address.zip}
            onChange={(e) => updateField('zip', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Country
          </label>
          <select
            value={address.country}
            onChange={(e) => updateField('country', e.target.value)}
            required
            className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Phone (optional)
        </label>
        <input
          type="tel"
          value={address.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="(555) 555-5555"
          className="w-full px-4 py-3 border-2 rounded-xl outline-none transition-all border-gray-200 bg-white focus:border-primary"
        />
      </div>
    </div>
  )
}

export default function Checkout() {
  const { items, total } = useCart()
  const [clientSecret, setClientSecret] = useState('')
  const [stripeReady, setStripeReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()

  // Order success state
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderName, setOrderName] = useState('')

  // Customer info state
  const [email, setEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    country: 'US',
    phone: '',
  })

  // Check for success from URL (legacy support)
  const isSuccessFromUrl = searchParams.get('success') || searchParams.get('redirect_status') === 'succeeded'

  // Lazy load Stripe only when this component mounts
  useEffect(() => {
    if (isSuccessFromUrl || orderComplete) return
    getStripe().then(() => setStripeReady(true))
  }, [isSuccessFromUrl, orderComplete])

  useEffect(() => {
    if (isSuccessFromUrl || orderComplete) return
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
  }, [items, total, isSuccessFromUrl, orderComplete])

  // Handle successful order
  const handleOrderSuccess = (name: string) => {
    setOrderName(name)
    setOrderComplete(true)
  }

  // Check if shipping form is complete
  const isShippingComplete = email &&
    shippingAddress.firstName &&
    shippingAddress.lastName &&
    shippingAddress.address1 &&
    shippingAddress.city &&
    shippingAddress.province &&
    shippingAddress.zip

  // Return success page
  if (isSuccessFromUrl || orderComplete) {
    const displayOrderName = orderName || searchParams.get('payment_intent')?.slice(-8).toUpperCase() || 'Processing...'
    return <SuccessMessage orderName={displayOrderName} />
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-4 text-gray-800">
            Your cart is empty
          </h1>
          <Link
            to="/"
            className="underline transition-colors text-primary hover:text-primary-dark"
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
    <main className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm mb-6 transition-colors text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to shop
        </Link>

        <h1 className="text-3xl font-display font-semibold mb-8 text-gray-900">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Address */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Shipping Address
            </h2>
            <div className="rounded-2xl p-5 bg-white">
              <ShippingForm
                address={shippingAddress}
                setAddress={setShippingAddress}
                email={email}
                setEmail={setEmail}
              />
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Payment
            </h2>
            <div className="rounded-2xl p-6 bg-white">
              {!isShippingComplete ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Please fill in your shipping address first</p>
                </div>
              ) : loading || !stripeReady ? (
                <div className="flex items-center justify-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 text-gray-400"
                    viewBox="0 0 24 24"
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
                  <CheckoutForm
                    total={total}
                    items={items}
                    shippingAddress={shippingAddress}
                    email={email}
                    onSuccess={handleOrderSuccess}
                  />
                </Elements>
              ) : null}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Order Summary
            </h2>
            <div className="rounded-2xl p-5 space-y-4 bg-white sticky top-4">
              {items.map((item) => {
                const size = sizes.find(s => s.id === item.sizeId)
                const frame = frames.find(f => f.id === item.frameId)

                return (
                  <div key={item.key} className="flex gap-3">
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
                      style={{
                        border: `2px solid ${frame?.color || '#333'}`,
                      }}
                    >
                      <img
                        src={getResizedImage(item.image, 80)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1 text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-xs mt-0.5 text-gray-500">
                        {size?.name} • {frame?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <span className="font-semibold text-sm text-gray-800">
                      ${item.price * item.quantity}
                    </span>
                  </div>
                )
              })}

              <div className="border-t pt-4 space-y-2 border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-800">Total</span>
                  <span className="text-xl font-display font-semibold text-gray-900">
                    ${total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
