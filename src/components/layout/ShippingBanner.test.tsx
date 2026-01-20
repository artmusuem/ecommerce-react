/**
 * Tests for ShippingBanner components
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShippingBanner, ShippingProgress, FREE_SHIPPING_THRESHOLD } from './ShippingBanner'

describe('ShippingBanner', () => {
  it('renders default message with threshold', () => {
    render(<ShippingBanner />)

    expect(screen.getByText(`Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}`)).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<ShippingBanner message="Custom promotion!" />)

    expect(screen.getByText('Custom promotion!')).toBeInTheDocument()
  })

  it('renders custom threshold', () => {
    render(<ShippingBanner threshold={100} />)

    expect(screen.getByText('Free shipping on orders over $100')).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<ShippingBanner />)

    const banner = screen.getByRole('banner')
    expect(banner).toHaveAttribute('aria-label', 'Promotional banner')
  })

  it('shows dismiss button when dismissible', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(<ShippingBanner dismissible onDismiss={onDismiss} />)

    const dismissButton = screen.getByRole('button', { name: 'Dismiss banner' })
    expect(dismissButton).toBeInTheDocument()

    await user.click(dismissButton)
    expect(onDismiss).toHaveBeenCalled()
  })

  it('does not show dismiss button when not dismissible', () => {
    render(<ShippingBanner />)

    expect(screen.queryByRole('button', { name: 'Dismiss banner' })).not.toBeInTheDocument()
  })
})

describe('ShippingProgress', () => {
  const threshold = FREE_SHIPPING_THRESHOLD

  it('shows amount remaining for free shipping', () => {
    render(<ShippingProgress currentTotal={50} />)

    const remaining = threshold - 50
    expect(screen.getByText(`$${remaining.toFixed(2)}`)).toBeInTheDocument()
    expect(screen.getByText(/more for free shipping/)).toBeInTheDocument()
  })

  it('shows success message when threshold met', () => {
    render(<ShippingProgress currentTotal={threshold} />)

    expect(screen.getByText('You qualify for free shipping!')).toBeInTheDocument()
  })

  it('shows success message when over threshold', () => {
    render(<ShippingProgress currentTotal={threshold + 50} />)

    expect(screen.getByText('You qualify for free shipping!')).toBeInTheDocument()
  })

  it('renders progress bar with correct aria attributes', () => {
    render(<ShippingProgress currentTotal={50} />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()

    // Should show percentage toward threshold
    const expectedProgress = Math.round((50 / threshold) * 100)
    expect(progressBar).toHaveAttribute('aria-valuenow', String(expectedProgress))
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })

  it('accepts custom threshold', () => {
    render(<ShippingProgress currentTotal={50} threshold={100} />)

    expect(screen.getByText('$50.00')).toBeInTheDocument()
  })

  it('shows 0% progress for empty cart', () => {
    render(<ShippingProgress currentTotal={0} />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })
})
