/**
 * Print Fulfillment Provider Types
 *
 * Defines the interface for integrating with print-on-demand services.
 * Compatible with:
 * - Printful (most popular, global fulfillment)
 * - Prodigi (premium quality, global network)
 * - Gooten (competitive pricing)
 * - SPOD (fast EU/US shipping)
 *
 * @example
 * // Create a fulfillment order
 * const provider = new PrintfulProvider(apiKey)
 * const order = await provider.createOrder({
 *   recipient: shippingAddress,
 *   items: lineItems,
 *   shippingMethod: 'STANDARD',
 * })
 */

// ============================================================================
// Address Types
// ============================================================================

export interface Address {
  /** Recipient first name */
  firstName: string
  /** Recipient last name */
  lastName: string
  /** Company name (optional) */
  company?: string
  /** Street address line 1 */
  address1: string
  /** Street address line 2 (optional) */
  address2?: string
  /** City */
  city: string
  /** State/Province code (e.g., 'CA', 'ON') */
  stateCode: string
  /** Postal/ZIP code */
  postalCode: string
  /** Country code (ISO 3166-1 alpha-2, e.g., 'US', 'CA', 'GB') */
  countryCode: string
  /** Phone number (optional, but recommended) */
  phone?: string
  /** Email address */
  email: string
}

// ============================================================================
// Product/Item Types
// ============================================================================

export interface FulfillmentItem {
  /** External item ID (your system's ID) */
  externalId: string
  /** Provider's product/variant ID */
  variantId: string
  /** Quantity to order */
  quantity: number
  /** Item name for order confirmation */
  name: string
  /** Print file URL (high-res image) */
  printFileUrl: string
  /** Preview file URL (optional, for packing slip) */
  previewUrl?: string
  /** Unit retail price (for customs/packing slip) */
  retailPrice?: number
  /** Additional item options */
  options?: Record<string, string>
}

// ============================================================================
// Shipping Types
// ============================================================================

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'ECONOMY'

export interface ShippingRate {
  /** Unique rate identifier */
  id: string
  /** Display name (e.g., "Standard Shipping") */
  name: string
  /** Shipping cost */
  cost: number
  /** Currency code */
  currency: string
  /** Estimated delivery time (e.g., "3-5 business days") */
  estimatedDelivery: string
  /** Minimum delivery days */
  minDeliveryDays?: number
  /** Maximum delivery days */
  maxDeliveryDays?: number
  /** Carrier name (e.g., "USPS", "FedEx") */
  carrier?: string
}

// ============================================================================
// Order Types
// ============================================================================

export interface FulfillmentOrder {
  /** External order ID (your Shopify order ID) */
  externalId: string
  /** Recipient address */
  recipient: Address
  /** Items to fulfill */
  items: FulfillmentItem[]
  /** Selected shipping method */
  shippingMethod: ShippingMethod
  /** Gift message (optional) */
  giftMessage?: string
  /** Packing slip message (optional) */
  packingSlipMessage?: string
  /** Is this a gift? */
  isGift?: boolean
}

export type OrderStatus =
  | 'pending'      // Order received, not yet processing
  | 'processing'   // Being produced
  | 'shipped'      // In transit
  | 'delivered'    // Delivered to recipient
  | 'canceled'     // Order canceled
  | 'failed'       // Production failed
  | 'on_hold'      // Order on hold (payment issue, etc.)

export interface FulfillmentResponse {
  /** Success indicator */
  success: boolean
  /** Provider's order ID */
  orderId: string
  /** Order status */
  status: OrderStatus
  /** Total cost */
  totalCost: number
  /** Currency code */
  currency: string
  /** Shipping cost */
  shippingCost: number
  /** Estimated ship date */
  estimatedShipDate?: string
  /** Error message (if failed) */
  error?: string
}

export interface TrackingInfo {
  /** Tracking number */
  trackingNumber: string
  /** Carrier name */
  carrier: string
  /** Tracking URL */
  trackingUrl: string
  /** Ship date */
  shipDate: string
  /** Estimated delivery date */
  estimatedDeliveryDate?: string
}

export interface OrderStatusResponse {
  /** Provider's order ID */
  orderId: string
  /** Current status */
  status: OrderStatus
  /** Status message */
  statusMessage?: string
  /** Tracking information (if shipped) */
  tracking?: TrackingInfo[]
  /** Last updated timestamp */
  updatedAt: string
}

// ============================================================================
// Provider Interface
// ============================================================================

/**
 * Fulfillment Provider Interface
 *
 * All fulfillment providers must implement this interface.
 * This allows for easy switching between providers.
 */
export interface FulfillmentProvider {
  /** Provider name (e.g., "Printful", "Prodigi") */
  readonly name: string

  /** Provider identifier slug */
  readonly slug: string

  /**
   * Create a new fulfillment order
   * @param order - Order details
   * @returns Fulfillment response with order ID and status
   */
  createOrder(order: FulfillmentOrder): Promise<FulfillmentResponse>

  /**
   * Get available shipping rates for an order
   * @param address - Destination address
   * @param items - Items to ship
   * @returns Array of available shipping rates
   */
  getShippingRates(
    address: Address,
    items: FulfillmentItem[]
  ): Promise<ShippingRate[]>

  /**
   * Get the status of an existing order
   * @param orderId - Provider's order ID
   * @returns Order status with tracking info
   */
  getOrderStatus(orderId: string): Promise<OrderStatusResponse>

  /**
   * Cancel an order (if possible)
   * @param orderId - Provider's order ID
   * @returns Success indicator
   */
  cancelOrder(orderId: string): Promise<{ success: boolean; message?: string }>

  /**
   * Validate that an address can be shipped to
   * @param address - Address to validate
   * @returns Validation result
   */
  validateAddress?(address: Address): Promise<{
    valid: boolean
    suggestions?: Address[]
    errors?: string[]
  }>

  /**
   * Get available products from the provider
   * @param category - Optional category filter
   * @returns List of available products
   */
  getProducts?(category?: string): Promise<{
    id: string
    name: string
    variants: { id: string; name: string; price: number }[]
  }[]>
}

// ============================================================================
// Error Types
// ============================================================================

export class FulfillmentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: string,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'FulfillmentError'
  }
}
