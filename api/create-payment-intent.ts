import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

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
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
}
