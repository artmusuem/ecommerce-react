import { useCart as useHydrogenCart } from '@shopify/hydrogen-react'

interface CartLineData {
  id?: string
  attributes?: Array<{ key?: string; value?: string | null }>
  merchandise?: {
    product?: {
      handle?: string
      title?: string
      vendor?: string
    }
    image?: {
      url?: string
    }
  }
  cost?: {
    totalAmount?: {
      amount?: string
    }
  }
  quantity?: number
}

/**
 * Shopify Cart Hook Adapter
 *
 * Bridges hydrogen-react's useCart with this app's cart interface.
 * For products with custom options (frames/sizes), these are stored
 * as line item attributes and the checkout URL redirects to Shopify.
 */
export function useShopifyCart() {
  const cart = useHydrogenCart()

  // Transform Shopify cart lines to our app's cart item format
  const lines = (cart.lines || []) as CartLineData[]
  const items = lines
    .filter((line): line is CartLineData & { id: string } => Boolean(line?.id))
    .map((line) => {
      // Extract custom attributes (frame, size)
      const attributes = line.attributes || []
      const frameId =
        attributes.find((a) => a.key === 'frameId')?.value || 'black'
      const sizeId =
        attributes.find((a) => a.key === 'sizeId')?.value || '8x10'

      return {
        key: line.id,
        productId: line.merchandise?.product?.handle || '',
        sizeId,
        frameId,
        title: line.merchandise?.product?.title || '',
        artist: line.merchandise?.product?.vendor || 'Unknown',
        image: line.merchandise?.image?.url || '',
        price: parseFloat(line.cost?.totalAmount?.amount || '0'),
        quantity: line.quantity || 0,
      }
    })

  const total = cart.cost?.totalAmount
    ? parseFloat(cart.cost.totalAmount.amount || '0')
    : 0

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    // Cart state
    items,
    isOpen: false, // Managed separately in UI
    total,
    itemCount,

    // Cart actions
    addItem: cart.linesAdd,
    removeItem: (lineId: string) => cart.linesRemove([lineId]),
    updateQuantity: (lineId: string, quantity: number) =>
      cart.linesUpdate([{ id: lineId, quantity }]),
    clearCart: () => {
      const lineIds = items.map((item) => item.key)
      if (lineIds.length > 0) {
        cart.linesRemove(lineIds)
      }
    },

    // Checkout URL - redirects to Shopify checkout
    checkoutUrl: cart.checkoutUrl,

    // Status
    status: cart.status,
    error: cart.error,
  }
}

/**
 * Helper to add an item to Shopify cart with custom attributes
 */
export function createAddToCartPayload(
  variantId: string,
  quantity: number,
  options: {
    sizeId?: string
    frameId?: string
    [key: string]: string | undefined
  }
) {
  const attributes = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({ key, value: value as string }))

  return {
    merchandiseId: variantId,
    quantity,
    attributes,
  }
}
