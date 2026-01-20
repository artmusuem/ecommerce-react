/**
 * Newsletter Signup Form Component
 *
 * A reusable email signup form with:
 * - Email validation
 * - Loading states
 * - Success/error feedback
 * - Analytics tracking
 *
 * @example
 * // Basic usage in footer
 * <NewsletterForm />
 *
 * // With custom styling
 * <NewsletterForm
 *   variant="minimal"
 *   buttonText="Join"
 *   placeholder="Your email"
 * />
 */

import { useState, type FormEvent } from 'react'
import { trackNewsletterSignup } from '../../utils/analytics'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

interface NewsletterFormProps {
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'card'
  /** Placeholder text */
  placeholder?: string
  /** Button text */
  buttonText?: string
  /** Success message */
  successMessage?: string
  /** Error message */
  errorMessage?: string
  /** Additional CSS classes */
  className?: string
}

export function NewsletterForm({
  variant = 'default',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Thanks for subscribing!',
  errorMessage = 'Something went wrong. Please try again.',
  className = '',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || status === 'loading') return

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
        trackNewsletterSignup()
      } else {
        // Check for specific error messages
        const data = await response.json().catch(() => ({}))
        if (data.message === 'already_subscribed') {
          setStatus('success') // Treat as success to avoid discouraging users
        } else {
          setStatus('error')
        }
      }
    } catch {
      setStatus('error')
    }

    // Reset error state after 5 seconds
    if (status === 'error') {
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  // Success state
  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium">{successMessage}</p>
      </div>
    )
  }

  // Form variants
  const baseInputClass = 'flex-1 px-4 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors'
  const baseButtonClass = 'px-5 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    default: {
      container: 'flex flex-col sm:flex-row gap-3',
      input: `${baseInputClass} border-gray-300 bg-white`,
      button: `${baseButtonClass} bg-primary text-white hover:bg-primary-dark`,
    },
    minimal: {
      container: 'flex gap-2',
      input: `${baseInputClass} border-gray-200 bg-gray-50`,
      button: `${baseButtonClass} bg-gray-900 text-white hover:bg-gray-800`,
    },
    card: {
      container: 'flex flex-col gap-3',
      input: `${baseInputClass} border-gray-200 bg-white`,
      button: `${baseButtonClass} w-full bg-primary text-white hover:bg-primary-dark`,
    },
  }

  const styles = variantStyles[variant]

  return (
    <form onSubmit={handleSubmit} className={`${styles.container} ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        disabled={status === 'loading'}
        className={styles.input}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className={styles.button}
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="sr-only">Subscribing...</span>
          </span>
        ) : (
          buttonText
        )}
      </button>

      {status === 'error' && (
        <p className="text-red-600 text-sm mt-1 sm:col-span-full">{errorMessage}</p>
      )}
    </form>
  )
}

/**
 * Newsletter section with heading and description
 * Ready to drop into a footer
 */
export function NewsletterSection({ className = '' }: { className?: string }) {
  return (
    <div className={`max-w-md ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Stay Updated
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Subscribe to get notified about new artwork and exclusive offers.
      </p>
      <NewsletterForm variant="default" />
      <p className="text-xs text-gray-500 mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}

export default NewsletterForm
