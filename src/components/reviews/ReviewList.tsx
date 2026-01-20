/**
 * Customer Reviews List Component
 *
 * Displays a list of customer reviews with:
 * - Summary statistics
 * - Rating distribution
 * - Individual review cards
 *
 * @example
 * // With mock data for demo
 * <ReviewList productId="artwork-1" />
 *
 * // With external reviews
 * <ReviewList reviews={reviews} summary={summary} />
 */

import { StarRating } from './StarRating'
import { MOCK_REVIEWS, MOCK_SUMMARY, type Review, type ReviewSummary } from '../../types/review'

interface ReviewListProps {
  /** Product ID for fetching reviews */
  productId?: string
  /** Pre-loaded reviews (optional) */
  reviews?: Review[]
  /** Pre-loaded summary (optional) */
  summary?: ReviewSummary
  /** Maximum reviews to show initially */
  initialCount?: number
  /** Show summary section */
  showSummary?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Review Summary with distribution bars
 */
function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  const maxCount = Math.max(...Object.values(summary.distribution))

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-gray-50 rounded-xl">
      {/* Average Rating */}
      <div className="text-center sm:text-left">
        <div className="text-5xl font-bold text-gray-900 mb-1">
          {summary.averageRating.toFixed(1)}
        </div>
        <StarRating rating={summary.averageRating} size="md" />
        <p className="text-sm text-gray-500 mt-2">
          Based on {summary.totalReviews.toLocaleString()} reviews
        </p>
      </div>

      {/* Distribution Bars */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star as keyof typeof summary.distribution]
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-4">{star}</span>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Individual Review Card
 */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-6 border-b border-gray-200 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} size="sm" />
            {review.verified && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                Verified Buyer
              </span>
            )}
          </div>
          <h4 className="font-semibold text-gray-900">{review.title}</h4>
        </div>
        <time className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(review.createdAt)}
        </time>
      </div>

      <p className="text-gray-700 mb-3 leading-relaxed">{review.body}</p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{review.author}</span>
          {review.variant && (
            <span className="text-gray-500">• {review.variant}</span>
          )}
        </div>

        {typeof review.helpfulCount === 'number' && review.helpfulCount > 0 && (
          <span className="text-gray-500">
            {review.helpfulCount} found this helpful
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Main ReviewList component
 */
export function ReviewList({
  reviews = MOCK_REVIEWS,
  summary = MOCK_SUMMARY,
  showSummary = true,
  className = '',
}: ReviewListProps) {
  // In production, you would fetch reviews based on productId
  // For now, we use mock data or provided props

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {showSummary && (
        <div className="mb-8">
          <ReviewSummaryCard summary={summary} />
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}

/**
 * Compact review badge for product cards
 */
export function ReviewBadge({
  rating,
  count,
  className = '',
}: {
  rating: number
  count: number
  className?: string
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <StarRating rating={rating} size="sm" />
      <span className="text-xs text-gray-500">({count})</span>
    </div>
  )
}

export default ReviewList
