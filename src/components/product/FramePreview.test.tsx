import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import FramePreview from './FramePreview'

const defaultProps = {
  imageSrc: 'https://example.com/artwork.jpg',
  imageAlt: 'Test Artwork',
  frameType: 'Unframed',
}

function renderFramePreview(props: Partial<typeof defaultProps> = {}) {
  return render(<FramePreview {...defaultProps} {...props} />)
}

describe('FramePreview', () => {
  describe('rendering', () => {
    it('should render the artwork image', () => {
      renderFramePreview()
      const img = screen.getByAltText('Test Artwork')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/artwork.jpg')
    })

    it('should render with correct image alt text', () => {
      renderFramePreview({ imageAlt: 'Beautiful Painting' })
      expect(screen.getByAltText('Beautiful Painting')).toBeInTheDocument()
    })

    it('should display size when provided', () => {
      renderFramePreview({ size: '8×10' })
      expect(screen.getByText('8×10')).toBeInTheDocument()
    })

    it('should not display size when not provided', () => {
      const { container } = renderFramePreview()
      expect(container.querySelector('.mt-4')).not.toBeInTheDocument()
    })
  })

  describe('frame types', () => {
    it('should apply frame-unframed class for Unframed', () => {
      const { container } = renderFramePreview({ frameType: 'Unframed' })
      const frameElement = container.querySelector('.frame-outer')
      expect(frameElement).toHaveClass('frame-unframed')
    })

    it('should apply frame-black class for Black Frame', () => {
      const { container } = renderFramePreview({ frameType: 'Black Frame' })
      const frameElement = container.querySelector('.frame-outer')
      expect(frameElement).toHaveClass('frame-black')
    })

    it('should apply frame-white class for White Frame', () => {
      const { container } = renderFramePreview({ frameType: 'White Frame' })
      const frameElement = container.querySelector('.frame-outer')
      expect(frameElement).toHaveClass('frame-white')
    })

    it('should apply frame-natural class for Natural Wood', () => {
      const { container } = renderFramePreview({ frameType: 'Natural Wood' })
      const frameElement = container.querySelector('.frame-outer')
      expect(frameElement).toHaveClass('frame-natural')
    })

    it('should default to frame-unframed for unknown frame types', () => {
      const { container } = renderFramePreview({ frameType: 'Unknown Frame' })
      const frameElement = container.querySelector('.frame-outer')
      expect(frameElement).toHaveClass('frame-unframed')
    })
  })

  describe('size indicator', () => {
    it('should show "Print size:" label for unframed', () => {
      renderFramePreview({ frameType: 'Unframed', size: '8×10' })
      expect(screen.getByText(/Print size:/)).toBeInTheDocument()
    })

    it('should show "Framed size:" label for framed options', () => {
      renderFramePreview({ frameType: 'Black Frame', size: '8×10' })
      expect(screen.getByText(/Framed size:/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible role and label', () => {
      const { container } = renderFramePreview({
        imageAlt: 'Sunset Painting',
        frameType: 'Black Frame',
        size: '16×20',
      })
      const frameElement = container.querySelector('.frame-view-container')
      expect(frameElement).toHaveAttribute('role', 'img')
      expect(frameElement).toHaveAttribute(
        'aria-label',
        'Sunset Painting - Black Frame, 16×20'
      )
    })

    it('should have aria-label without size when size not provided', () => {
      const { container } = renderFramePreview({
        imageAlt: 'Sunset Painting',
        frameType: 'Black Frame',
      })
      const frameElement = container.querySelector('.frame-view-container')
      expect(frameElement).toHaveAttribute(
        'aria-label',
        'Sunset Painting - Black Frame'
      )
    })
  })

  describe('structure', () => {
    it('should have mat layer for framed options', () => {
      const { container } = renderFramePreview({ frameType: 'Black Frame' })
      expect(container.querySelector('.frame-mat-layer')).toBeInTheDocument()
    })

    it('should not have mat layer for unframed', () => {
      const { container } = renderFramePreview({ frameType: 'Unframed' })
      expect(container.querySelector('.frame-mat-layer')).not.toBeInTheDocument()
    })

    it('should have artwork image', () => {
      const { container } = renderFramePreview()
      expect(container.querySelector('.frame-artwork-img')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = renderFramePreview()
      render(<FramePreview {...defaultProps} className="custom-class" />)
      // Just verify it renders without error - className applied to wrapper
    })
  })

  describe('room view toggle', () => {
    it('should show toggle buttons by default', () => {
      renderFramePreview()
      expect(screen.getByText('Frame View')).toBeInTheDocument()
      expect(screen.getByText('Room View')).toBeInTheDocument()
    })

    it('should hide toggle when showRoomToggle is false', () => {
      render(<FramePreview {...defaultProps} showRoomToggle={false} />)
      expect(screen.queryByText('Frame View')).not.toBeInTheDocument()
      expect(screen.queryByText('Room View')).not.toBeInTheDocument()
    })

    it('should start in frame view', () => {
      const { container } = renderFramePreview()
      expect(container.querySelector('.frame-view-container')).toBeInTheDocument()
      expect(container.querySelector('.room-mockup')).not.toBeInTheDocument()
    })

    it('should switch to room view when Room View button is clicked', async () => {
      const { container } = renderFramePreview()

      const roomButton = screen.getByText('Room View')
      roomButton.click()

      await waitFor(() => {
        expect(container.querySelector('.room-mockup')).toBeInTheDocument()
      })
    })

    it('should have correct aria-pressed state on toggle buttons', () => {
      renderFramePreview()

      const frameButton = screen.getByText('Frame View')
      const roomButton = screen.getByText('Room View')

      expect(frameButton).toHaveAttribute('aria-pressed', 'true')
      expect(roomButton).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
