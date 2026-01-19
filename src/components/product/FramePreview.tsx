/**
 * FramePreview - Realistic gallery-style frame preview
 *
 * Displays artwork with a 3D beveled frame and white mat (passepartout).
 * Supports multiple frame styles with smooth transitions.
 */

interface FramePreviewProps {
  imageSrc: string
  imageAlt: string
  frameType: string  // 'Unframed' | 'Black Frame' | 'White Frame' | 'Natural Wood'
  size?: string      // e.g., "8×10" - displayed below preview
  className?: string
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
}: FramePreviewProps) {
  const frameClass = frameClassMap[frameType] || 'frame-unframed'
  const isFramed = frameType !== 'Unframed'

  return (
    <div className={className}>
      {/* Frame container with 3D bevel effect */}
      <div
        className={`frame-preview ${frameClass} rounded-xl overflow-hidden`}
        role="img"
        aria-label={`${imageAlt} - ${frameType}${size ? `, ${size}` : ''}`}
      >
        {/* Mat layer - white passepartout (hidden for unframed) */}
        <div className="frame-mat">
          {/* Artwork */}
          <div className="frame-artwork aspect-square">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

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
