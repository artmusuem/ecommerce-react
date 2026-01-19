/**
 * FrameIcon - Visual frame corner icons for frame selector
 *
 * Shows an L-shaped frame corner preview for each frame type.
 * Uses inline styles for guaranteed rendering.
 */

import type { CSSProperties } from 'react'

interface FrameIconProps {
  frameType: 'Unframed' | 'Black Frame' | 'White Frame' | 'Natural Wood' | string
  selected?: boolean
  onClick?: () => void
}

// Frame corner colors (matching FramePreview)
const frameStyles: Record<string, { h: CSSProperties; v: CSSProperties; corner: CSSProperties }> = {
  'Black Frame': {
    h: { background: 'linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%)' },
    v: { background: 'linear-gradient(90deg, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%)' },
    corner: { background: 'linear-gradient(135deg, #3a3a3a 0%, #0a0a0a 100%)' },
  },
  'White Frame': {
    h: { background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)' },
    v: { background: 'linear-gradient(90deg, #ffffff 0%, #f0f0f0 50%, #d0d0d0 100%)' },
    corner: { background: 'linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%)' },
  },
  'Natural Wood': {
    h: { background: 'linear-gradient(180deg, #d4b896 0%, #b8956a 50%, #9a7040 100%)' },
    v: { background: 'linear-gradient(90deg, #c4a886 0%, #b08a60 50%, #8a6030 100%)' },
    corner: { background: 'linear-gradient(135deg, #d4b896 0%, #9a7040 100%)' },
  },
}

const labels: Record<string, string> = {
  'Unframed': 'Unframed',
  'Black Frame': 'Black',
  'White Frame': 'White',
  'Natural Wood': 'Natural',
}

export default function FrameIcon({ frameType, selected = false, onClick }: FrameIconProps) {
  const isFramed = frameType !== 'Unframed'
  const style = frameStyles[frameType]

  const buttonStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    border: selected ? '2px solid #2d3436' : '2px solid transparent',
    borderRadius: '12px',
    background: selected ? 'rgba(45, 52, 54, 0.04)' : 'transparent',
    cursor: 'pointer',
    minWidth: '76px',
    transition: 'all 0.2s ease',
  }

  const iconStyle: CSSProperties = {
    position: 'relative',
    width: '52px',
    height: '52px',
    borderRadius: '6px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  }

  const artworkStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: isFramed ? '30px' : '100%',
    height: isFramed ? '30px' : '100%',
    background: 'linear-gradient(135deg, #e8d5b7 0%, #f5e6d3 50%, #dcc9ab 100%)',
  }

  const hBarStyle: CSSProperties = isFramed && style ? {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '22px',
    ...style.h,
  } : { display: 'none' }

  const vBarStyle: CSSProperties = isFramed && style ? {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '22px',
    bottom: 0,
    ...style.v,
  } : { display: 'none' }

  const cornerStyle: CSSProperties = isFramed && style ? {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '22px',
    height: '22px',
    zIndex: 2,
    ...style.corner,
  } : { display: 'none' }

  const labelStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: selected ? 600 : 500,
    color: selected ? '#2d3436' : '#64748b',
    textAlign: 'center',
  }

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      aria-pressed={selected}
      aria-label={`Select ${frameType}`}
    >
      <div style={iconStyle}>
        {/* L-shaped corner pieces */}
        <div style={hBarStyle} />
        <div style={vBarStyle} />
        <div style={cornerStyle} />
        {/* Artwork preview */}
        <div style={artworkStyle} />
      </div>
      <span style={labelStyle}>{labels[frameType] || frameType}</span>
    </button>
  )
}
