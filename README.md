# Gallery Store - Headless Shopify E-commerce Starter Kit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.1-ca4245)](https://reactrouter.com/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-98%2F95%2F96%2F100-brightgreen)](https://pagespeed.web.dev/)
[![Tests](https://img.shields.io/badge/Tests-331%20passing-success)](/)
[![Coverage](https://img.shields.io/badge/Coverage-89%25-green)](/)

A **production-ready starter kit** for building headless Shopify storefronts with React Router 7 SSR. Fork this repo and deploy your own art print store in under an hour.

**Live Demo:** [ecommerce-react-shopify.vercel.app](https://ecommerce-react-shopify.vercel.app)

---

## Starter Kit Features

### Core E-commerce
- [x] **Shopify Storefront API** - Products, collections, variants
- [x] **Cart with SSR persistence** - localStorage without hydration errors
- [x] **Stripe Checkout** - PCI-compliant payment processing
- [x] **Product variants** - Size and frame options with dynamic pricing
- [x] **Cloudinary CDN** - Automatic image optimization (WebP/AVIF)

### SEO & Marketing
- [x] **Google Analytics 4** - E-commerce event tracking (add_to_cart, purchase, etc.)
- [x] **Open Graph meta tags** - Rich social sharing previews
- [x] **Dynamic sitemap.xml** - Auto-generated from products
- [x] **robots.txt** - Proper crawler instructions
- [x] **SEO score: 100** - Lighthouse verified

### Conversion Optimization
- [x] **Newsletter signup** - With Mailchimp/Klaviyo integration ready (demo mode indicator)
- [x] **Customer reviews display** - Star ratings and review lists
- [x] **Artist circles navigation** - Visual artist filtering with thumbnails

### Premium UX
- [x] **Frame preview** - Visual frame color selection
- [x] **Before/After slider** - Compare framed vs unframed artwork
- [x] **Print fulfillment API** - Printful integration ready

### Developer Experience
- [x] **TypeScript strict mode** - Zero `any` types
- [x] **331 passing tests** - Unit, component, integration
- [x] **89% test coverage** - CI enforced thresholds
- [x] **Zero ESLint warnings** - Clean codebase
- [x] **Comprehensive docs** - Architecture, guides, API reference

---

## Quick Start

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-react-shopify.git
cd ecommerce-react-shopify
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables)).

### 3. Run Development Server

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel
```

---

## What This Project Is

This is a **working reference implementation** and **production-ready starter kit**.

**Purpose:**
- Demonstrate React Router 7 server-side rendering with Shopify
- Document SSR-safe localStorage patterns using `useSyncExternalStore`
- Provide a tested, production-deployed example of headless commerce
- Serve as a starting point for your own art/print e-commerce store

**What you'll find:**
- Zero hydration errors (verified with Playwright)
- Comprehensive documentation of the SSR persistence problem and solution
- Lighthouse scores: Performance 98, Accessibility 95, Best Practices 96, SEO 100
- TypeScript strict mode with zero ESLint warnings

The `@shopify/hydrogen-react` library is used for Shopify components (Money, Image). This is **not** the Hydrogen framework.

---

## Headless Commerce Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Home      │  │   Product   │  │    Cart     │  │  Checkout   │ │
│  │   Gallery   │  │   Detail    │  │   Drawer    │  │   (Stripe)  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│         └────────────────┴────────────────┴────────────────┘        │
│                                   │                                  │
└───────────────────────────────────┼──────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │     Shopify Storefront API    │
                    │         (GraphQL)             │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────────┐
        │                           │                               │
┌───────▼───────┐          ┌───────▼───────┐               ┌───────▼───────┐
│   Products    │          │  Collections  │               │   Metafields  │
│  + Variants   │          │   (Artists)   │               │  (Smithsonian │
│  + Options    │          │               │               │   accession)  │
└───────────────┘          └───────────────┘               └───────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        Cloudinary CDN                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│   │  WebP/AVIF  │  │   Resize    │  │   Quality   │  │    Edge     │  │
│   │  Auto-format│  │  Transform  │  │   Optimize  │  │   Caching   │  │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

### Why Headless?

| Traditional Shopify | Headless Architecture |
|---------------------|----------------------|
| Limited to Liquid templates | Full React component control |
| Shopify CDN constraints | Cloudinary optimization (70% smaller) |
| Theme customization limits | Complete UI/UX freedom |
| Coupled frontend/backend | Independent scaling & deployment |

---

## Performance & Quality

### Lighthouse Scores

| Category | Score | Status |
|----------|-------|--------|
| **Performance** | 98 | ✅ |
| **Accessibility** | 95 | ✅ |
| **Best Practices** | 96 | ✅ |
| **SEO** | 100 | ✅ |

### Core Web Vitals

| Metric | Status |
|--------|--------|
| First Contentful Paint | Fast |
| Largest Contentful Paint | Fast |
| Total Blocking Time | Minimal |
| Cumulative Layout Shift | Low |

> Run your own test: [PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fecommerce-react-shopify.vercel.app)

---

## Key Achievements

| Metric | Value | Details |
|--------|-------|---------|
| **Test Coverage** | 331 tests | Unit, component, and integration tests |
| **TypeScript** | 100% strict | Zero `any` types, full type safety |
| **Bundle Size** | 88KB gzipped | Code-split with lazy loading |
| **Image Optimization** | ~70% reduction | Cloudinary CDN with auto-format |
| **Core Web Vitals** | TBT: 0ms, CLS: 0 | Perfect blocking time and layout stability |

---

## Repository Tour

Key files that demonstrate the architecture and patterns used:

| File | Purpose |
|------|---------|
| [`src/lib/createPersistedStore.ts`](src/lib/createPersistedStore.ts) | SSR-safe localStorage using `useSyncExternalStore` |
| [`src/context/CartContext.tsx`](src/context/CartContext.tsx) | Cart state with hydration-safe persistence |
| [`src/utils/images.ts`](src/utils/images.ts) | Cloudinary CDN with WebP/AVIF auto-detection |
| [`src/data/shopify-api.ts`](src/data/shopify-api.ts) | Shopify Storefront API client with retry logic |
| [`app/routes/home.tsx`](app/routes/home.tsx) | SSR data loading with React Router 7 |
| [`app/routes/api.create-payment-intent.ts`](app/routes/api.create-payment-intent.ts) | Stripe integration (server-side) |
| [`app/routes/api.create-order.ts`](app/routes/api.create-order.ts) | Shopify order creation via Admin API |
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | System design decisions |
| [`docs/guides/SSR-PERSISTENCE-GUIDE.md`](docs/guides/SSR-PERSISTENCE-GUIDE.md) | Hydration error solution tutorial |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI components, type safety |
| **Framework** | React Router 7 | SSR, server loaders, streaming |
| **Build** | Vite 5 | Sub-second HMR, optimized builds |
| **Styling** | Tailwind CSS 4 | Utility-first, zero runtime |
| **State** | useSyncExternalStore | SSR-safe cart with localStorage |
| **Backend** | Shopify Storefront API | Products, collections, variants |
| **Shopify UI** | @shopify/hydrogen-react | Money, Image components |
| **Images** | Cloudinary CDN | Transform, optimize, cache |
| **Payments** | Stripe Elements | PCI-compliant checkout |
| **Deployment** | Vercel | Edge deployment, preview URLs |

---

## Shopify Integration

### Data Flow

```typescript
// 1. Fetch collections (artists) from Shopify
const collections = await fetchCollections()
// → [{ handle: 'winslow-homer', title: 'Winslow Homer', productsCount: 9 }, ...]

// 2. Fetch products with variants
const products = await fetchShopifyProducts()
// → Each product has Size + Frame variants with Shopify pricing

// 3. Product detail includes metafields
const product = await fetchShopifyProduct('the-gulf-stream')
// → Includes accession_number for Smithsonian links
```

### Variant Structure

Each artwork has 16 variants (4 sizes × 4 frames):

| Size | Unframed | Black Frame | White Frame | Natural Wood |
|------|----------|-------------|-------------|--------------|
| 8×10 | $45 | $75 | $75 | $85 |
| 11×14 | $55 | $95 | $95 | $105 |
| 16×20 | $65 | $125 | $125 | $135 |
| 24×30 | $85 | $165 | $165 | $175 |

### GraphQL Queries

```graphql
# Collections query
query GetCollections {
  collections(first: 50) {
    nodes {
      handle
      title
      description
      productsCount { count }
    }
  }
}

# Products with variants
query GetProducts {
  products(first: 50) {
    nodes {
      handle
      title
      vendor  # Artist name
      options { name values }
      variants(first: 20) {
        nodes {
          id
          price { amount }
          selectedOptions { name value }
        }
      }
      metafield(namespace: "museum", key: "accession_number") {
        value
      }
    }
  }
}
```

---

## Image Optimization

### Cloudinary CDN Pipeline

```
Original Image (Shopify/Smithsonian)
         │
         ▼
┌─────────────────────────────────┐
│     Cloudinary Fetch API        │
│  res.cloudinary.com/fetch/...   │
└─────────────────────────────────┘
         │
         ├── w_400 (thumbnail)
         ├── c_limit (no upscale)
         ├── q_auto (smart quality)
         └── f_auto (WebP/AVIF)
         │
         ▼
    Optimized Image (~25KB)
```

### Implementation

```typescript
// src/utils/images.ts
export function getResizedImage(url: string, maxSize: number): string {
  if (CLOUDINARY_CLOUD) {
    const transforms = `w_${maxSize},c_limit,q_auto,f_auto`
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${transforms}/${encodeURIComponent(url)}`
  }
  return url
}
```

### Size Presets

| Context | Size | Typical File Size |
|---------|------|-------------------|
| Cart thumbnail | 100px | ~5KB |
| Product grid | 400px | ~25KB |
| Product page | 800px | ~60KB |
| Lightbox | 1600px | ~150KB |

---

## Testing

### Test Results

```
 ✓ src/utils/images.test.ts (20 tests)
 ✓ src/utils/analytics.test.ts (17 tests)
 ✓ src/data/products.test.ts (33 tests)
 ✓ src/context/CartContext.test.tsx (14 tests)
 ✓ src/components/cart/Cart.test.tsx (21 tests)
 ✓ src/components/product/ProductCard.test.tsx (17 tests)
 ✓ src/components/layout/Header.test.tsx (16 tests)
 ✓ src/components/layout/ShippingBanner.test.tsx (8 tests)
 ✓ src/components/home/ArtistCircles.test.tsx (10 tests)
 ✓ src/components/newsletter/NewsletterForm.test.tsx (15 tests)
 ✓ src/components/reviews/StarRating.test.tsx (13 tests)
 ✓ src/components/seo/MetaTags.test.tsx (16 tests)
 ✓ src/pages/Home.test.tsx (19 tests)
 ✓ src/pages/Product.test.tsx (25 tests)
 ✓ src/pages/Checkout.test.tsx (17 tests)
 ✓ src/test/integration.test.tsx (7 tests)

 Test Files  19 passed (19)
      Tests  331 passed (331)
```

### Test Categories

| Category | Tests | Coverage |
|----------|-------|----------|
| **Unit Tests** | 70 | Analytics, data transforms, image utils, pricing |
| **Component Tests** | 154 | Cart, ProductCard, Header, ArtistCircles, Newsletter, Reviews |
| **Integration Tests** | 107 | Cart flow, Shopify API mocks, SEO tags |

### Running Tests

```bash
# Run all tests
npm test

# Run once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# TypeScript check
npm run typecheck

# Lint
npm run lint

# Full validation (CI pipeline)
npm run validate
```

---

## Project Structure

```
src/
├── components/
│   ├── cart/
│   │   └── Cart.tsx              # Slide-out drawer, quantity controls
│   ├── checkout/
│   │   └── ShopifyCheckoutButton.tsx
│   ├── layout/
│   │   └── Header.tsx            # Nav, cart icon with badge
│   └── product/
│       └── ProductCard.tsx       # Grid card, lazy loading
├── context/
│   └── CartContext.tsx           # State + localStorage persistence
├── data/
│   ├── products.ts               # Pricing logic, transforms
│   └── shopify-api.ts            # Storefront API client
├── pages/
│   ├── Home.tsx                  # Collection filter, product grid
│   ├── Product.tsx               # Detail, variants, lightbox
│   └── Checkout.tsx              # Stripe integration
├── types/
│   └── index.ts                  # TypeScript interfaces
└── utils/
    └── images.ts                 # Cloudinary URL generation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Shopify store with Storefront API access
- Cloudinary account (free tier works)

### Installation

```bash
# Clone
git clone https://github.com/nathanmcmullendev/ecommerce-react.git
cd ecommerce-react

# Install
npm install

# Configure
cp .env.example .env.local
```

### Environment Variables

```bash
# .env.local

# ============================================
# REQUIRED - Core Shopify Configuration
# ============================================

# Data source
VITE_DATA_SOURCE=shopify

# Shopify Storefront API
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_token

# ============================================
# REQUIRED - Image Optimization
# ============================================

# Cloudinary CDN (free tier: cloudinary.com)
VITE_CLOUDINARY_CLOUD=your_cloud_name

# ============================================
# REQUIRED FOR CHECKOUT - Payment Processing
# ============================================

# Stripe (stripe.com/docs/keys)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# ============================================
# OPTIONAL - Analytics & Marketing
# ============================================

# Google Analytics 4 (analytics.google.com)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Newsletter service (choose one)
MAILCHIMP_API_KEY=xxx
MAILCHIMP_LIST_ID=xxx
# OR
KLAVIYO_API_KEY=xxx
KLAVIYO_LIST_ID=xxx

# ============================================
# OPTIONAL - Print Fulfillment
# ============================================

# Printful (printful.com/docs)
PRINTFUL_API_KEY=xxx
```

### Service Integration Options

| Feature | Recommended Service | Alternatives |
|---------|---------------------|--------------|
| **Analytics** | Google Analytics 4 | Plausible, Fathom |
| **Newsletter** | Mailchimp (free tier) | Klaviyo, ConvertKit, SendGrid |
| **Reviews** | Judge.me (free tier) | Yotpo, Stamped.io |
| **Fulfillment** | Printful | Prodigi, Gooten, SPOD |
| **Image CDN** | Cloudinary (free tier) | Imgix, Shopify CDN |

### Development

```bash
# Start dev server
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Build for production
npm run build
```

---

## SSR-Safe State Persistence

The core technical contribution of this project: **solving React hydration errors** when using localStorage with server-side rendering.

### The Problem

```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

When server renders HTML with empty cart → client reads localStorage with items → React crashes.

### The Solution

Using React 18's `useSyncExternalStore` with separate server/client snapshots:

```typescript
// src/lib/createPersistedStore.ts
export function createPersistedStore<T>(key: string, initialState: T) {
  return {
    subscribe: (callback: () => void) => {
      window.addEventListener('storage', callback)
      return () => window.removeEventListener('storage', callback)
    },
    getSnapshot: () => {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialState
    },
    getServerSnapshot: () => initialState  // ← Key: always return initial on server
  }
}
```

**Result:** Zero hydration errors. Cart loads from localStorage after hydration completes.

### Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture/ARCHITECTURE.md) | System design, data flow |
| [SSR Persistence Guide](docs/guides/SSR-PERSISTENCE-GUIDE.md) | Step-by-step tutorial |
| [API Reference](docs/api/API.md) | Complete API docs |
| [Verification](docs/VERIFICATION.md) | Build results, Lighthouse report |

### Additional Guides

| Guide | Description |
|-------|-------------|
| [Shopify Protected Customer Data](docs/guides/shopify-protected-customer-data/README.md) | Enabling customer data access for Shopify apps |

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `VITE_DATA_SOURCE`
- `VITE_SHOPIFY_STORE`
- `VITE_SHOPIFY_STOREFRONT_TOKEN`
- `VITE_CLOUDINARY_CLOUD`
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`

**Optional (for full features):**
- `VITE_GA_TRACKING_ID`
- `MAILCHIMP_API_KEY` / `KLAVIYO_API_KEY`
- `PRINTFUL_API_KEY`

### Deployment Checklist

Before going live, verify each item:

- [ ] **Shopify store configured** with products, collections, variants
- [ ] **Storefront API token** has read access to products, collections, metafields
- [ ] **Cloudinary account** created and cloud name configured
- [ ] **Stripe account** in live mode with API keys
- [ ] **Google Analytics** property created and tracking ID set
- [ ] **Test checkout flow** with Stripe test mode first
- [ ] **Verify sitemap** at `/sitemap.xml` after deployment
- [ ] **Test OG tags** with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] **Submit sitemap** to Google Search Console
- [ ] **Run Lighthouse** audit and verify scores

---

## Customization Guide

### Changing the Free Shipping Threshold

Edit `src/components/layout/ShippingBanner.tsx`:

```typescript
// Change from $75 to your threshold
export const FREE_SHIPPING_THRESHOLD = 100
```

### Adding Your Branding

1. **Site name and meta tags:** Edit `src/components/seo/MetaTags.tsx`
2. **Logo:** Replace files in `public/` and update `src/components/layout/Header.tsx`
3. **Colors:** Update Tailwind config in `tailwind.config.ts`

### Connecting Newsletter Service

The newsletter form in `src/components/newsletter/NewsletterForm.tsx` submits to `/api/newsletter`. Update `app/routes/api.newsletter.ts` with your provider:

```typescript
// For Mailchimp
const response = await fetch(
  `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email, status: 'subscribed' }),
  }
)
```

### Adding Product Reviews

The review components are ready in `src/components/reviews/`. To connect to a review service:

1. Create an API route in `app/routes/api.reviews.ts`
2. Fetch reviews from Judge.me, Yotpo, or Stamped.io
3. Update `app/routes/product.tsx` to load reviews in the loader

### Enabling Print Fulfillment

The Printful integration is defined in `src/services/fulfillment/`. To use it:

```typescript
import { createPrintfulProvider } from '@/services/fulfillment'

const fulfillment = createPrintfulProvider()
await fulfillment.createOrder(orderData)
```

---

## Quality Gates

Every commit must pass:

```bash
npm run typecheck  # TypeScript strict mode, 0 errors
npm run lint       # ESLint, 0 warnings
npm run build      # Production build succeeds
```

The CI pipeline enforces these checks before deployment.

---

## Data Source

Artwork from the [Smithsonian Open Access](https://www.si.edu/openaccess) initiative, specifically the Smithsonian American Art Museum collection. All images are public domain.

**Featured Artists:**
- Winslow Homer (9 works)
- Mary Cassatt (4 works)
- Thomas Cole (4 works)
- Georgia O'Keeffe (2 works)

---

## License

MIT - Use for learning, reference, or as a starting point for your own projects.

---

## Acknowledgments

- [Smithsonian Institution](https://www.si.edu/openaccess) - Open Access artwork (public domain)
- [Shopify](https://shopify.dev/) - Storefront API documentation
- [React Router](https://reactrouter.com/) - SSR framework
- [Cloudinary](https://cloudinary.com/) - Image CDN
