import express from 'express'
import { createServer as createViteServer } from 'vite'
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function startServer() {
  const app = express()
  app.use(express.json())

  // Stripe API endpoint
  app.post('/api/create-payment-intent', async (req, res) => {
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
        amount: Math.round(calculatedTotal * 100), // Stripe uses cents
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          itemCount: items.length.toString(),
          orderSummary: items.map(i => `${i.title} (${i.quantity})`).join(', ').slice(0, 500)
        }
      })

      res.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
      console.error('Stripe error:', error)
      res.status(500).json({ error: error.message })
    }
  })

  // Create Vite dev server
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  })

  app.use(vite.middlewares)

  const PORT = process.env.PORT || 5173

  app.listen(PORT, () => {
    console.log('')
    console.log('  🎨 Gallery Store Dev Server')
    console.log('  ──────────────────────────')
    console.log(`  Local:   http://localhost:${PORT}`)
    console.log(`  API:     /api/create-payment-intent`)
    console.log(`  Stripe:  ${process.env.STRIPE_SECRET_KEY ? '✓ Connected' : '✗ Missing key'}`)
    console.log('')
  })
}

startServer()
