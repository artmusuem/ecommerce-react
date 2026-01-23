import Stripe from 'stripe'

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.VITE_SHOPIFY_STORE
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null

interface LineItem {
  title: string
  quantity: number
  price: string
  variantId?: string
  productId?: string
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

// GraphQL query to find existing order by payment intent (idempotency)
const FIND_ORDER_BY_NOTE = `
  query findOrderByNote($query: String!) {
    orders(first: 1, query: $query) {
      edges {
        node {
          id
          name
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

// GraphQL mutation to adjust inventory
const INVENTORY_ADJUST = `
  mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      inventoryAdjustmentGroup {
        reason
        changes {
          name
          delta
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

// GraphQL query to get variant inventory info
const GET_VARIANT_INVENTORY = `
  query getVariantInventory($id: ID!) {
    productVariant(id: $id) {
      id
      inventoryItem {
        id
        inventoryLevels(first: 1) {
          edges {
            node {
              id
              location {
                id
              }
              quantities(names: ["available"]) {
                name
                quantity
              }
            }
          }
        }
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

// Verify Stripe payment - CRITICAL SECURITY CHECK
async function verifyStripePayment(paymentIntentId: string): Promise<{ verified: boolean; amount?: number; error?: string }> {
  if (!stripe) {
    console.warn('Stripe not configured - skipping payment verification')
    return { verified: true } // Allow in dev mode without Stripe
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return {
        verified: false,
        error: `Payment not completed. Status: ${paymentIntent.status}`
      }
    }

    return {
      verified: true,
      amount: paymentIntent.amount / 100 // Convert from cents
    }
  } catch (error) {
    console.error('Stripe verification error:', error)
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Failed to verify payment'
    }
  }
}

// Check if order already exists for this payment intent (idempotency)
async function findExistingOrder(paymentIntentId: string): Promise<{ exists: boolean; order?: { id: string; name: string; total: string } }> {
  try {
    // Use exact match in note field to prevent false positives
    const result = await shopifyAdminRequest(FIND_ORDER_BY_NOTE, {
      query: `note:"Stripe Payment Intent: ${paymentIntentId}"`
    })

    const existingOrder = result.data?.orders?.edges?.[0]?.node
    if (existingOrder) {
      console.info(`Found existing order ${existingOrder.name} for payment intent ${paymentIntentId}`)
      return {
        exists: true,
        order: {
          id: existingOrder.id,
          name: existingOrder.name,
          total: existingOrder.totalPriceSet?.shopMoney?.amount
        }
      }
    }

    return { exists: false }
  } catch (error) {
    console.error('Error checking for existing order:', error)
    return { exists: false }
  }
}

// Adjust inventory for purchased items
async function adjustInventory(lineItems: LineItem[]): Promise<void> {
  for (const item of lineItems) {
    if (!item.variantId) continue

    try {
      // Get inventory item ID for the variant
      const variantResult = await shopifyAdminRequest(GET_VARIANT_INVENTORY, {
        id: item.variantId
      })

      const inventoryItem = variantResult.data?.productVariant?.inventoryItem
      const inventoryLevel = inventoryItem?.inventoryLevels?.edges?.[0]?.node

      if (!inventoryItem?.id || !inventoryLevel?.location?.id) {
        console.warn(`No inventory found for variant ${item.variantId}`)
        continue
      }

      // Adjust inventory (reduce by quantity purchased)
      await shopifyAdminRequest(INVENTORY_ADJUST, {
        input: {
          reason: 'sale',
          name: 'available',
          changes: [{
            inventoryItemId: inventoryItem.id,
            locationId: inventoryLevel.location.id,
            delta: -item.quantity
          }]
        }
      })

      console.info(`Adjusted inventory for ${item.variantId}: -${item.quantity}`)
    } catch (error) {
      console.error(`Failed to adjust inventory for ${item.variantId}:`, error)
      // Don't fail the order for inventory errors - just log
    }
  }
}

// Resource route - only action, no component
export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check configuration
  if (!SHOPIFY_STORE || !SHOPIFY_ADMIN_TOKEN) {
    return new Response(JSON.stringify({
      error: 'Shopify not configured',
      details: {
        hasStore: !!SHOPIFY_STORE,
        hasToken: !!SHOPIFY_ADMIN_TOKEN,
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { email, lineItems, shippingAddress, paymentIntentId, total } = body as {
      email: string
      lineItems: LineItem[]
      shippingAddress: ShippingAddress
      paymentIntentId: string
      total: number
    }

    // Validate required fields
    if (!email || !lineItems?.length || !shippingAddress || !paymentIntentId) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        required: ['email', 'lineItems', 'shippingAddress', 'paymentIntentId']
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // STEP 1: Verify Stripe Payment (SECURITY)
    // ========================================
    console.info('Verifying Stripe payment...')
    const verification = await verifyStripePayment(paymentIntentId)

    if (!verification.verified) {
      console.error('Payment verification failed:', verification.error)
      return new Response(JSON.stringify({
        error: 'Payment verification failed',
        details: verification.error
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify payment amount matches expected total (with small tolerance for rounding)
    if (verification.amount && total) {
      const tolerance = 0.01 // 1 cent tolerance for rounding
      if (Math.abs(verification.amount - total) > tolerance) {
        console.error('Payment amount mismatch:', { paid: verification.amount, expected: total })
        return new Response(JSON.stringify({
          error: 'Payment amount mismatch',
          details: `Paid: $${verification.amount}, Expected: $${total}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    console.info('Payment verified successfully')

    // ========================================
    // STEP 2: Check for Existing Order (Idempotency)
    // ========================================
    console.info('Checking for existing order...')
    const existing = await findExistingOrder(paymentIntentId)

    if (existing.exists && existing.order) {
      console.info('Order already exists:', existing.order.name)
      return new Response(JSON.stringify({
        success: true,
        order: existing.order,
        stripePaymentIntent: paymentIntentId,
        note: 'Order already processed'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ========================================
    // STEP 3: Create Draft Order in Shopify
    // ========================================
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
        ...(item.variantId && { variantId: item.variantId }),
      })),
      tags: ['headless-checkout', 'stripe-payment'],
    }

    console.info('Creating draft order...')
    const createResult = await shopifyAdminRequest(DRAFT_ORDER_CREATE, {
      input: draftOrderInput
    })

    if (createResult.data?.draftOrderCreate?.userErrors?.length > 0) {
      const errors = createResult.data.draftOrderCreate.userErrors
      console.error('Draft order creation errors:', errors)
      return new Response(JSON.stringify({
        error: 'Failed to create draft order',
        details: errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const draftOrderId = createResult.data?.draftOrderCreate?.draftOrder?.id
    if (!draftOrderId) {
      console.error('No draft order ID returned:', createResult)
      return new Response(JSON.stringify({
        error: 'Draft order creation failed',
        details: createResult
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.info('Draft order created:', draftOrderId)

    // ========================================
    // STEP 4: Complete Draft Order (Mark as Paid)
    // ========================================
    console.info('Completing draft order...')
    const completeResult = await shopifyAdminRequest(DRAFT_ORDER_COMPLETE, {
      id: draftOrderId
    })

    if (completeResult.data?.draftOrderComplete?.userErrors?.length > 0) {
      const errors = completeResult.data.draftOrderComplete.userErrors
      console.error('Draft order completion errors:', errors)
      return new Response(JSON.stringify({
        error: 'Failed to complete draft order',
        details: errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const order = completeResult.data?.draftOrderComplete?.draftOrder?.order
    if (!order) {
      console.error('No order returned:', completeResult)
      return new Response(JSON.stringify({
        error: 'Order completion failed',
        details: completeResult
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.info('Order created successfully:', order.name)

    // ========================================
    // STEP 5: Adjust Inventory (Non-blocking)
    // ========================================
    // Run inventory adjustment in background - don't block order confirmation
    adjustInventory(lineItems).catch(err => {
      console.error('Background inventory adjustment failed:', err)
    })

    // Return success with order details
    return new Response(JSON.stringify({
      success: true,
      order: {
        id: order.id,
        name: order.name,
        total: order.totalPriceSet?.shopMoney?.amount,
        currency: order.totalPriceSet?.shopMoney?.currencyCode,
        customerEmail: order.customer?.email,
      },
      stripePaymentIntent: paymentIntentId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
