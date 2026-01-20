/**
 * Customer Review Types
 *
 * Compatible with common review services:
 * - Shopify Product Reviews (native)
 * - Judge.me
 * - Yotpo
 * - Stamped.io
 */

export interface Review {
  /** Unique identifier */
  id: string
  /** Reviewer's display name */
  author: string
  /** Star rating (1-5) */
  rating: number
  /** Review title/headline */
  title: string
  /** Review body/content */
  body: string
  /** ISO date string */
  createdAt: string
  /** Whether the reviewer is a verified buyer */
  verified: boolean
  /** Optional reviewer avatar URL */
  avatarUrl?: string
  /** Optional product variant purchased */
  variant?: string
  /** Helpful votes count */
  helpfulCount?: number
  /** Whether the review has images */
  hasImages?: boolean
  /** Review image URLs */
  images?: string[]
}

export interface ReviewSummary {
  /** Average rating (1-5) */
  averageRating: number
  /** Total number of reviews */
  totalReviews: number
  /** Distribution by star rating */
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface ReviewResponse {
  reviews: Review[]
  summary: ReviewSummary
  hasMore: boolean
  nextCursor?: string
}

/**
 * Mock reviews for development/demo
 * Replace with actual API data in production
 */
export const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    title: 'Absolutely stunning print quality',
    body: 'The colors are vibrant and true to the original. The paper quality is excellent - you can tell it\'s museum-grade. Framing was perfect. Will definitely order more!',
    createdAt: '2024-12-15T10:30:00Z',
    verified: true,
    variant: '16×20 / Black Frame',
    helpfulCount: 12,
  },
  {
    id: '2',
    author: 'James K.',
    rating: 5,
    title: 'Perfect gift for art lovers',
    body: 'Ordered this for my wife\'s birthday and she absolutely loves it. The natural wood frame complements the artwork beautifully. Fast shipping too!',
    createdAt: '2024-12-10T14:20:00Z',
    verified: true,
    variant: '12×16 / Natural Wood',
    helpfulCount: 8,
  },
  {
    id: '3',
    author: 'Emily R.',
    rating: 4,
    title: 'Beautiful piece, minor issue',
    body: 'The print itself is gorgeous and exactly what I expected. Small ding on the frame corner during shipping but customer service is helping me resolve it.',
    createdAt: '2024-12-05T09:15:00Z',
    verified: true,
    variant: '8×10 / White Frame',
    helpfulCount: 3,
  },
  {
    id: '4',
    author: 'Michael T.',
    rating: 5,
    title: 'Museum quality for real!',
    body: 'As a former museum curator, I can confirm these prints are exceptional. The color accuracy is impressive and the archival paper will last generations.',
    createdAt: '2024-11-28T16:45:00Z',
    verified: true,
    helpfulCount: 24,
  },
]

export const MOCK_SUMMARY: ReviewSummary = {
  averageRating: 4.8,
  totalReviews: 127,
  distribution: {
    5: 98,
    4: 21,
    3: 5,
    2: 2,
    1: 1,
  },
}
