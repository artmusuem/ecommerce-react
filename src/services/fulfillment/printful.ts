/**
 * Printful Fulfillment Provider
 *
 * Integration with Printful's print-on-demand API.
 *
 * Setup:
 * 1. Create a Printful account: https://www.printful.com/
 * 2. Generate an API key in your Printful dashboard
 * 3. Set PRINTFUL_API_KEY environment variable
 *
 * @see https://developers.printful.com/docs/
 *
 * @example
 * const printful = new PrintfulProvider(process.env.PRINTFUL_API_KEY)
 * const rates = await printful.getShippingRates(address, items)
 */

import type {
  FulfillmentProvider,
  FulfillmentOrder,
  FulfillmentResponse,
  ShippingRate,
  Address,
  FulfillmentItem,
  OrderStatusResponse,
  OrderStatus,
  FulfillmentError,
} from './types'

const PRINTFUL_API_BASE = 'https://api.printful.com'

// Map Printful status to our standard status
const STATUS_MAP: Record<string, OrderStatus> = {
  draft: 'pending',
  pending: 'pending',
  failed: 'failed',
  canceled: 'canceled',
  inprocess: 'processing',
  onhold: 'on_hold',
  partial: 'processing',
  fulfilled: 'shipped',
}

export class PrintfulProvider implements FulfillmentProvider {
  readonly name = 'Printful'
  readonly slug = 'printful'

  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('Printful API key is required')
    }
  }

  /**
   * Make an authenticated request to Printful API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${PRINTFUL_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data.error || data.message || 'Unknown error'
      throw {
        message: error,
        code: data.code || 'UNKNOWN',
        provider: this.name,
        retryable: response.status >= 500,
      } as FulfillmentError
    }

    return data.result
  }

  /**
   * Convert our address format to Printful's format
   */
  private formatAddress(address: Address) {
    return {
      name: `${address.firstName} ${address.lastName}`,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state_code: address.stateCode,
      country_code: address.countryCode,
      zip: address.postalCode,
      phone: address.phone || '',
      email: address.email,
    }
  }

  /**
   * Convert our item format to Printful's format
   */
  private formatItem(item: FulfillmentItem) {
    return {
      external_id: item.externalId,
      variant_id: parseInt(item.variantId, 10),
      quantity: item.quantity,
      name: item.name,
      retail_price: item.retailPrice?.toFixed(2),
      files: [
        {
          type: 'default',
          url: item.printFileUrl,
        },
        ...(item.previewUrl
          ? [{ type: 'preview', url: item.previewUrl }]
          : []),
      ],
      options: item.options ? Object.entries(item.options).map(([id, value]) => ({
        id,
        value,
      })) : undefined,
    }
  }

  /**
   * Create a new fulfillment order
   */
  async createOrder(order: FulfillmentOrder): Promise<FulfillmentResponse> {
    const printfulOrder = {
      external_id: order.externalId,
      shipping: order.shippingMethod,
      recipient: this.formatAddress(order.recipient),
      items: order.items.map(item => this.formatItem(item)),
      gift: order.isGift
        ? {
            subject: 'A gift for you!',
            message: order.giftMessage || '',
          }
        : undefined,
      packing_slip: order.packingSlipMessage
        ? { message: order.packingSlipMessage }
        : undefined,
    }

    const result = await this.request<{
      id: number
      external_id: string
      status: string
      costs: {
        currency: string
        subtotal: string
        discount: string
        shipping: string
        tax: string
        total: string
      }
      retail_costs: {
        subtotal: string
        total: string
      }
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(printfulOrder),
    })

    return {
      success: true,
      orderId: String(result.id),
      status: STATUS_MAP[result.status] || 'pending',
      totalCost: parseFloat(result.costs.total),
      currency: result.costs.currency,
      shippingCost: parseFloat(result.costs.shipping),
    }
  }

  /**
   * Get available shipping rates
   */
  async getShippingRates(
    address: Address,
    items: FulfillmentItem[]
  ): Promise<ShippingRate[]> {
    const result = await this.request<Array<{
      id: string
      name: string
      rate: string
      currency: string
      minDeliveryDays: number
      maxDeliveryDays: number
    }>>('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify({
        recipient: this.formatAddress(address),
        items: items.map(item => ({
          variant_id: parseInt(item.variantId, 10),
          quantity: item.quantity,
        })),
      }),
    })

    return result.map(rate => ({
      id: rate.id,
      name: rate.name,
      cost: parseFloat(rate.rate),
      currency: rate.currency,
      estimatedDelivery: `${rate.minDeliveryDays}-${rate.maxDeliveryDays} business days`,
      minDeliveryDays: rate.minDeliveryDays,
      maxDeliveryDays: rate.maxDeliveryDays,
    }))
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    const result = await this.request<{
      id: number
      status: string
      updated: number
      shipments?: Array<{
        carrier: string
        service: string
        tracking_number: string
        tracking_url: string
        ship_date: string
        estimated_delivery: string
      }>
    }>(`/orders/${orderId}`)

    return {
      orderId: String(result.id),
      status: STATUS_MAP[result.status] || 'pending',
      updatedAt: new Date(result.updated * 1000).toISOString(),
      tracking: result.shipments?.map(shipment => ({
        trackingNumber: shipment.tracking_number,
        carrier: shipment.carrier,
        trackingUrl: shipment.tracking_url,
        shipDate: shipment.ship_date,
        estimatedDeliveryDate: shipment.estimated_delivery,
      })),
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.request(`/orders/${orderId}`, {
        method: 'DELETE',
      })
      return { success: true }
    } catch (error) {
      const err = error as FulfillmentError
      return {
        success: false,
        message: err.message || 'Failed to cancel order',
      }
    }
  }

  /**
   * Validate shipping address
   */
  async validateAddress(address: Address): Promise<{
    valid: boolean
    suggestions?: Address[]
    errors?: string[]
  }> {
    try {
      const result = await this.request<{
        result: boolean
        address?: {
          name: string
          address1: string
          address2: string
          city: string
          state_code: string
          country_code: string
          zip: string
        }
      }>('/addresses/validate', {
        method: 'POST',
        body: JSON.stringify({
          address: this.formatAddress(address),
        }),
      })

      return {
        valid: result.result,
        suggestions: result.address
          ? [
              {
                firstName: address.firstName,
                lastName: address.lastName,
                address1: result.address.address1,
                address2: result.address.address2,
                city: result.address.city,
                stateCode: result.address.state_code,
                countryCode: result.address.country_code,
                postalCode: result.address.zip,
                email: address.email,
              },
            ]
          : undefined,
      }
    } catch (error) {
      const err = error as FulfillmentError
      return {
        valid: false,
        errors: [err.message || 'Address validation failed'],
      }
    }
  }
}

/**
 * Factory function to create a Printful provider
 * Uses environment variable if no API key provided
 */
export function createPrintfulProvider(apiKey?: string): PrintfulProvider {
  const key = apiKey || process.env.PRINTFUL_API_KEY

  if (!key) {
    throw new Error(
      'Printful API key is required. Set PRINTFUL_API_KEY environment variable.'
    )
  }

  return new PrintfulProvider(key)
}
