#!/usr/bin/env node

/**
 * Quick Start Setup Script
 *
 * Helps developers set up the project with a guided process.
 * Run with: npm run setup
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const ENV_TEMPLATE = `# ===================
# SHOPIFY CONFIGURATION
# ===================
VITE_SHOPIFY_STORE={{SHOPIFY_STORE}}
VITE_SHOPIFY_STOREFRONT_TOKEN={{STOREFRONT_TOKEN}}
SHOPIFY_ADMIN_TOKEN={{ADMIN_TOKEN}}

# ===================
# STRIPE CONFIGURATION
# ===================
VITE_STRIPE_PUBLIC_KEY={{STRIPE_PUBLIC_KEY}}
STRIPE_SECRET_KEY={{STRIPE_SECRET_KEY}}

# ===================
# CHECKOUT MODE
# ===================
# Options: 'stripe' (default), 'shopify'
# Use 'stripe' for development/free dev stores
# Use 'shopify' for production with active payment gateway
VITE_CHECKOUT_MODE={{CHECKOUT_MODE}}

# ===================
# CLOUDINARY (for images)
# ===================
VITE_CLOUDINARY_CLOUD={{CLOUDINARY_CLOUD}}
`

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question, defaultValue = '') {
  const defaultText = defaultValue ? ` (${defaultValue})` : ''
  return new Promise((resolve) => {
    rl.question(`${question}${defaultText}: `, (answer) => {
      resolve(answer.trim() || defaultValue)
    })
  })
}

function printHeader() {
  console.log('')
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║    Headless Shopify Starter Kit - Setup Wizard         ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
}

function printSection(title) {
  console.log('')
  console.log(`── ${title} ──`)
  console.log('')
}

async function main() {
  printHeader()

  // Check if .env.local already exists
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const overwrite = await ask('.env.local already exists. Overwrite? (y/n)', 'n')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\nSetup cancelled. Your existing .env.local is preserved.')
      rl.close()
      return
    }
  }

  console.log('This wizard will help you set up your environment variables.')
  console.log('Press Enter to use default values shown in parentheses.')
  console.log('')
  console.log('📚 For detailed setup instructions, see: docs/guides/SETUP-CHECKLIST.md')

  // Shopify Configuration
  printSection('SHOPIFY CONFIGURATION')
  console.log('Get these from your Shopify Partners dashboard:')
  console.log('https://partners.shopify.com → Your Store → Settings → Apps')
  console.log('')

  const shopifyStore = await ask('Shopify store domain (e.g., your-store.myshopify.com)')
  const storefrontToken = await ask('Storefront API access token')
  const adminToken = await ask('Admin API access token (starts with shpat_)')

  // Stripe Configuration
  printSection('STRIPE CONFIGURATION')
  console.log('Get these from: https://dashboard.stripe.com/test/apikeys')
  console.log('')

  const stripePublicKey = await ask('Stripe Publishable key (starts with pk_test_)')
  const stripeSecretKey = await ask('Stripe Secret key (starts with sk_test_)')

  // Checkout Mode
  printSection('CHECKOUT MODE')
  console.log('stripe  - Custom checkout with full UI control (works on free dev stores)')
  console.log('shopify - Native Shopify checkout redirect (requires active payment gateway)')
  console.log('')

  const checkoutMode = await ask('Checkout mode', 'stripe')

  // Cloudinary
  printSection('CLOUDINARY (Optional)')
  console.log('For image optimization. Get your cloud name from: https://cloudinary.com/console')
  console.log('')

  const cloudinaryCloud = await ask('Cloudinary cloud name', 'demo')

  // Generate .env.local
  printSection('GENERATING CONFIGURATION')

  const envContent = ENV_TEMPLATE
    .replace('{{SHOPIFY_STORE}}', shopifyStore)
    .replace('{{STOREFRONT_TOKEN}}', storefrontToken)
    .replace('{{ADMIN_TOKEN}}', adminToken)
    .replace('{{STRIPE_PUBLIC_KEY}}', stripePublicKey)
    .replace('{{STRIPE_SECRET_KEY}}', stripeSecretKey)
    .replace('{{CHECKOUT_MODE}}', checkoutMode)
    .replace('{{CLOUDINARY_CLOUD}}', cloudinaryCloud)

  fs.writeFileSync(envPath, envContent)

  console.log('✅ Created .env.local')
  console.log('')
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║                    Setup Complete!                      ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('Next steps:')
  console.log('')
  console.log('  1. Start the development server:')
  console.log('     npm run dev')
  console.log('')
  console.log('  2. Open http://localhost:5173')
  console.log('')
  console.log('  3. Test checkout with Stripe test card:')
  console.log('     Card: 4242 4242 4242 4242')
  console.log('     Expiry: Any future date')
  console.log('     CVC: Any 3 digits')
  console.log('')
  console.log('📚 Documentation: docs/guides/SETUP-CHECKLIST.md')
  console.log('💳 Checkout guide: docs/guides/CHECKOUT-MODES.md')
  console.log('')

  rl.close()
}

// Handle errors gracefully
main().catch((error) => {
  console.error('Setup failed:', error.message)
  rl.close()
  process.exit(1)
})
