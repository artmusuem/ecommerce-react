import type { Product, RawArtwork, CartItem } from '../types'

/**
 * Mock product data for testing
 */
export const mockProducts: Product[] = [
  {
    id: 'test-artwork-1',
    title: 'The Gulf Stream',
    artist: 'Winslow Homer',
    year: '1899',
    origin: 'United States',
    medium: 'Oil on canvas',
    image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
    description: 'A dramatic seascape painting',
    tags: ['oil painting', 'seascape'],
    museum: 'Smithsonian American Art Museum',
    accession_number: '1967.66.3'
  },
  {
    id: 'test-artwork-2',
    title: 'Nighthawks',
    artist: 'Edward Hopper',
    year: '1942',
    origin: 'United States',
    medium: 'Oil on canvas',
    image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1234',
    description: 'A famous diner scene',
    tags: ['oil painting', 'urban'],
    museum: 'Smithsonian American Art Museum',
    accession_number: '1234'
  },
  {
    id: 'test-artwork-3',
    title: 'Sunflower',
    artist: "Georgia O'Keeffe",
    year: '1935',
    origin: 'United States',
    medium: 'Oil on canvas',
    image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-5678',
    description: 'A close-up flower painting',
    tags: ['oil painting', 'botanical'],
    museum: 'Smithsonian American Art Museum',
    accession_number: '5678'
  }
]

/**
 * Mock raw artwork from Smithsonian API
 */
export const mockRawArtworks: RawArtwork[] = [
  {
    title: 'The Gulf Stream',
    artist: 'Homer, Winslow',
    year_created: '1899',
    medium: 'Oil on canvas',
    image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
    description: 'A dramatic seascape painting',
    smithsonian_id: 'saam-1967.66.3',
    museum: 'Smithsonian American Art Museum',
    accession_number: '1967.66.3',
    object_type: 'Painting'
  }
]

/**
 * Mock cart items for testing
 */
export const mockCartItems: CartItem[] = [
  {
    key: 'test-artwork-1-8x10-black',
    productId: 'test-artwork-1',
    variantId: 'gid://shopify/ProductVariant/12345',
    sizeId: '8x10',
    frameId: 'black',
    title: 'The Gulf Stream',
    artist: 'Winslow Homer',
    image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
    price: 45,
    quantity: 1
  },
  {
    key: 'test-artwork-2-24x30-gold',
    productId: 'test-artwork-2',
    variantId: 'gid://shopify/ProductVariant/67890',
    sizeId: '24x30',
    frameId: 'gold',
    title: 'Nighthawks',
    artist: 'Edward Hopper',
    image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1234',
    price: 170,
    quantity: 2
  }
]

/**
 * Create a mock product with custom overrides
 */
export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'test-product',
    title: 'Test Artwork',
    artist: 'Test Artist',
    year: '2024',
    origin: 'United States',
    medium: 'Mixed media',
    image: 'https://example.com/image.jpg',
    description: 'Test description',
    tags: [],
    museum: 'Test Museum',
    accession_number: 'TEST-001',
    ...overrides
  }
}

/**
 * Create a mock cart item with custom overrides
 */
export function createMockCartItem(overrides: Partial<CartItem> = {}): CartItem {
  const productId = overrides.productId || 'test-product'
  const variantId = overrides.variantId || 'gid://shopify/ProductVariant/test-variant'
  const sizeId = overrides.sizeId || '8x10'
  const frameId = overrides.frameId || 'black'

  return {
    key: `${productId}-${sizeId}-${frameId}`,
    productId,
    variantId,
    sizeId,
    frameId,
    title: 'Test Artwork',
    artist: 'Test Artist',
    image: 'https://example.com/image.jpg',
    price: 45,
    quantity: 1,
    ...overrides
  }
}

/**
 * Mock Stripe Elements for checkout testing
 */
export const mockStripeElements = {
  getElement: vi.fn(),
  create: vi.fn(),
  update: vi.fn()
}

export const mockStripe = {
  elements: vi.fn(() => mockStripeElements),
  confirmPayment: vi.fn(),
  createPaymentMethod: vi.fn()
}

/**
 * Delay helper for async tests
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get Cloudinary URL pattern for assertions
 */
export function getCloudinaryUrlPattern(size: number): RegExp {
  return new RegExp(`res\\.cloudinary\\.com.*w_${size}`)
}

/**
 * Get Smithsonian fallback URL pattern for assertions
 */
export function getSmithsonianUrlPattern(size: number): RegExp {
  return new RegExp(`ids\\.si\\.edu.*max=${size}`)
}

import { vi } from 'vitest'
