# Gallery Store - Headless Shopify E-Commerce

[![Tests](https://img.shields.io/badge/tests-185%20passed-brightgreen)](https://github.com/nathanmcmullendev/ecommerce-react)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://react.dev/)
[![Shopify](https://img.shields.io/badge/Shopify-Storefront%20API-96bf48)](https://shopify.dev/docs/api/storefront)

A production-grade headless e-commerce application selling museum-quality art prints. Built with React + TypeScript, powered by Shopify's Storefront API, optimized with Cloudinary CDN.

**Live Demo:** [ecommerce-react-shopify.vercel.app](https://ecommerce-react-shopify.vercel.app)
**Repository:** [github.com/nathanmcmullendev/ecommerce-react](https://github.com/nathanmcmullendev/ecommerce-react)

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

## Performance Scores

### Core Web Vitals (Mobile)

| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| **FCP** (First Contentful Paint) | 1.4s | < 1.8s | ✅ Good |
| **LCP** (Largest Contentful Paint) | 2.9s | < 2.5s | ⚠️ Needs Improvement |
| **TBT** (Total Blocking Time) | 0 ms | < 200ms | ✅ Perfect |
| **CLS** (Cumulative Layout Shift) | 0 | < 0.1 | ✅ Perfect |
| **Speed Index** | 1.8s | < 3.4s | ✅ Good |

> Run your own test: [PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fecommerce-react-shopify.vercel.app)

---

## Key Achievements

| Metric | Value | Details |
|--------|-------|---------|
| **Test Coverage** | 185 tests | Unit, component, and integration tests |
| **TypeScript** | 100% strict | Zero `any` types, full type safety |
| **Bundle Size** | 88KB gzipped | Code-split with lazy loading |
| **Image Optimization** | ~70% reduction | Cloudinary CDN with auto-format |
| **Core Web Vitals** | TBT: 0ms, CLS: 0 | Perfect blocking time and layout stability |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI components, type safety |
| **Build** | Vite 5 | Sub-second HMR, optimized builds |
| **Styling** | Tailwind CSS 4 | Utility-first, zero runtime |
| **Routing** | React Router 6 | Client-side navigation |
| **State** | Context + useReducer | Cart management, persistence |
| **Backend** | Shopify Storefront API | Products, collections, variants |
| **Images** | Cloudinary CDN | Transform, optimize, cache |
| **Payments** | Stripe Elements | PCI-compliant checkout |
| **Testing** | Vitest + RTL | Fast, comprehensive testing |
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
 ✓ src/data/products.test.ts (33 tests)
 ✓ src/context/CartContext.test.tsx (14 tests)
 ✓ src/components/cart/Cart.test.tsx (21 tests)
 ✓ src/components/product/ProductCard.test.tsx (17 tests)
 ✓ src/components/layout/Header.test.tsx (12 tests)
 ✓ src/pages/Home.test.tsx (19 tests)
 ✓ src/pages/Product.test.tsx (25 tests)
 ✓ src/pages/Checkout.test.tsx (17 tests)
 ✓ src/test/integration.test.tsx (7 tests)

 Test Files  10 passed (10)
      Tests  185 passed (185)
```

### Test Categories

| Category | Tests | Coverage |
|----------|-------|----------|
| **Unit Tests** | 53 | Data transforms, image utils, pricing |
| **Component Tests** | 90 | Cart, ProductCard, Header, Pages |
| **Integration Tests** | 42 | Cart flow, Shopify API mocks |

### Running Tests

```bash
# Run all tests
npm test

# Run once (CI mode)
npm run test:run

# TypeScript check
npm run typecheck

# Lint
npm run lint
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

# Data source
VITE_DATA_SOURCE=shopify

# Shopify Storefront API
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_token

# Cloudinary CDN
VITE_CLOUDINARY_CLOUD=your_cloud_name

# Stripe (optional for checkout)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

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

## Documentation

### Guides

| Guide | Description |
|-------|-------------|
| [Shopify Protected Customer Data](docs/guides/shopify-protected-customer-data/README.md) | Complete guide to enabling customer data access for Shopify apps - from Partner account setup to API integration |

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

- `VITE_DATA_SOURCE`
- `VITE_SHOPIFY_STORE`
- `VITE_SHOPIFY_STOREFRONT_TOKEN`
- `VITE_CLOUDINARY_CLOUD`
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`

---

## Development Process

This project was built following senior-level development practices:

### 1. Architecture First
- Designed headless architecture before coding
- Planned Shopify data model (collections, products, variants)
- Defined image optimization strategy

### 2. Type-Safe Development
- TypeScript strict mode throughout
- Defined interfaces before implementation
- Zero `any` types

### 3. Test-Driven Approach
- Mocked Shopify API for isolated testing
- Component tests with React Testing Library
- Integration tests for user flows

### 4. Performance Focus
- Cloudinary CDN for image optimization
- Lazy loading for below-fold content
- Code splitting for routes

### 5. Quality Gates
```bash
# Every commit passes:
npm run typecheck  # 0 errors
npm run lint       # 0 errors
npm run test:run   # 185 tests pass
npm run build      # Production build succeeds
```

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

MIT - Free for portfolios, learning, or production use.

---

## Author

Built by **Nathan McMullen** demonstrating production React + headless Shopify architecture.

- GitHub: [@nathanmcmullendev](https://github.com/nathanmcmullendev)

---

## Acknowledgments

- [Smithsonian Institution](https://www.si.edu/) - Open Access artwork
- [Shopify](https://shopify.dev/) - Storefront API
- [Cloudinary](https://cloudinary.com/) - Image CDN
- [Stripe](https://stripe.com/) - Payment processing
- [Vitest](https://vitest.dev/) - Testing framework
