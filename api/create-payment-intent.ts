import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

// Check if Stripe key is configured and valid format
const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
const isValidKey = stripeKey && (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_'))

if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not configured')
} else if (!isValidKey) {
  console.error('STRIPE_SECRET_KEY has invalid format. Expected sk_test_... or sk_live_...')
}

const stripe = isValidKey ? new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
}) : null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check Stripe is configured
  if (!stripe) {
    const details = !stripeKey
      ? 'STRIPE_SECRET_KEY environment variable is missing'
      : 'STRIPE_SECRET_KEY has invalid format (should start with sk_test_ or sk_live_)'
    return res.status(500).json({
      error: 'Stripe is not configured',
      details,
      keyPresent: !!stripeKey,
      keyLength: stripeKey?.length || 0
    })
  }

  try {
    const { total } = req.body

    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' })
    }

    // Create payment intent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Stripe error:', error)

    // Return more specific error info
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        type: error.type,
        code: error.code
      })
    }

    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
