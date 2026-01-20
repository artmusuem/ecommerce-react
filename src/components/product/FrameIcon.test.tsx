import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FrameIcon from './FrameIcon'

const defaultProps = {
  frameType: 'Unframed' as const,
  selected: false,
  onClick: vi.fn(),
}

function renderFrameIcon(props: Partial<typeof defaultProps> = {}) {
  const mergedProps = { ...defaultProps, ...props }
  return render(<FrameIcon {...mergedProps} />)
}

describe('FrameIcon', () => {
  describe('rendering', () => {
    it('should render a button element', () => {
      renderFrameIcon()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render the frame label', () => {
      renderFrameIcon({ frameType: 'Black Frame' })
      expect(screen.getByText('Black')).toBeInTheDocument()
    })

    it('should render correct label for each frame type', () => {
      const frameTypes = [
        { type: 'Unframed', label: 'Unframed' },
        { type: 'Black Frame', label: 'Black' },
        { type: 'White Frame', label: 'White' },
        { type: 'Natural Wood', label: 'Natural' },
      ]

      frameTypes.forEach(({ type, label }) => {
        const { unmount } = renderFrameIcon({ frameType: type })
        expect(screen.getByText(label)).toBeInTheDocument()
        unmount()
      })
    })

    it('should render original frame type as label for unknown types', () => {
      renderFrameIcon({ frameType: 'Custom Frame' })
      expect(screen.getByText('Custom Frame')).toBeInTheDocument()
    })
  })

  describe('frame type classes', () => {
    it('should apply frame-icon-unframed class for Unframed', () => {
      const { container } = renderFrameIcon({ frameType: 'Unframed' })
      expect(container.querySelector('.frame-icon-unframed')).toBeInTheDocument()
    })

    it('should apply frame-icon-black class for Black Frame', () => {
      const { container } = renderFrameIcon({ frameType: 'Black Frame' })
      expect(container.querySelector('.frame-icon-black')).toBeInTheDocument()
    })

    it('should apply frame-icon-white class for White Frame', () => {
      const { container } = renderFrameIcon({ frameType: 'White Frame' })
      expect(container.querySelector('.frame-icon-white')).toBeInTheDocument()
    })

    it('should apply frame-icon-natural class for Natural Wood', () => {
      const { container } = renderFrameIcon({ frameType: 'Natural Wood' })
      expect(container.querySelector('.frame-icon-natural')).toBeInTheDocument()
    })

    it('should default to frame-icon-unframed for unknown frame types', () => {
      const { container } = renderFrameIcon({ frameType: 'Unknown' })
      expect(container.querySelector('.frame-icon-unframed')).toBeInTheDocument()
    })
  })

  describe('selection state', () => {
    it('should have aria-pressed false when not selected', () => {
      renderFrameIcon({ selected: false })
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    })

    it('should have aria-pressed true when selected', () => {
      renderFrameIcon({ selected: true })
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('should apply selected class when selected', () => {
      const { container } = renderFrameIcon({ selected: true })
      expect(container.querySelector('.frame-icon-button.selected')).toBeInTheDocument()
    })

    it('should not apply selected class when not selected', () => {
      const { container } = renderFrameIcon({ selected: false })
      expect(container.querySelector('.frame-icon-button.selected')).not.toBeInTheDocument()
    })
  })

  describe('click handling', () => {
    it('should call onClick when button is clicked', () => {
      const onClick = vi.fn()
      renderFrameIcon({ onClick })

      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should work without onClick handler', () => {
      render(<FrameIcon frameType="Unframed" />)
      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })
  })

  describe('accessibility', () => {
    it('should have correct aria-label for Unframed', () => {
      renderFrameIcon({ frameType: 'Unframed' })
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Select Unframed')
    })

    it('should have correct aria-label for Black Frame', () => {
      renderFrameIcon({ frameType: 'Black Frame' })
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Select Black Frame')
    })

    it('should have correct aria-label for White Frame', () => {
      renderFrameIcon({ frameType: 'White Frame' })
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Select White Frame')
    })

    it('should have correct aria-label for Natural Wood', () => {
      renderFrameIcon({ frameType: 'Natural Wood' })
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Select Natural Wood')
    })
  })

  describe('structure', () => {
    it('should have frame icon element with correct class', () => {
      const { container } = renderFrameIcon()
      expect(container.querySelector('.frame-icon')).toBeInTheDocument()
    })

    it('should have horizontal frame bar', () => {
      const { container } = renderFrameIcon()
      expect(container.querySelector('.frame-icon-h')).toBeInTheDocument()
    })

    it('should have vertical frame bar', () => {
      const { container } = renderFrameIcon()
      expect(container.querySelector('.frame-icon-v')).toBeInTheDocument()
    })

    it('should have artwork preview area', () => {
      const { container } = renderFrameIcon()
      expect(container.querySelector('.frame-icon-artwork')).toBeInTheDocument()
    })

    it('should have label element', () => {
      const { container } = renderFrameIcon()
      expect(container.querySelector('.frame-icon-label')).toBeInTheDocument()
    })
  })
})
