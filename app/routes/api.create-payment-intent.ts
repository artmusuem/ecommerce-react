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
      keyPresent: !!stripeKey,
      keyLength: stripeKey?.length || 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { total } = body

    if (!total || total <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid total amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create payment intent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Stripe error:', error)

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
      error: 'Failed to create payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
