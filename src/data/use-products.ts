import { useState, useEffect } from 'react'
import type { Product } from '../types'
import { fetchShopifyProducts, fetchShopifyProduct, shopifyConfig } from './shopify-api'

// Data source configuration
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'json' // 'json' or 'shopify'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'json' | 'shopify'>('json')

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)

      try {
        if (DATA_SOURCE === 'shopify' && shopifyConfig.isConfigured) {
          // Fetch from Shopify Storefront API
          const shopifyProducts = await fetchShopifyProducts()
          setProducts(shopifyProducts)
          setSource('shopify')
        } else {
          // Fetch from local JSON files
          const response = await fetch('/data/all-products.json')
          if (!response.ok) {
            // Fallback to individual artist files
            const artistFiles = [
              '/data/winslow-homer.json',
              '/data/mary-cassatt.json',
              '/data/thomas-cole.json',
            ]
            const allProducts: Product[] = []
            for (const file of artistFiles) {
              try {
                const res = await fetch(file)
                if (res.ok) {
                  const data = await res.json()
                  allProducts.push(...data)
                }
              } catch {
                // Skip failed files
              }
            }
            setProducts(allProducts)
          } else {
            const data = await response.json()
            setProducts(data)
          }
          setSource('json')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return { products, loading, error, source }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError(null)

      try {
        if (DATA_SOURCE === 'shopify' && shopifyConfig.isConfigured) {
          const shopifyProduct = await fetchShopifyProduct(id)
          setProduct(shopifyProduct)
        } else {
          // For JSON, we need to search through all products
          const response = await fetch('/data/all-products.json')
          if (response.ok) {
            const products: Product[] = await response.json()
            const found = products.find(p => p.id === id)
            setProduct(found || null)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  return { product, loading, error }
}

// Export for components to check data source
export function getDataSourceInfo() {
  return {
    configured: DATA_SOURCE,
    shopifyAvailable: shopifyConfig.isConfigured,
    shopifyStore: shopifyConfig.store,
  }
}
