import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { useCart, useCartDispatch } from '../context/CartContext'
import { sizes, frames } from '../data/products'
import { getResizedImage } from '../utils/images'
import { trackBeginCheckout, trackAddPaymentInfo, trackPurchase } from '../utils/analytics'

// Lazy load Stripe
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
  isFormValid: boolean
  onValidate: () => void
}

function CheckoutForm({ total, items, shippingAddress, email, onSuccess, isFormValid, onValidate }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyticsItems = items.map(item => ({
    id: item.productId,
    name: item.title,
    price: item.price,
    quantity: item.quantity,
    variant: `${item.sizeId} / ${item.frameId}`,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Trigger validation display
    onValidate()

    if (!stripe || !elements || !isFormValid) return

    setProcessing(true)
    setError(null)
    trackAddPaymentInfo(analyticsItems, total)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'Payment failed')
        setProcessing(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { receipt_email: email },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setProcessing(false)
        return
      }

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
        const orderName = orderData.order?.name || paymentIntent.id.slice(-8).toUpperCase()
        trackPurchase(orderName, analyticsItems, total, 0, 0)
        onSuccess(orderName)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An unexpected error occurred. Please try again.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-xl p-4 border-gray-200 bg-white">
        <PaymentElement />
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
          processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-ink-900 hover:bg-ink-800 cursor-pointer'
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
          `Pay $${total.toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-center flex items-center justify-center gap-1 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secure checkout powered by Stripe
      </p>
    </form>
  )
}

function SuccessMessage({ orderName }: { orderName: string }) {
  const dispatch = useCartDispatch()
  useEffect(() => { dispatch({ type: 'CLEAR_CART' }) }, [dispatch])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-display font-semibold mb-4 text-gray-900">Thank you for your order!</h1>
        <p className="mb-2 text-gray-600">Your payment was successful and your prints are being prepared.</p>
        <p className="text-sm mb-8 text-gray-400">Order: {orderName}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium bg-ink-900 hover:bg-ink-800">
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}

// Form field with validation
function FormField({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  required?: boolean
  error?: string | null
  autoComplete?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
          error
            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-gray-300 focus:border-ink-900 focus:ring-1 focus:ring-ink-900'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

// Order Summary
function OrderSummary({ items, total }: { items: CartItem[]; total: number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-ink-900 mb-4">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          // Use stored values directly, fallback to hardcoded data for legacy items
          const size = sizes.find(s => s.id === item.sizeId)
          const frame = frames.find(f => f.id === item.frameId)
          const sizeName = size?.name || item.sizeId
          const frameName = frame?.name || item.frameId
          const itemTotal = (item.price * item.quantity).toFixed(2)
          return (
            <div key={item.key} className="flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border-2" style={{ borderColor: frame?.color || '#e5e7eb' }}>
                <img src={getResizedImage(item.image, 80)} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-1 text-ink-900">{item.title}</h3>
                <p className="text-xs text-ink-500">{sizeName}{frameName && frameName !== 'Unframed' ? ` / ${frameName}` : ''}</p>
                <p className="text-xs text-ink-500">Qty: {item.quantity}</p>
              </div>
              <span className="font-medium text-sm text-ink-900">${itemTotal}</span>
            </div>
          )
        })}
      </div>

      <div className="border-t pt-4 space-y-2 border-gray-200">
        <div className="flex justify-between text-sm text-ink-600">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-ink-600">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="font-semibold text-ink-900">Total</span>
          <span className="text-xl font-semibold text-ink-900">${total.toFixed(2)}</span>
        </div>
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

  const [orderComplete, setOrderComplete] = useState(false)
  const [orderName, setOrderName] = useState('')

  // Form state
  const [email, setEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '', lastName: '', address1: '', address2: '',
    city: '', province: '', zip: '', country: 'US', phone: '',
  })

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showAllErrors, setShowAllErrors] = useState(false)

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))
  const shouldShowError = (field: string) => showAllErrors || touched[field]

  // Validation
  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const getError = (field: string, value: string, required = true) => {
    if (!shouldShowError(field)) return null
    if (required && !value.trim()) return 'This field is required'
    if (field === 'email' && value && !isEmailValid(value)) return 'Please enter a valid email'
    return null
  }

  const isFormValid = !!(
    email && isEmailValid(email) &&
    shippingAddress.lastName &&
    shippingAddress.address1 &&
    shippingAddress.city &&
    shippingAddress.province &&
    shippingAddress.zip
  )

  const handleValidate = () => setShowAllErrors(true)

  // Track begin_checkout
  const hasTrackedBeginCheckout = useRef(false)
  useEffect(() => {
    if (items.length === 0 || hasTrackedBeginCheckout.current) return
    hasTrackedBeginCheckout.current = true
    trackBeginCheckout(
      items.map(item => ({ id: item.productId, name: item.title, price: item.price, quantity: item.quantity, variant: `${item.sizeId} / ${item.frameId}` })),
      total
    )
  }, [items, total])

  const isSuccessFromUrl = searchParams.get('success') || searchParams.get('redirect_status') === 'succeeded'

  useEffect(() => {
    if (isSuccessFromUrl || orderComplete) return
    getStripe().then(() => setStripeReady(true))
  }, [isSuccessFromUrl, orderComplete])

  useEffect(() => {
    if (isSuccessFromUrl || orderComplete || items.length === 0) {
      setLoading(false)
      return
    }

    // Reset clientSecret to ensure fresh payment intent
    setClientSecret('')
    setLoading(true)

    async function createPaymentIntent() {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, total, timestamp: Date.now() })
        })
        if (!response.ok) throw new Error('Failed to create payment intent')
        const data = await response.json()
        console.info('New payment intent created:', data.clientSecret?.slice(0, 20) + '...')
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

  const handleOrderSuccess = (name: string) => {
    setOrderName(name)
    setOrderComplete(true)
  }

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress({ ...shippingAddress, [field]: value })
  }

  if (isSuccessFromUrl || orderComplete) {
    const displayOrderName = orderName || searchParams.get('payment_intent')?.slice(-8).toUpperCase() || 'Processing...'
    return <SuccessMessage orderName={displayOrderName} />
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display mb-4 text-gray-800">Your cart is empty</h1>
          <Link to="/" className="underline text-primary hover:text-primary-dark">Continue shopping</Link>
        </div>
      </main>
    )
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#1a1a1a',
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '8px',
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-ink-600 hover:text-ink-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Gallery Store</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left: Form */}
          <div>
            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-ink-900 mb-4">Contact</h2>
              <FormField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => markTouched('email')}
                placeholder="your@email.com"
                required
                error={getError('email', email)}
                autoComplete="email"
              />
            </section>

            {/* Shipping */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-ink-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="First name"
                    value={shippingAddress.firstName}
                    onChange={(v) => updateField('firstName', v)}
                    placeholder="John"
                    autoComplete="given-name"
                  />
                  <FormField
                    label="Last name"
                    value={shippingAddress.lastName}
                    onChange={(v) => updateField('lastName', v)}
                    onBlur={() => markTouched('lastName')}
                    placeholder="Doe"
                    required
                    error={getError('lastName', shippingAddress.lastName)}
                    autoComplete="family-name"
                  />
                </div>

                <FormField
                  label="Address"
                  value={shippingAddress.address1}
                  onChange={(v) => updateField('address1', v)}
                  onBlur={() => markTouched('address1')}
                  placeholder="123 Main St"
                  required
                  error={getError('address1', shippingAddress.address1)}
                  autoComplete="address-line1"
                />

                <FormField
                  label="Apartment, suite, etc."
                  value={shippingAddress.address2}
                  onChange={(v) => updateField('address2', v)}
                  placeholder="Apt 4B"
                  autoComplete="address-line2"
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    label="City"
                    value={shippingAddress.city}
                    onChange={(v) => updateField('city', v)}
                    onBlur={() => markTouched('city')}
                    placeholder="New York"
                    required
                    error={getError('city', shippingAddress.city)}
                    autoComplete="address-level2"
                  />
                  <FormField
                    label="State"
                    value={shippingAddress.province}
                    onChange={(v) => updateField('province', v)}
                    onBlur={() => markTouched('province')}
                    placeholder="NY"
                    required
                    error={getError('province', shippingAddress.province)}
                    autoComplete="address-level1"
                  />
                  <FormField
                    label="ZIP"
                    value={shippingAddress.zip}
                    onChange={(v) => updateField('zip', v)}
                    onBlur={() => markTouched('zip')}
                    placeholder="10001"
                    required
                    error={getError('zip', shippingAddress.zip)}
                    autoComplete="postal-code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Country</label>
                  <select
                    value={shippingAddress.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900 bg-white"
                    autoComplete="country"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>

                <FormField
                  label="Phone"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(v) => updateField('phone', v)}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                />
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-xl font-semibold text-ink-900 mb-4">Payment</h2>

              {loading || !stripeReady ? (
                <div className="flex items-center justify-center py-12 border border-gray-200 rounded-xl bg-white">
                  <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : error ? (
                <div className="text-center py-8 border border-gray-200 rounded-xl bg-white">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button onClick={() => window.location.reload()} className="px-6 py-2 text-white rounded-lg bg-ink-900 hover:bg-ink-800">
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
                    isFormValid={isFormValid}
                    onValidate={handleValidate}
                  />
                </Elements>
              ) : null}
            </section>
          </div>

          {/* Right: Order Summary */}
          <div className="mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-8">
              <OrderSummary items={items} total={total} />

              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Free worldwide shipping</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Estimated delivery: 5-10 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
