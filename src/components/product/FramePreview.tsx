/**
 * FramePreview - Realistic gallery-style frame preview
 *
 * Displays artwork with a 3D beveled frame and white mat (passepartout).
 * Supports multiple frame styles with smooth transitions.
 * Optional room view shows artwork in a living room context.
 */

import { useState } from 'react'

interface FramePreviewProps {
  imageSrc: string
  imageAlt: string
  frameType: string  // 'Unframed' | 'Black Frame' | 'White Frame' | 'Natural Wood'
  size?: string      // e.g., "8×10" - displayed below preview
  className?: string
  showRoomToggle?: boolean  // Show frame/room view toggle
}

// Map Shopify variant names to CSS class names
const frameClassMap: Record<string, string> = {
  'Unframed': 'frame-unframed',
  'Black Frame': 'frame-black',
  'White Frame': 'frame-white',
  'Natural Wood': 'frame-natural',
  'Walnut': 'frame-walnut',
  'Gold': 'frame-gold',
}

export default function FramePreview({
  imageSrc,
  imageAlt,
  frameType,
  size,
  className = '',
  showRoomToggle = true,
}: FramePreviewProps) {
  const [viewMode, setViewMode] = useState<'frame' | 'room'>('frame')
  const frameClass = frameClassMap[frameType] || 'frame-unframed'
  const isFramed = frameType !== 'Unframed'

  return (
    <div className={className}>
      {/* View toggle */}
      {showRoomToggle && (
        <div className="view-toggle mb-4">
          <button
            onClick={() => setViewMode('frame')}
            className={`view-toggle-btn ${viewMode === 'frame' ? 'active' : ''}`}
            aria-pressed={viewMode === 'frame'}
          >
            Frame View
          </button>
          <button
            onClick={() => setViewMode('room')}
            className={`view-toggle-btn ${viewMode === 'room' ? 'active' : ''}`}
            aria-pressed={viewMode === 'room'}
          >
            Room View
          </button>
        </div>
      )}

      {viewMode === 'frame' ? (
        /* Frame View */
        <div
          className={`frame-preview ${frameClass} rounded-xl overflow-hidden`}
          role="img"
          aria-label={`${imageAlt} - ${frameType}${size ? `, ${size}` : ''}`}
        >
          {/* Mat layer - white passepartout (hidden for unframed) */}
          <div className="frame-mat">
            {/* Artwork */}
            <div className="frame-artwork">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Room View */
        <div
          className="room-mockup"
          role="img"
          aria-label={`${imageAlt} displayed in a living room setting`}
        >
          <div className="room-art-container">
            {/* Artwork size is fixed; frame/mat grow outward */}
            <div className={`room-frame ${frameClass}`}>
              {isFramed && <div className="room-mat" />}
              <img
                src={imageSrc}
                alt={imageAlt}
                className="room-artwork-img"
              />
            </div>
          </div>
        </div>
      )}

      {/* Size indicator */}
      {size && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">
            {isFramed ? 'Framed size: ' : 'Print size: '}
            <span className="font-medium text-gray-700">{size}</span>
          </span>
        </div>
      )}
    </div>
  )
}
