import { cn } from '@/utils/cn'

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
}

/**
 * ArtistCircles Component
 *
 * Displays circular avatar images for each artist, inspired by hikariandink.com.
 * Clicking an artist filters the product grid to show only their work.
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
export function ArtistCircles({ artists, selectedArtist, onSelect }: ArtistCirclesProps) {
  if (!artists.length) return null

  return (
    <section className="py-8 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-display text-lg text-ink-700 mb-6">
          Browse by Artist
        </h2>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {/* "All" option */}
          <button
            onClick={() => onSelect('')}
            className={cn(
              "group flex flex-col items-center transition-all",
              !selectedArtist && "scale-105"
            )}
          >
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden",
              "border-3 transition-all flex items-center justify-center",
              !selectedArtist
                ? "border-ink-900 shadow-lg bg-ink-900"
                : "border-gray-200 group-hover:border-ink-400 bg-gray-100"
            )}>
              <svg
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10",
                  !selectedArtist ? "text-white" : "text-gray-400 group-hover:text-ink-600"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className={cn(
              "mt-2 text-xs sm:text-sm font-medium",
              !selectedArtist ? "text-ink-900" : "text-ink-600"
            )}>
              All Artists
            </span>
          </button>

          {/* Artist circles */}
          {artists.map((artist) => (
            <button
              key={artist.handle}
              onClick={() => onSelect(artist.handle)}
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
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
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
          ))}
        </div>
      </div>
    </section>
  )
}
