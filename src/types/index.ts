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

export interface StoreConfig {
  name: string
  tagline: string
  currency: string
}

// Cart Types
export interface CartItem {
  key: string
  productId: string
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

export type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' }

export interface AddItemPayload {
  productId: string
  sizeId: string
  frameId: string
  title: string
  artist: string
  image: string
}

export interface CartContextValue extends CartState {
  total: number
  itemCount: number
}
