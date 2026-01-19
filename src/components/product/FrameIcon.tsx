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

export default function FrameIcon({ frameType, selected = false, onClick }: FrameIconProps) {
  const getFrameClass = () => {
    switch (frameType) {
      case 'Unframed':
        return 'frame-icon-unframed'
      case 'Black Frame':
        return 'frame-icon-black'
      case 'White Frame':
        return 'frame-icon-white'
      case 'Natural Wood':
        return 'frame-icon-natural'
      default:
        return 'frame-icon-unframed'
    }
  }

  const getLabel = () => {
    switch (frameType) {
      case 'Unframed':
        return 'Unframed'
      case 'Black Frame':
        return 'Black'
      case 'White Frame':
        return 'White'
      case 'Natural Wood':
        return 'Natural'
      default:
        return frameType
    }
  }

  return (
    <button
      onClick={onClick}
      className={`frame-icon-button ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      aria-label={`Select ${frameType}`}
    >
      <div className={`frame-icon ${getFrameClass()}`}>
        {/* L-shaped corner - horizontal bar */}
        <div className="frame-icon-h" />
        {/* L-shaped corner - vertical bar */}
        <div className="frame-icon-v" />
        {/* Inner artwork preview area */}
        <div className="frame-icon-artwork" />
      </div>
      <span className="frame-icon-label">{getLabel()}</span>
    </button>
  )
}
