/**
 * Before/After Image Comparison Slider
 *
 * A draggable slider component for comparing two images side-by-side.
 * Perfect for showing artwork with and without frames, or different finishes.
 *
 * Features:
 * - Touch and mouse drag support
 * - Keyboard accessible
 * - Smooth animations
 * - Responsive design
 *
 * @example
 * // Compare framed vs unframed
 * <BeforeAfterSlider
 *   beforeImage="/artwork-unframed.jpg"
 *   afterImage="/artwork-framed.jpg"
 *   beforeLabel="Original"
 *   afterLabel="With Frame"
 * />
 */

import { useState, useRef, useCallback, useEffect } from 'react'

interface BeforeAfterSliderProps {
  /** URL of the "before" image (shown on left) */
  beforeImage: string
  /** URL of the "after" image (shown on right) */
  afterImage: string
  /** Label for the before image */
  beforeLabel?: string
  /** Label for the after image */
  afterLabel?: string
  /** Initial slider position (0-100) */
  initialPosition?: number
  /** Alt text for before image */
  beforeAlt?: string
  /** Alt text for after image */
  afterAlt?: string
  /** Additional CSS classes */
  className?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  initialPosition = 50,
  beforeAlt = 'Before image',
  afterAlt = 'After image',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate position from mouse/touch event
  const calculatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return position

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100))
    return percent
  }, [position])

  // Handle mouse/touch move
  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return
    setPosition(calculatePosition(clientX))
  }, [isDragging, calculatePosition])

  // Mouse event handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX)
  }, [handleMove])

  // Touch event handlers
  const handleTouchStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    handleMove(e.touches[0].clientX)
  }, [handleMove])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 5 // Move by 5% with arrow keys
    switch (e.key) {
      case 'ArrowLeft':
        setPosition(p => Math.max(0, p - step))
        e.preventDefault()
        break
      case 'ArrowRight':
        setPosition(p => Math.min(100, p + step))
        e.preventDefault()
        break
    }
  }, [])

  // Global mouse up listener for when mouse leaves container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) setIsDragging(false)
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchend', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchend', handleGlobalMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none cursor-ew-resize rounded-lg ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      role="slider"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Image comparison slider"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* After image (background) */}
      <img
        src={afterImage}
        alt={afterAlt}
        className="w-full h-auto block"
        draggable={false}
      />

      {/* Before image (clipped overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeAlt}
          className="w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth }}
          draggable={false}
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-gray-200">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded">
        {afterLabel}
      </div>

      {/* Drag hint (only shows on first interaction) */}
      {!isDragging && position === initialPosition && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white text-xs font-medium rounded-full flex items-center gap-2 animate-pulse">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Drag to compare
        </div>
      )}
    </div>
  )
}

export default BeforeAfterSlider
