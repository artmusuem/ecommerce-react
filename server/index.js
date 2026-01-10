import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Shopify Admin API config
const SHOPIFY_STORE = process.env.VITE_SHOPIFY_STORE
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN

app.use(cors({ origin: true }))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Create Stripe Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { items, total } = req.body

    if (!items || !total) {
      return res.status(400).json({ error: 'Missing items or total' })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        itemCount: items.length.toString(),
        items: JSON.stringify(items.map(i => ({
          id: i.productId,
          title: i.title,
          qty: i.quantity,
          size: i.sizeId,
          frame: i.frameId,
        }))),
      },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Payment intent error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Create Shopify Order (called after successful payment)
app.post('/api/create-order', async (req, res) => {
  try {
    const { items, customer, paymentIntentId } = req.body

    if (!SHOPIFY_ADMIN_TOKEN) {
      console.warn('SHOPIFY_ADMIN_TOKEN not set - skipping order creation')
      return res.json({ success: true, orderId: null, message: 'Order creation skipped (no admin token)' })
    }

    // Create order via Shopify Admin API
    const orderData = {
      order: {
        line_items: items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price.toString(),
          properties: [
            { name: 'Size', value: item.sizeId },
            { name: 'Frame', value: item.frameId },
          ],
        })),
        customer: customer ? {
          email: customer.email,
        } : undefined,
        financial_status: 'paid',
        note: `Stripe Payment: ${paymentIntentId}`,
        tags: 'headless,stripe',
      },
    }

    const response = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify(orderData),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shopify API error: ${error}`)
    }

    const result = await response.json()
    res.json({ success: true, orderId: result.order.id, orderNumber: result.order.order_number })
  } catch (err) {
    console.error('Order creation error:', err)
    res.status(500).json({ error: err.message })
  }
})

const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
  console.log(`Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`)
  console.log(`Shopify store: ${SHOPIFY_STORE}`)
  console.log('Server is listening... (keep this terminal open)')
})

server.on('error', (err) => {
  console.error('Server error:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
})
