import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items, total } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Recalculate total server-side for security
    const calculatedTotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(calculatedTotal * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        itemCount: items.length.toString(),
        orderSummary: items.map(i => `${i.title} (${i.quantity})`).join(', ').slice(0, 500)
      }
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: error.message })
  }
}
