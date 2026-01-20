/**
 * Tests for SEO MetaTags utilities
 */

import { describe, it, expect } from 'vitest'
import {
  generateMetaTags,
  getDefaultMetaTags,
  getProductMetaTags,
  getCollectionMetaTags,
  SITE_NAME,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
} from './MetaTags'

describe('generateMetaTags', () => {
  it('generates basic meta tags', () => {
    const tags = generateMetaTags({
      title: 'Test Page',
      description: 'Test description',
    })

    expect(tags).toContainEqual({ title: 'Test Page' })
    expect(tags).toContainEqual({ name: 'description', content: 'Test description' })
  })

  it('generates Open Graph tags', () => {
    const tags = generateMetaTags({
      title: 'Test Page',
      description: 'Test description',
      image: 'https://example.com/image.jpg',
      url: 'https://example.com/page',
    })

    expect(tags).toContainEqual({ property: 'og:title', content: 'Test Page' })
    expect(tags).toContainEqual({ property: 'og:description', content: 'Test description' })
    expect(tags).toContainEqual({ property: 'og:image', content: 'https://example.com/image.jpg' })
    expect(tags).toContainEqual({ property: 'og:url', content: 'https://example.com/page' })
    expect(tags).toContainEqual({ property: 'og:site_name', content: SITE_NAME })
  })

  it('generates Twitter Card tags', () => {
    const tags = generateMetaTags({
      title: 'Test Page',
      description: 'Test description',
      image: 'https://example.com/image.jpg',
    })

    expect(tags).toContainEqual({ name: 'twitter:card', content: 'summary_large_image' })
    expect(tags).toContainEqual({ name: 'twitter:title', content: 'Test Page' })
    expect(tags).toContainEqual({ name: 'twitter:description', content: 'Test description' })
    expect(tags).toContainEqual({ name: 'twitter:image', content: 'https://example.com/image.jpg' })
  })

  it('generates product-specific tags', () => {
    const tags = generateMetaTags({
      title: 'Product Name',
      description: 'Product description',
      type: 'product',
      price: '49.99',
    })

    expect(tags).toContainEqual({ property: 'product:price:amount', content: '49.99' })
    expect(tags).toContainEqual({ property: 'product:price:currency', content: 'USD' })
    expect(tags).toContainEqual({ property: 'product:availability', content: 'in stock' })
  })

  it('handles out of stock products', () => {
    const tags = generateMetaTags({
      title: 'Product Name',
      description: 'Product description',
      type: 'product',
      price: '49.99',
      availability: 'out of stock',
    })

    expect(tags).toContainEqual({ property: 'product:availability', content: 'out of stock' })
  })

  it('adds noindex meta when specified', () => {
    const tags = generateMetaTags({
      title: 'Test Page',
      description: 'Test description',
      noindex: true,
    })

    expect(tags).toContainEqual({ name: 'robots', content: 'noindex, nofollow' })
  })

  it('adds keywords when provided', () => {
    const tags = generateMetaTags({
      title: 'Test Page',
      description: 'Test description',
      keywords: ['art', 'prints', 'wall decor'],
    })

    expect(tags).toContainEqual({ name: 'keywords', content: 'art, prints, wall decor' })
  })

  it('uses default image when not provided', () => {
    const tags = generateMetaTags({
      title: 'Test Page',
      description: 'Test description',
    })

    expect(tags).toContainEqual({ property: 'og:image', content: DEFAULT_IMAGE })
  })
})

describe('getDefaultMetaTags', () => {
  it('returns default site meta tags', () => {
    const tags = getDefaultMetaTags()

    expect(tags).toContainEqual({ title: `${SITE_NAME} - Smithsonian Art Prints` })
    expect(tags).toContainEqual({ name: 'description', content: DEFAULT_DESCRIPTION })
    expect(tags).toContainEqual({ property: 'og:url', content: SITE_URL })
  })

  it('includes default keywords', () => {
    const tags = getDefaultMetaTags()

    const keywordsTag = tags.find(t => t.name === 'keywords')
    expect(keywordsTag).toBeDefined()
    expect(keywordsTag?.content).toContain('art prints')
    expect(keywordsTag?.content).toContain('Smithsonian')
  })
})

describe('getProductMetaTags', () => {
  it('generates product page meta tags', () => {
    const tags = getProductMetaTags({
      title: 'Sunset Print',
      description: 'Beautiful sunset artwork',
      image: 'https://example.com/sunset.jpg',
      artist: 'John Doe',
      price: '49.99',
      id: 'sunset-print',
    })

    expect(tags).toContainEqual({ title: `Sunset Print - ${SITE_NAME}` })
    expect(tags).toContainEqual({ property: 'product:price:amount', content: '49.99' })
    expect(tags).toContainEqual({ property: 'og:image', content: 'https://example.com/sunset.jpg' })
  })

  it('generates description from artist when no description', () => {
    const tags = getProductMetaTags({
      title: 'Sunset Print',
      artist: 'John Doe',
    })

    const descTag = tags.find(t => t.name === 'description')
    expect(descTag?.content).toContain('Sunset Print')
    expect(descTag?.content).toContain('John Doe')
  })

  it('truncates long descriptions', () => {
    const longDescription = 'A'.repeat(200)
    const tags = getProductMetaTags({
      title: 'Test',
      description: longDescription,
    })

    const descTag = tags.find(t => t.name === 'description')
    expect(descTag?.content?.length).toBeLessThan(200)
    expect(descTag?.content).toContain('...')
  })

  it('handles missing artist gracefully', () => {
    const tags = getProductMetaTags({
      title: 'Sunset Print',
    })

    const descTag = tags.find(t => t.name === 'description')
    expect(descTag?.content).toContain('Sunset Print')
  })
})

describe('getCollectionMetaTags', () => {
  it('generates collection page meta tags', () => {
    const tags = getCollectionMetaTags({
      title: 'Landscape Art',
      description: 'Beautiful landscape prints',
      handle: 'landscape-art',
    })

    expect(tags).toContainEqual({ title: `Landscape Art - ${SITE_NAME}` })
    expect(tags).toContainEqual({
      name: 'description',
      content: 'Beautiful landscape prints',
    })
    expect(tags).toContainEqual({
      property: 'og:url',
      content: `${SITE_URL}?collection=landscape-art`,
    })
  })

  it('generates default description when not provided', () => {
    const tags = getCollectionMetaTags({
      title: 'Landscape Art',
      handle: 'landscape-art',
    })

    const descTag = tags.find(t => t.name === 'description')
    expect(descTag?.content).toContain('Browse Landscape Art art prints')
  })
})
