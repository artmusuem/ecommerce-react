import Stripe from 'stripe'

// Check if Stripe key is configured and valid format
const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
const isValidKey = stripeKey && (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_'))

const stripe = isValidKey ? new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
}) : null

// Resource route - only action, no component
export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check Stripe is configured
  if (!stripe) {
    const details = !stripeKey
      ? 'STRIPE_SECRET_KEY environment variable is missing'
      : 'STRIPE_SECRET_KEY has invalid format (should start with sk_test_ or sk_live_)'
    return new Response(JSON.stringify({
      error: 'Stripe is not configured',
      details,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { items, total } = body

    if (!total || total <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid total amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items in cart' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Build line items for Stripe Checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: {
      title: string
      sizeId: string
      frameId: string
      price: number
      quantity: number
      image?: string
    }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: `${item.sizeId} / ${item.frameId} Frame`,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Get the origin for return URL
    const origin = request.headers.get('origin') || 'http://localhost:5173'

    // Create Stripe Embedded Checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: lineItems,
      // Collect shipping address
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'BE', 'IT', 'ES'],
      },
      // Free shipping
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: 'Free worldwide shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
      ],
      // Return URL after checkout
      return_url: `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
      // Store cart data in metadata for order creation
      metadata: {
        cart_items: JSON.stringify(items.map((item: {
          productId: string
          variantId: string
          title: string
          sizeId: string
          frameId: string
          price: number
          quantity: number
        }) => ({
          productId: item.productId,
          variantId: item.variantId,
          title: item.title,
          sizeId: item.sizeId,
          frameId: item.frameId,
          price: item.price,
          quantity: item.quantity,
        }))),
      },
    })

    return new Response(JSON.stringify({
      clientSecret: session.client_secret,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Stripe checkout session error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return new Response(JSON.stringify({
        error: error.message,
        type: error.type,
        code: error.code
      }), {
        status: error.statusCode || 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
