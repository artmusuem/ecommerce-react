/**
 * SEO Meta Tags Generator
 *
 * Generates standard meta tags plus Open Graph and Twitter Card tags
 * for improved social sharing and SEO.
 *
 * @example
 * // In a route's meta function:
 * export function meta() {
 *   return generateMetaTags({
 *     title: 'Product Name - Gallery Store',
 *     description: 'Beautiful art print...',
 *     image: 'https://example.com/image.jpg',
 *     type: 'product',
 *     price: '49.99',
 *   })
 * }
 */

// Site-wide defaults
export const SITE_NAME = 'Gallery Store'
export const SITE_URL = 'https://ecommerce-react-shopify.vercel.app'
export const DEFAULT_DESCRIPTION = 'Museum-quality art prints from the Smithsonian American Art Museum. Free shipping on orders over $75.'
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

export interface MetaTagsConfig {
  /** Page title (will be used for title, og:title, twitter:title) */
  title: string
  /** Page description (max ~155 chars for SEO) */
  description: string
  /** Full URL to the OG image (1200x630 recommended) */
  image?: string
  /** Canonical URL of the page */
  url?: string
  /** Content type: 'website' for pages, 'product' for products */
  type?: 'website' | 'product' | 'article'
  /** Product price (only for type='product') */
  price?: string
  /** Product availability (only for type='product') */
  availability?: 'in stock' | 'out of stock' | 'preorder'
  /** Don't index this page */
  noindex?: boolean
  /** Additional keywords for SEO */
  keywords?: string[]
}

interface MetaTag {
  title?: string
  name?: string
  property?: string
  content?: string
}

/**
 * Generate an array of meta tags for React Router routes
 */
export function generateMetaTags(config: MetaTagsConfig): MetaTag[] {
  const {
    title,
    description,
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
    price,
    availability = 'in stock',
    noindex = false,
    keywords = [],
  } = config

  const tags: MetaTag[] = [
    // Basic meta tags
    { title },
    { name: 'description', content: description },

    // Open Graph tags
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type === 'product' ? 'product' : type },
    { property: 'og:image', content: image },
    { property: 'og:site_name', content: SITE_NAME },

    // Twitter Card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ]

  // Add URL if provided
  if (url) {
    tags.push({ property: 'og:url', content: url })
    tags.push({ name: 'twitter:url', content: url })
  }

  // Add product-specific tags
  if (type === 'product') {
    if (price) {
      tags.push({ property: 'product:price:amount', content: price })
      tags.push({ property: 'product:price:currency', content: 'USD' })
    }
    tags.push({ property: 'product:availability', content: availability })
    tags.push({ property: 'og:type', content: 'product' })
  }

  // Add noindex if specified
  if (noindex) {
    tags.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  // Add keywords if provided
  if (keywords.length > 0) {
    tags.push({ name: 'keywords', content: keywords.join(', ') })
  }

  return tags
}

/**
 * Generate default site-wide meta tags
 * Used in app/root.tsx for pages without specific meta
 */
export function getDefaultMetaTags(): MetaTag[] {
  return generateMetaTags({
    title: `${SITE_NAME} - Smithsonian Art Prints`,
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
    url: SITE_URL,
    type: 'website',
    keywords: [
      'art prints',
      'Smithsonian',
      'museum art',
      'wall art',
      'fine art prints',
      'American art',
      'home decor',
    ],
  })
}

/**
 * Generate meta tags for a product page
 */
export function getProductMetaTags(product: {
  title: string
  description?: string
  image?: string
  artist?: string
  price?: string
  id?: string
  availableForSale?: boolean
}): MetaTag[] {
  const productDescription = product.description
    ? `${product.description.slice(0, 120)}...`
    : `${product.title} by ${product.artist || 'Unknown Artist'} - Museum-quality art print from Gallery Store.`

  return generateMetaTags({
    title: `${product.title} - ${SITE_NAME}`,
    description: productDescription,
    image: product.image || DEFAULT_IMAGE,
    url: product.id ? `${SITE_URL}/product/${encodeURIComponent(product.id)}` : undefined,
    type: 'product',
    price: product.price,
    availability: product.availableForSale === false ? 'out of stock' : 'in stock',
    keywords: [
      product.title,
      product.artist || '',
      'art print',
      'wall art',
      'Smithsonian',
    ].filter(Boolean),
  })
}

/**
 * Generate meta tags for a collection/category page
 */
export function getCollectionMetaTags(collection: {
  title: string
  description?: string
  handle: string
}): MetaTag[] {
  return generateMetaTags({
    title: `${collection.title} - ${SITE_NAME}`,
    description: collection.description || `Browse ${collection.title} art prints from Gallery Store.`,
    url: `${SITE_URL}?collection=${collection.handle}`,
    type: 'website',
    keywords: [collection.title, 'art prints', 'gallery', 'collection'],
  })
}
