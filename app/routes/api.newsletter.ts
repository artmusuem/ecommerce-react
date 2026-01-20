/**
 * Newsletter Subscription API Endpoint
 *
 * Handles email subscriptions. Configure with your preferred service:
 * - Shopify customer tags (built-in)
 * - Mailchimp
 * - Klaviyo
 * - ConvertKit
 *
 * Environment variables (choose one):
 * - MAILCHIMP_API_KEY + MAILCHIMP_LIST_ID
 * - KLAVIYO_API_KEY
 * - CONVERTKIT_API_KEY + CONVERTKIT_FORM_ID
 *
 * If no provider is configured, subscriptions are logged for later setup.
 */

// @ts-expect-error - React Router 7 generates these types at build time
import type { Route } from "./+types/api.newsletter";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface SubscriptionResult {
  success: boolean
  message?: string
  mode?: 'demo' | 'production'
}

/**
 * Subscribe email to Mailchimp
 */
async function subscribeToMailchimp(email: string): Promise<SubscriptionResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const listId = process.env.MAILCHIMP_LIST_ID

  if (!apiKey || !listId) {
    return { success: false, message: 'mailchimp_not_configured' }
  }

  // Get data center from API key (e.g., us21)
  const dc = apiKey.split('-')[1]
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `apikey ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      tags: ['website', 'gallery-store'],
    }),
  })

  if (response.ok) {
    return { success: true, mode: 'production' }
  }

  const data = await response.json()
  if (data.title === 'Member Exists') {
    return { success: true, message: 'already_subscribed', mode: 'production' }
  }

  console.error('Mailchimp error:', data)
  return { success: false, message: 'subscription_failed' }
}

/**
 * Subscribe email to Klaviyo
 */
async function subscribeToKlaviyo(email: string): Promise<SubscriptionResult> {
  const apiKey = process.env.KLAVIYO_API_KEY
  const listId = process.env.KLAVIYO_LIST_ID

  if (!apiKey) {
    return { success: false, message: 'klaviyo_not_configured' }
  }

  const url = 'https://a.klaviyo.com/api/v2/list/' + (listId || 'default') + '/subscribe'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      profiles: [{ email }],
    }),
  })

  if (response.ok) {
    return { success: true, mode: 'production' }
  }

  console.error('Klaviyo error:', await response.text())
  return { success: false, message: 'subscription_failed' }
}

/**
 * Log subscription for later setup (fallback when no provider configured)
 */
async function logSubscription(email: string): Promise<SubscriptionResult> {
  // In production, you might want to:
  // - Store in a database
  // - Send to a webhook
  // - Add to a file for manual import

  console.info(`[Newsletter] New subscription: ${email}`)
  console.info('[Newsletter] No email provider configured. Set MAILCHIMP_API_KEY or KLAVIYO_API_KEY')

  return { success: true, message: 'logged_for_setup', mode: 'demo' }
}

/**
 * Main subscription handler
 * Tries providers in order: Mailchimp -> Klaviyo -> Log
 */
async function handleSubscription(email: string): Promise<SubscriptionResult> {
  // Try Mailchimp first
  if (process.env.MAILCHIMP_API_KEY) {
    return subscribeToMailchimp(email)
  }

  // Try Klaviyo
  if (process.env.KLAVIYO_API_KEY) {
    return subscribeToKlaviyo(email)
  }

  // Fallback: log for later setup
  return logSubscription(email)
}

export async function action({ request }: Route.ActionArgs) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const email = body.email?.trim()?.toLowerCase()

    // Validate email
    if (!email || !EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Handle subscription
    const result = await handleSubscription(email)

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: result.message || 'subscribed',
        mode: result.mode || 'production',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      success: false,
      message: result.message || 'subscription_failed',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Handle GET requests with helpful message
export async function loader() {
  return new Response(JSON.stringify({
    endpoint: '/api/newsletter',
    method: 'POST',
    body: { email: 'string' },
    description: 'Subscribe to the newsletter',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
