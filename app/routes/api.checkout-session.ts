import Stripe from 'stripe'

// Check if Stripe key is configured and valid format
const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
const isValidKey = stripeKey && (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_'))

const stripe = isValidKey ? new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
}) : null

// Resource route - GET handler
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session_id')

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Stripe is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    })

    return new Response(JSON.stringify({
      status: session.status,
      customer_email: session.customer_details?.email || session.customer_email,
      amount_total: session.amount_total,
      shipping_details: session.shipping_details,
      metadata: session.metadata,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return new Response(JSON.stringify({
        error: error.message,
        type: error.type,
      }), {
        status: error.statusCode || 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      error: 'Failed to fetch session',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
