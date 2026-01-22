/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_CHECKOUT_MODE?: 'stripe' | 'shopify'
  readonly VITE_SHOPIFY_STORE?: string
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
