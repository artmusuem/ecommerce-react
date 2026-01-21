import { cn } from '@/utils/cn'
import { getResizedImage } from '@/utils/images'

/**
 * Artist data for circular navigation
 */
export interface ArtistCircle {
  name: string
  handle: string
  image: string
  productCount: number
}

interface ArtistCirclesProps {
  artists: ArtistCircle[]
  selectedArtist: string | null
  onSelect: (handle: string) => void
  /** Total count of filtered products */
  filteredCount?: number
}

/**
 * ArtistCircles Component
 *
 * Displays circular avatar images for each artist, inspired by hikariandink.com.
 * Clicking an artist filters the product grid to show only their work.
 * Click the selected artist again to deselect and show all products.
 *
 * @example
 * ```tsx
 * <ArtistCircles
 *   artists={artists}
 *   selectedArtist={selectedArtist}
 *   onSelect={handleArtistSelect}
 * />
 * ```
 */
export function ArtistCircles({ artists, selectedArtist, onSelect, filteredCount }: ArtistCirclesProps) {
  if (!artists.length) return null

  const handleClick = (handle: string) => {
    // Toggle: clicking selected artist deselects (shows all)
    if (selectedArtist === handle) {
      onSelect('')
    } else {
      onSelect(handle)
    }
  }

  // Find selected artist's name for dynamic title
  const selectedArtistData = selectedArtist
    ? artists.find(a => a.handle === selectedArtist)
    : null

  // Dynamic title: "All Collections" or "{Artist} Collection"
  const collectionTitle = selectedArtistData
    ? `${selectedArtistData.name} Collection`
    : 'All Collections'

  // Dynamic subtitle: count or tagline
  const countLabel = filteredCount === 1 ? 'print' : 'prints'
  const subtitle = selectedArtist && filteredCount !== undefined
    ? `${filteredCount} ${countLabel}`
    : 'Museum-quality prints from the Smithsonian'

  return (
    <section className="py-8 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-display text-2xl text-ink-900 mb-2">
          {collectionTitle}
        </h2>
        <p className="text-center text-sm text-ink-500 mb-6">
          {subtitle}
        </p>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {/* Artist circles */}
          {artists.map((artist) => {
            // Use Cloudinary-optimized 100px thumbnails for fast loading
            const thumbnailSrc = getResizedImage(artist.image, 100, { crop: 'fill' })

            return (
              <button
                key={artist.handle}
                onClick={() => handleClick(artist.handle)}
                className={cn(
                  "group flex flex-col items-center transition-all",
                  selectedArtist === artist.handle && "scale-105"
                )}
              >
                {/* Circular Image */}
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden",
                  "border-3 transition-all",
                  selectedArtist === artist.handle
                    ? "border-ink-900 shadow-lg"
                    : "border-gray-200 group-hover:border-ink-400"
                )}>
                  <img
                    src={thumbnailSrc}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    width={100}
                    height={100}
                  />
                </div>

                {/* Artist Name */}
                <span className={cn(
                  "mt-2 text-xs sm:text-sm font-medium max-w-[80px] sm:max-w-[100px] truncate",
                  selectedArtist === artist.handle ? "text-ink-900" : "text-ink-600"
                )}>
                  {artist.name}
                </span>
                <span className="text-[10px] sm:text-xs text-ink-400">
                  {artist.productCount} {artist.productCount === 1 ? 'print' : 'prints'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Clear filter hint when artist is selected */}
        {selectedArtist && (
          <p className="text-center text-xs text-ink-400 mt-4">
            Click artist again to show all
          </p>
        )}
      </div>
    </section>
  )
}
