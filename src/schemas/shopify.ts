/**
 * Shopify API Response Schemas
 *
 * Zod schemas for validating Shopify Storefront API responses.
 * Catches API changes early and provides type-safe data transformation.
 */

import { z } from 'zod'

// Base schemas for common types
const MoneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string()
})

const SelectedOptionSchema = z.object({
  name: z.string(),
  value: z.string()
})

// Variant schema
export const ShopifyVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: MoneySchema,
  availableForSale: z.boolean(),
  selectedOptions: z.array(SelectedOptionSchema)
})

// Option schema
export const ShopifyOptionSchema = z.object({
  name: z.string(),
  values: z.array(z.string())
})

// Image schema
const ImageSchema = z.object({
  url: z.string(),
  altText: z.string().nullable()
})

// Metafield schema
const MetafieldSchema = z.object({
  value: z.string()
}).nullable()

// Product schema
export const ShopifyProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string(),
  description: z.string(),
  vendor: z.string(),
  productType: z.string(),
  tags: z.array(z.string()),
  options: z.array(ShopifyOptionSchema),
  priceRange: z.object({
    minVariantPrice: MoneySchema,
    maxVariantPrice: MoneySchema
  }),
  variants: z.object({
    edges: z.array(z.object({
      node: ShopifyVariantSchema
    }))
  }),
  featuredImage: ImageSchema.nullable(),
  images: z.object({
    edges: z.array(z.object({
      node: ImageSchema
    }))
  }),
  accessionNumber: MetafieldSchema.optional(),
  smithsonianId: MetafieldSchema.optional()
})

// Products response schema
export const ShopifyProductsResponseSchema = z.object({
  data: z.object({
    products: z.object({
      edges: z.array(z.object({
        node: ShopifyProductSchema
      })),
      pageInfo: z.object({
        hasNextPage: z.boolean(),
        endCursor: z.string().nullable()
      })
    })
  })
})

// Single product response schema
export const ShopifySingleProductResponseSchema = z.object({
  data: z.object({
    product: ShopifyProductSchema.nullable()
  })
})

// Collection schema
export const ShopifyCollectionSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.object({ url: z.string() }).nullable(),
  products: z.object({
    edges: z.array(z.object({
      node: z.object({ id: z.string() })
    }))
  })
})

// Collections response schema
export const ShopifyCollectionsResponseSchema = z.object({
  data: z.object({
    collections: z.object({
      edges: z.array(z.object({
        node: ShopifyCollectionSchema
      }))
    })
  })
})

// Collection products response schema
export const ShopifyCollectionProductsResponseSchema = z.object({
  data: z.object({
    collection: z.object({
      products: z.object({
        edges: z.array(z.object({
          node: ShopifyProductSchema
        }))
      })
    }).nullable()
  })
})

// Type exports for use in application code
export type ShopifyVariant = z.infer<typeof ShopifyVariantSchema>
export type ShopifyOption = z.infer<typeof ShopifyOptionSchema>
export type ShopifyProduct = z.infer<typeof ShopifyProductSchema>
export type ShopifyProductsResponse = z.infer<typeof ShopifyProductsResponseSchema>
export type ShopifySingleProductResponse = z.infer<typeof ShopifySingleProductResponseSchema>
export type ShopifyCollection = z.infer<typeof ShopifyCollectionSchema>
export type ShopifyCollectionsResponse = z.infer<typeof ShopifyCollectionsResponseSchema>
export type ShopifyCollectionProductsResponse = z.infer<typeof ShopifyCollectionProductsResponseSchema>

/**
 * Validate API response with helpful error messages
 * @param schema Zod schema to validate against
 * @param data Response data to validate
 * @param context Optional context for error messages
 * @returns Validated and typed data
 * @throws Error with detailed message if validation fails
 */
export function validateResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const contextPrefix = context ? `[${context}] ` : ''
    const errors = result.error.issues
      .map((e) => `  - ${String(e.path.join('.'))}: ${e.message}`)
      .join('\n')

    console.error(`${contextPrefix}API response validation failed:\n${errors}`)

    // In development, throw with full details
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        `${contextPrefix}Shopify API response validation failed:\n${errors}`
      )
    }

    // In production, throw generic error but log details
    throw new Error(`${contextPrefix}Invalid API response structure`)
  }

  return result.data
}
