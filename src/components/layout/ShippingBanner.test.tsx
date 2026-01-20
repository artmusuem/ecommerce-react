/**
 * Tests for ShippingBanner components
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShippingBanner, ShippingProgress } from './ShippingBanner'

describe('ShippingBanner', () => {
  it('renders default free shipping message', () => {
    render(<ShippingBanner />)

    expect(screen.getByText('Free shipping on all orders')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<ShippingBanner message="Custom promotion!" />)

    expect(screen.getByText('Custom promotion!')).toBeInTheDocument()
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
  it('shows free shipping included message', () => {
    render(<ShippingProgress />)

    expect(screen.getByText('Free shipping included')).toBeInTheDocument()
  })

  it('has green background styling', () => {
    const { container } = render(<ShippingProgress />)

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('bg-green-50')
  })

  it('displays check icon', () => {
    render(<ShippingProgress />)

    // Should have an SVG checkmark icon
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
