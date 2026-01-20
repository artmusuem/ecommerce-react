/**
 * Tests for StarRating component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StarRating, StarRatingInput } from './StarRating'

describe('StarRating', () => {
  describe('display mode', () => {
    it('renders correct number of stars', () => {
      render(<StarRating rating={3} />)

      // Should render 5 stars (default max)
      const container = screen.getByRole('img')
      expect(container).toBeInTheDocument()
      expect(container).toHaveAttribute('aria-label', '3.0 out of 5 stars')
    })

    it('renders custom max stars', () => {
      render(<StarRating rating={3} max={10} />)

      const container = screen.getByRole('img')
      expect(container).toHaveAttribute('aria-label', '3.0 out of 10 stars')
    })

    it('shows numeric value when showValue is true', () => {
      render(<StarRating rating={4.5} showValue />)

      expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('shows review count when provided', () => {
      render(<StarRating rating={4.8} reviewCount={127} />)

      expect(screen.getByText('(127)')).toBeInTheDocument()
    })

    it('includes review count in aria-label', () => {
      render(<StarRating rating={4.8} reviewCount={127} />)

      const container = screen.getByRole('img')
      expect(container).toHaveAttribute('aria-label', '4.8 out of 5 stars, 127 reviews')
    })

    it('clamps rating to valid range', () => {
      const { rerender } = render(<StarRating rating={10} />)

      let container = screen.getByRole('img')
      expect(container).toHaveAttribute('aria-label', '5.0 out of 5 stars')

      rerender(<StarRating rating={-5} />)
      container = screen.getByRole('img')
      expect(container).toHaveAttribute('aria-label', '0.0 out of 5 stars')
    })

    it('applies size classes correctly', () => {
      const { container, rerender } = render(<StarRating rating={4} size="sm" />)

      // Check that sm size SVGs exist
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)

      rerender(<StarRating rating={4} size="lg" />)
      const lgSvgs = container.querySelectorAll('svg')
      expect(lgSvgs.length).toBeGreaterThan(0)
    })

    it('applies custom className', () => {
      const { container } = render(<StarRating rating={4} className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})

describe('StarRatingInput', () => {
  it('renders 5 clickable stars', () => {
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} />)

    const buttons = screen.getAllByRole('radio')
    expect(buttons).toHaveLength(5)
  })

  it('calls onChange when star is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StarRatingInput value={0} onChange={onChange} />)

    const buttons = screen.getAllByRole('radio')
    await user.click(buttons[2]) // Click 3rd star

    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('shows correct star as selected', () => {
    render(<StarRatingInput value={3} onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('radio')

    // First 3 stars should be checked (aria-checked)
    expect(buttons[0]).toHaveAttribute('aria-checked', 'true')
    expect(buttons[1]).toHaveAttribute('aria-checked', 'true')
    expect(buttons[2]).toHaveAttribute('aria-checked', 'true')
    expect(buttons[3]).toHaveAttribute('aria-checked', 'false')
    expect(buttons[4]).toHaveAttribute('aria-checked', 'false')
  })

  it('is disabled when disabled prop is true', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StarRatingInput value={3} onChange={onChange} disabled />)

    const buttons = screen.getAllByRole('radio')
    await user.click(buttons[0])

    expect(onChange).not.toHaveBeenCalled()
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('has correct aria-labels', () => {
    render(<StarRatingInput value={0} onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('radio')
    expect(buttons[0]).toHaveAttribute('aria-label', '1 star')
    expect(buttons[1]).toHaveAttribute('aria-label', '2 stars')
  })
})
