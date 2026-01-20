/**
 * Google Analytics 4 (gtag.js) TypeScript declarations
 * Provides type safety for GA4 event tracking
 */

interface GtagEventParams {
  // E-commerce parameters
  currency?: string
  value?: number
  items?: GtagItem[]
  transaction_id?: string
  affiliation?: string
  coupon?: string
  shipping?: number
  tax?: number

  // Content parameters
  content_type?: string
  content_id?: string

  // Page parameters
  page_path?: string
  page_title?: string
  page_location?: string

  // Search parameters
  search_term?: string

  // Custom parameters
  [key: string]: unknown
}

interface GtagItem {
  item_id: string
  item_name: string
  affiliation?: string
  coupon?: string
  discount?: number
  index?: number
  item_brand?: string
  item_category?: string
  item_category2?: string
  item_category3?: string
  item_category4?: string
  item_category5?: string
  item_list_id?: string
  item_list_name?: string
  item_variant?: string
  location_id?: string
  price?: number
  quantity?: number
}

interface GtagConfig {
  page_path?: string
  page_title?: string
  send_page_view?: boolean
  [key: string]: unknown
}

type GtagCommand = 'config' | 'event' | 'set' | 'js'

interface Gtag {
  (command: 'config', targetId: string, config?: GtagConfig): void
  (command: 'event', eventName: string, eventParams?: GtagEventParams): void
  (command: 'set', params: Record<string, unknown>): void
  (command: 'js', date: Date): void
}

declare global {
  interface Window {
    gtag: Gtag
    dataLayer: unknown[]
  }
}

export type { Gtag, GtagEventParams, GtagItem, GtagConfig, GtagCommand }
