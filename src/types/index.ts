// Shopify Collection Type
export interface Collection {
  id: string
  handle: string
  title: string
  description: string
  image?: string
  productsCount: number
}

// Shopify Variant Types
export interface ProductOption {
  name: string
  values: string[]
}

export interface SelectedOption {
  name: string
  value: string
}

export interface ProductVariant {
  id: string
  title: string
  price: string
  availableForSale: boolean
  selectedOptions: SelectedOption[]
}

// Product Types
export interface Product {
  id: string
  title: string
  artist: string
  year: string
  origin: string
  medium: string
  image: string
  description: string
  tags: string[]
  museum?: string
  accession_number?: string
  api_url?: string
  // Shopify-specific fields
  options?: ProductOption[]
  variants?: ProductVariant[]
  priceRange?: {
    minPrice: string
    maxPrice: string
  }
}

export interface RawArtwork {
  smithsonian_id?: string
  title: string
  artist: string
  year_created?: string
  medium?: string
  image: string
  description?: string
  object_type?: string
  museum?: string
  accession_number?: string
  api_url?: string
}

export interface Artist {
  id: string
  name: string
  file: string
  dates: string
}

export interface Frame {
  id: string
  name: string
  priceAdd: number
  color: string
}

export interface Size {
  id: string
  name: string
  basePrice: number
  dimensions: {
    w: number
    h: number
  }
}

// Cart Types
export interface CartItem {
  key: string
  productId: string
  variantId: string  // Shopify variant GID
  sizeId: string
  frameId: string
  title: string
  artist: string
  image: string
  price: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export interface CartContextValue extends CartState {
  total: number
  itemCount: number
}

// Cart Actions
export type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' }

export interface AddItemPayload {
  productId: string
  variantId: string
  sizeId: string
  frameId: string
  title: string
  artist: string
  image: string
  price: number
}

// Component Props
export interface ProductCardProps {
  product: Product
  priority?: boolean
}

export interface CheckoutFormProps {
  total: number
}

// Image utility types
export interface ImageOptions {
  quality?: string
  format?: string
  crop?: string
}

export interface ImageSizes {
  blur: number
  thumbnail: number
  preview: number
  full: number
}

// Router state types
export interface ProductRouterState {
  product?: Product
  artistId?: string
  selectedSizeId?: string
  selectedFrameId?: string
}

// Store config
export interface StoreConfig {
  name: string
  tagline: string
  currency: string
}
