import type { VercelRequest, VercelResponse } from '@vercel/node'

const SHOPIFY_STORE = process.env.VITE_SHOPIFY_STORE || process.env.SHOPIFY_STORE
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN

interface LineItem {
  title: string
  quantity: number
  price: string
  variantId?: string
  productId?: string
  sku?: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  zip: string
  country: string
  phone?: string
}

interface OrderRequest {
  email: string
  lineItems: LineItem[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  paymentIntentId: string
  total: number
}

// GraphQL mutation to create draft order
const DRAFT_ORDER_CREATE = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        invoiceUrl
        totalPrice
      }
      userErrors {
        field
        message
      }
    }
  }
`

// GraphQL mutation to complete draft order (mark as paid)
const DRAFT_ORDER_COMPLETE = `
  mutation draftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id, paymentPending: false) {
      draftOrder {
        id
        order {
          id
          name
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            id
            email
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

async function shopifyAdminRequest(query: string, variables: Record<string, unknown>) {
  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN || '',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Shopify API error: ${response.status} - ${text}`)
  }

  return response.json()
}

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

  // Check configuration
  if (!SHOPIFY_STORE || !SHOPIFY_ADMIN_TOKEN) {
    return res.status(500).json({
      error: 'Shopify not configured',
      details: {
        hasStore: !!SHOPIFY_STORE,
        hasToken: !!SHOPIFY_ADMIN_TOKEN,
      }
    })
  }

  try {
    const { email, lineItems, shippingAddress, paymentIntentId } = req.body as OrderRequest

    // Validate required fields
    if (!email || !lineItems?.length || !shippingAddress || !paymentIntentId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'lineItems', 'shippingAddress', 'paymentIntentId']
      })
    }

    // Build draft order input
    const draftOrderInput = {
      email,
      note: `Stripe Payment Intent: ${paymentIntentId}`,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        province: shippingAddress.province,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
        phone: shippingAddress.phone || '',
      },
      lineItems: lineItems.map(item => ({
        title: item.title,
        quantity: item.quantity,
        originalUnitPrice: item.price,
        // If we have a variant ID, use it for inventory tracking
        ...(item.variantId && { variantId: item.variantId }),
      })),
      // Tag the order source
      tags: ['headless-checkout', 'stripe-payment'],
    }

    // Step 1: Create draft order
    console.log('Creating draft order...')
    const createResult = await shopifyAdminRequest(DRAFT_ORDER_CREATE, {
      input: draftOrderInput
    })

    if (createResult.data?.draftOrderCreate?.userErrors?.length > 0) {
      const errors = createResult.data.draftOrderCreate.userErrors
      console.error('Draft order creation errors:', errors)
      return res.status(400).json({
        error: 'Failed to create draft order',
        details: errors
      })
    }

    const draftOrderId = createResult.data?.draftOrderCreate?.draftOrder?.id
    if (!draftOrderId) {
      console.error('No draft order ID returned:', createResult)
      return res.status(500).json({
        error: 'Draft order creation failed',
        details: createResult
      })
    }

    console.log('Draft order created:', draftOrderId)

    // Step 2: Complete draft order (marks as paid)
    console.log('Completing draft order...')
    const completeResult = await shopifyAdminRequest(DRAFT_ORDER_COMPLETE, {
      id: draftOrderId
    })

    if (completeResult.data?.draftOrderComplete?.userErrors?.length > 0) {
      const errors = completeResult.data.draftOrderComplete.userErrors
      console.error('Draft order completion errors:', errors)
      return res.status(400).json({
        error: 'Failed to complete draft order',
        details: errors
      })
    }

    const order = completeResult.data?.draftOrderComplete?.draftOrder?.order
    if (!order) {
      console.error('No order returned:', completeResult)
      return res.status(500).json({
        error: 'Order completion failed',
        details: completeResult
      })
    }

    console.log('Order created successfully:', order.name)

    // Return success with order details
    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        name: order.name,
        total: order.totalPriceSet?.shopMoney?.amount,
        currency: order.totalPriceSet?.shopMoney?.currencyCode,
        customerEmail: order.customer?.email,
      },
      stripePaymentIntent: paymentIntentId
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return res.status(500).json({
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
