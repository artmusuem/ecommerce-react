/**
 * Print Fulfillment Services
 *
 * This module provides interfaces and implementations for print-on-demand
 * fulfillment providers. Configure your preferred provider using environment
 * variables.
 *
 * Supported Providers:
 * - Printful (most popular, global fulfillment)
 * - Prodigi (premium quality, global network) [coming soon]
 * - Gooten (competitive pricing) [coming soon]
 * - SPOD (fast EU/US shipping) [coming soon]
 *
 * @example
 * // Using Printful
 * import { createPrintfulProvider } from '@/services/fulfillment'
 *
 * const fulfillment = createPrintfulProvider()
 * const rates = await fulfillment.getShippingRates(address, items)
 * const order = await fulfillment.createOrder(orderData)
 */

// Export types
export type {
  FulfillmentProvider,
  FulfillmentOrder,
  FulfillmentResponse,
  FulfillmentItem,
  Address,
  ShippingRate,
  ShippingMethod,
  OrderStatus,
  OrderStatusResponse,
  TrackingInfo,
} from './types'

export { FulfillmentError } from './types'

// Import and re-export Printful provider
import { PrintfulProvider, createPrintfulProvider } from './printful'
export { PrintfulProvider, createPrintfulProvider }

/**
 * Get the configured fulfillment provider
 *
 * Checks environment variables in order:
 * 1. PRINTFUL_API_KEY - Uses Printful
 * 2. PRODIGI_API_KEY - Uses Prodigi (not yet implemented)
 *
 * @throws Error if no provider is configured
 */
export function getFulfillmentProvider() {
  // Check for Printful
  if (process.env.PRINTFUL_API_KEY) {
    return createPrintfulProvider()
  }

  // Check for Prodigi (placeholder)
  if (process.env.PRODIGI_API_KEY) {
    throw new Error('Prodigi provider not yet implemented')
  }

  throw new Error(
    'No fulfillment provider configured. Set PRINTFUL_API_KEY or PRODIGI_API_KEY environment variable.'
  )
}
