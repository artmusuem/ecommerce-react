/**
 * FrameIcon - Visual frame corner icons for frame selector
 *
 * Shows an L-shaped frame corner preview for each frame type.
 * Pure CSS implementation with 3D bevels and wood grain effects.
 */

interface FrameIconProps {
  frameType: 'Unframed' | 'Black Frame' | 'White Frame' | 'Natural Wood' | string
  selected?: boolean
  onClick?: () => void
}

const frameClassMap: Record<string, string> = {
  'Unframed': 'frame-icon-unframed',
  'Black Frame': 'frame-icon-black',
  'White Frame': 'frame-icon-white',
  'Natural Wood': 'frame-icon-natural',
}

const labels: Record<string, string> = {
  'Unframed': 'Unframed',
  'Black Frame': 'Black',
  'White Frame': 'White',
  'Natural Wood': 'Natural',
}

export default function FrameIcon({ frameType, selected = false, onClick }: FrameIconProps) {
  const frameClass = frameClassMap[frameType] || 'frame-icon-unframed'

  return (
    <button
      onClick={onClick}
      className={`frame-icon-button ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      aria-label={`Select ${frameType}`}
    >
      <div className={`frame-icon ${frameClass}`}>
        {/* L-shaped corner - horizontal bar */}
        <div className="frame-icon-h" />
        {/* L-shaped corner - vertical bar */}
        <div className="frame-icon-v" />
        {/* Inner artwork preview area */}
        <div className="frame-icon-artwork" />
      </div>
      <span className="frame-icon-label">{labels[frameType] || frameType}</span>
    </button>
  )
}
