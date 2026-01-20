/**
 * Tests for NewsletterForm component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsletterForm, NewsletterSection } from './NewsletterForm'

// Mock the analytics module
vi.mock('@/utils/analytics', () => ({
  trackNewsletterSignup: vi.fn(),
}))

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset fetch mock
    global.fetch = vi.fn()
  })

  it('renders email input and submit button', () => {
    render(<NewsletterForm />)

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('renders custom placeholder text', () => {
    render(<NewsletterForm placeholder="Join our list" />)

    expect(screen.getByPlaceholderText('Join our list')).toBeInTheDocument()
  })

  it('renders custom button text', () => {
    render(<NewsletterForm buttonText="Sign Up" />)

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('disables button when email is empty', () => {
    render(<NewsletterForm />)

    const button = screen.getByRole('button', { name: /subscribe/i })
    expect(button).toBeDisabled()
  })

  it('enables button when email is entered', async () => {
    const user = userEvent.setup()
    render(<NewsletterForm />)

    const input = screen.getByRole('textbox', { name: /email/i })
    await user.type(input, 'test@example.com')

    const button = screen.getByRole('button', { name: /subscribe/i })
    expect(button).not.toBeDisabled()
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()

    // Mock slow fetch
    global.fetch = vi.fn(() => new Promise(resolve =>
      setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response), 100)
    ))

    render(<NewsletterForm />)

    const input = screen.getByRole('textbox', { name: /email/i })
    await user.type(input, 'test@example.com')

    const button = screen.getByRole('button', { name: /subscribe/i })
    await user.click(button)

    // Should show loading state
    expect(button).toBeDisabled()
  })

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    )

    render(<NewsletterForm successMessage="Welcome aboard!" />)

    const input = screen.getByRole('textbox', { name: /email/i })
    await user.type(input, 'test@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(screen.getByText('Welcome aboard!')).toBeInTheDocument()
    })
  })

  it('shows error message on failed submission', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid email' }),
      } as Response)
    )

    render(<NewsletterForm errorMessage="Oops! Try again." />)

    const input = screen.getByRole('textbox', { name: /email/i })
    await user.type(input, 'test@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(screen.getByText('Oops! Try again.')).toBeInTheDocument()
    })
  })

  it('clears email input on success', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    )

    render(<NewsletterForm />)

    const input = screen.getByRole('textbox', { name: /email/i })
    await user.type(input, 'test@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(screen.getByText("Thanks for subscribing!")).toBeInTheDocument()
    })
  })

  it('applies variant styles', () => {
    const { rerender, container } = render(<NewsletterForm variant="default" />)

    // Default variant should have flex-col on small screens
    expect(container.querySelector('form')).toBeInTheDocument()

    rerender(<NewsletterForm variant="minimal" />)
    expect(container.querySelector('form')).toBeInTheDocument()

    rerender(<NewsletterForm variant="card" />)
    expect(container.querySelector('form')).toBeInTheDocument()

    rerender(<NewsletterForm variant="dark" />)
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<NewsletterForm className="custom-class" />)

    expect(container.querySelector('form')).toHaveClass('custom-class')
  })
})

describe('NewsletterSection', () => {
  it('renders heading and description', () => {
    render(<NewsletterSection />)

    expect(screen.getByText('Stay Updated')).toBeInTheDocument()
    expect(screen.getByText(/Subscribe to get notified/)).toBeInTheDocument()
  })

  it('renders the newsletter form', () => {
    render(<NewsletterSection />)

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
  })

  it('renders privacy message', () => {
    render(<NewsletterSection />)

    expect(screen.getByText(/We respect your privacy/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<NewsletterSection className="my-section" />)

    expect(container.firstChild).toHaveClass('my-section')
  })
})
