# Gallery Store

[![Tests](https://img.shields.io/badge/tests-114%20passed-brightgreen)](https://github.com/artmusuem/ecommerce-react)
[![Coverage](https://img.shields.io/badge/coverage-51%25-yellow)](https://github.com/artmusuem/ecommerce-react)
[![PageSpeed](https://img.shields.io/badge/PageSpeed-95%2F100-brightgreen)](https://pagespeed.web.dev/analysis/https-ecommerce-react-beta-woad-vercel-app/your-report-id)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://react.dev/)

A production-grade React e-commerce application for museum-quality art prints, featuring advanced image optimization, type-safe architecture, and real payment processing.

**Live Demo:** [ecommerce-react-beta-woad.vercel.app](https://ecommerce-react-beta-woad.vercel.app)  
**Repository:** [github.com/artmusuem/ecommerce-react](https://github.com/artmusuem/ecommerce-react)

---

## Table of Contents

- [Overview](#overview)
- [Performance Metrics](#performance-metrics)
- [Technical Highlights](#technical-highlights)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Architecture Decisions](#architecture-decisions)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Browser Support](#browser-support)
- [Accessibility](#accessibility)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Known Issues & Roadmap](#known-issues--roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Gallery Store transforms high-resolution artwork from the Smithsonian Open Access collection into purchasable framed prints. The application demonstrates senior-level React patterns including CDN-based image optimization that reduces page weight by 98.5%, persistent cart state, type-safe component architecture, and Stripe payment integration.

### Key Achievements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Page Weight | 80MB | 1.2MB | **98.5% reduction** |
| Largest Contentful Paint | 8-15s | 2.6s | **5-10x faster** |
| Image Cache Hit Rate | ~20% | ~90% | **4.5x better** |
| PageSpeed Score | — | 95/100 | **Excellent** |

---

## Performance Metrics

### Core Web Vitals (Mobile)

| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| **FCP** (First Contentful Paint) | 1.2s | < 1.8s | ✅ Pass |
| **LCP** (Largest Contentful Paint) | 2.6s | < 2.5s | ⚠️ Close |
| **TBT** (Total Blocking Time) | 0ms | < 200ms | ✅ Perfect |
| **CLS** (Cumulative Layout Shift) | 0 | < 0.1 | ✅ Perfect |
| **Speed Index** | 4.0s | < 3.4s | ⚠️ Acceptable |

### PageSpeed Insights

| Category | Score |
|----------|-------|
| Performance | **95** |
| Best Practices | **100** |
| Accessibility | **88** |
| SEO | **92** |

### Test Coverage

```
 Test Files  6 passed (6)
      Tests  114 passed (114)
   Duration  3.75s
```

| Component | Coverage |
|-----------|----------|
| Cart.tsx | 90.5% |
| ProductCard.jsx | 96.8% |
| CartContext.tsx | 85.5% |
| products.ts | 100% |
| images.ts | 77.3% |

---

## Technical Highlights

### Image Delivery Architecture

The core engineering challenge: Smithsonian images are 2-8MB each. Loading 20 products means 40-160MB of images—unacceptable for any production application.

**Solution:** A three-tier image delivery system with intelligent fallbacks:

```
User Request → Cloudinary CDN → Smithsonian API
                    ↓
            Transform + Cache
            (WebP/AVIF, resize, compress)
                    ↓
              ~60KB per image
```

**Implementation details:**

1. **CDN Proxy Pattern** — Cloudinary's fetch mode proxies remote URLs without manual uploads, applying transformations on-the-fly
2. **Format Negotiation** — `f_auto` serves WebP to Chrome/Firefox, AVIF where supported, JPEG as fallback
3. **URL Consistency** — Deliberately avoided `dpr_auto` and `srcSet` to ensure identical URLs across navigation, maximizing browser cache hits
4. **Graceful Degradation** — Three-tier fallback: Cloudinary → Smithsonian native resize → original URL

```typescript
// Simplified from src/utils/images.ts
export function getResizedImage(url: string, maxSize: number): string {
  if (CLOUDINARY_CLOUD) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/w_${maxSize},c_limit,q_auto,f_auto/${encodeURIComponent(url)}`
  }
  return `${url}?max=${maxSize}` // Smithsonian native fallback
}
```

### Type-Safe State Management

Cart state uses React Context with `useReducer`, fully typed with discriminated unions for compile-time action validation:

```typescript
// src/types/index.ts
export type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLEAR_CART' }
```

**Persistence:** Cart state hydrates from `localStorage` on mount and syncs on every change, surviving page refreshes and browser sessions.

### LCP Optimization Strategy

Above-fold images (first 6) use eager loading for fastest LCP:

```tsx
// ProductCard.jsx
const isAboveFold = index < 6

<img
  loading={isAboveFold ? 'eager' : 'lazy'}
  fetchpriority={isAboveFold ? 'high' : 'auto'}
  // No opacity transition delay for LCP images
  style={{ transition: isAboveFold ? 'none' : 'opacity 0.3s' }}
/>
```

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React 18 | Concurrent features, automatic batching |
| **Language** | TypeScript 5 | Compile-time type safety, better DX |
| **Build** | Vite 5 | Sub-second HMR, native ES modules |
| **Styling** | Tailwind CSS 4 | Utility-first, zero runtime CSS |
| **Routing** | React Router 6 | Declarative, nested routes |
| **State** | Context + useReducer | Sufficient for cart complexity, no Redux overhead |
| **Images** | Cloudinary CDN | Edge caching, automatic format conversion |
| **Payments** | Stripe Elements | PCI compliance, pre-built UI components |
| **Testing** | Vitest + RTL | Fast, Vite-native testing |
| **Deployment** | Vercel | Zero-config, automatic preview deploys |

---

## Project Structure

```
src/
├── components/
│   ├── cart/
│   │   ├── Cart.tsx              # Slide-out cart panel with animations
│   │   └── Cart.test.tsx         # 23 tests
│   ├── layout/
│   │   └── Header.tsx            # Navigation, cart icon with badge
│   └── product/
│       ├── ProductCard.jsx       # Grid item with lazy loading
│       └── ProductCard.test.tsx  # 17 tests
├── context/
│   ├── CartContext.tsx           # Cart state provider with localStorage
│   └── CartContext.test.tsx      # 14 tests
├── data/
│   ├── products.ts               # Product transforms, pricing logic
│   └── products.test.ts          # 33 tests
├── pages/
│   ├── Home.tsx                  # Artist filter, product grid
│   ├── Product.tsx               # Detail view, lightbox, selectors
│   └── Checkout.tsx              # Stripe Elements integration
├── test/
│   ├── integration.test.tsx      # 7 integration tests
│   ├── mocks.ts                  # Test utilities
│   └── setup.ts                  # Vitest configuration
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
├── utils/
│   ├── images.ts                 # CDN URL generation, preloading
│   └── images.test.ts            # 20 tests
├── App.tsx                       # Route definitions
└── main.tsx                      # App entry, provider composition
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/artmusuem/ecommerce-react.git
cd ecommerce-react

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

### Environment Variables

```bash
# .env.local

# Cloudinary (free tier: 25GB bandwidth/month)
# Get cloud name from: https://cloudinary.com/console
VITE_CLOUDINARY_CLOUD=your_cloud_name

# Stripe (test mode)
# Get keys from: https://dashboard.stripe.com/test/apikeys
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### Development

```bash
# Start dev server
npm run dev
# → http://localhost:5173

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Testing

### Run Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm test

# Run with coverage report
npm run test:coverage
```

### Test Structure

| File | Tests | Coverage |
|------|-------|----------|
| `CartContext.test.tsx` | 14 | 85.5% |
| `products.test.ts` | 33 | 100% |
| `images.test.ts` | 20 | 77.3% |
| `Cart.test.tsx` | 23 | 90.5% |
| `ProductCard.test.tsx` | 17 | 96.8% |
| `integration.test.tsx` | 7 | — |
| **Total** | **114** | **51%** |

### Test Categories

- **Unit Tests:** Cart context, products, image utilities
- **Component Tests:** Cart panel, ProductCard rendering/interactions
- **Integration Tests:** Add to cart flow, cart operations

---

## Architecture Decisions

### Why No `srcSet`?

Traditional responsive images use `srcSet` to serve different sizes at different breakpoints:

```jsx
// ❌ Creates different URLs, breaks caching across navigation
<img srcSet={`${img300} 300w, ${img600} 600w, ${img800} 800w`} />
```

This project intentionally uses single URLs per context:

```jsx
// ✅ Same URL everywhere = cache hits on navigation
<img src={getResizedImage(product.image, 400)} />
```

The tradeoff: Slightly larger images on small screens, but dramatically better cache utilization as users navigate between grid → product → cart.

### Why Context Instead of Redux/Zustand?

Cart state has straightforward requirements:
- Add/remove items
- Update quantities  
- Persist to localStorage
- Share across components

`useReducer` + Context handles this cleanly without external dependencies. The discriminated union pattern for actions provides the same type safety as Redux Toolkit.

### Why Cloudinary Fetch Mode?

Traditional CDN usage requires uploading images first. Cloudinary's fetch mode proxies remote URLs:

```
https://res.cloudinary.com/{cloud}/image/fetch/{transforms}/{encoded_remote_url}
```

Benefits:
- No upload step or asset management
- Transformations applied on first request, then cached
- Works with any public image URL
- Free tier sufficient for portfolio traffic

### Image Size Tiers

| Context | Size | File Size | Usage |
|---------|------|-----------|-------|
| Grid thumbnail | 400px | 30-50KB | Product cards |
| Product preview | 800px | 80-120KB | Detail page |
| Lightbox | 1600px | 200-400KB | Full-screen zoom |
| Cart/Checkout | 100px | 5-10KB | Order summary |

---

## Performance Optimizations

### Implemented

| Optimization | Impact |
|--------------|--------|
| Cloudinary CDN | 98.5% page weight reduction |
| Eager loading (first 6 images) | Faster LCP |
| Lazy loading (below fold) | Reduced initial bandwidth |
| Preconnect hints | Early DNS/TLS |
| Lazy-loaded Stripe | 224KB saved on home page |
| No opacity transition on LCP | Eliminates render delay |
| URL consistency | 90% cache hit rate |

### Image Loading States

```tsx
// Progressive loading: fast thumbnail → sharp preview
<img 
  src={thumbnail400}  // Shows immediately (likely cached)
  className={imageLoaded ? 'opacity-0' : 'opacity-100'}
/>
<img
  src={preview800}    // Loads on top
  onLoad={() => setImageLoaded(true)}
  className={imageLoaded ? 'opacity-100' : 'opacity-0'}
/>
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables.

### Manual Build

```bash
npm run build
# Output in dist/
```

The `api/` directory contains Vercel serverless functions. For other platforms, adapt the payment intent endpoint accordingly.

---

## Browser Support

### Browsers

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 90+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| IE 11 | — | ❌ Not supported |

### Image Formats

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| WebP | ✅ 32+ | ✅ 65+ | ✅ 14+ | ✅ 18+ |
| AVIF | ✅ 85+ | ✅ 93+ | ✅ 16+ | ✅ 85+ |

Cloudinary's `f_auto` handles format selection automatically based on browser support.

---

## Accessibility

### Implemented

- Semantic HTML structure
- Alt text on all images
- Keyboard navigation support
- Focus indicators
- ARIA labels on interactive elements
- Color contrast ratios (most pass WCAG AA)

### PageSpeed Accessibility: 88/100

Areas for improvement:
- Some form labels missing
- Minor contrast issues in footer

---

## Security

### Implemented

- **Stripe Elements:** PCI-compliant payment handling
- **No sensitive data in client:** Secret keys server-side only
- **Environment variables:** Secrets excluded from bundle
- **HTTPS only:** Enforced by Vercel

### Stripe Test Mode

For testing, use these cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3DS Required: `4000 0027 6000 3184`

---

## Troubleshooting

### Images Not Loading

1. Check `.env.local` has `VITE_CLOUDINARY_CLOUD`
2. Restart dev server after env changes
3. Check browser console for CORS errors
4. Verify cloud name at cloudinary.com

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run test:run
```

### Stripe Payment Errors

1. Verify `VITE_STRIPE_PUBLIC_KEY` is set
2. Check Stripe Dashboard for webhook errors
3. Use test card `4242 4242 4242 4242`

### Build Errors

```bash
# Type check first
npx tsc --noEmit

# Check for missing dependencies
npm install
```

---

## Known Issues & Roadmap

### Known Issues

- [ ] LCP at 2.6s (target <2.5s) — limited by JSON fetch chain
- [ ] Cart not persisted in localStorage (planned)
- [ ] Direct URL access requires fallback fetch

### Roadmap

- [ ] Add localStorage cart persistence
- [ ] Implement direct URL product fetching
- [ ] Add E2E tests with Playwright
- [ ] Improve accessibility score to 95+
- [ ] Add PWA support

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm run test:run`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- TypeScript strict mode
- ESLint + Prettier (via Vite defaults)
- Conventional commits preferred

---

## Data Source

Artwork sourced from the [Smithsonian Open Access](https://www.si.edu/openaccess) initiative, specifically the Smithsonian American Art Museum collection. All images are in the public domain.

**Featured artists:**
- Winslow Homer (1836–1910)
- Mary Cassatt (1844–1926)
- Thomas Cole (1801–1848)
- Georgia O'Keeffe (1887–1986)
- Edward Hopper (1882–1967)
- Frederic Remington (1861–1909)

---

## License

MIT — Use freely for portfolios, learning, or production applications.

---

## Author

Built by **Nathan McMullen** as a demonstration of production React architecture and e-commerce patterns.

- GitHub: [@artmusuem](https://github.com/artmusuem)

---

## Acknowledgments

- [Smithsonian Institution](https://www.si.edu/) for Open Access artwork
- [Cloudinary](https://cloudinary.com/) for image CDN services
- [Stripe](https://stripe.com/) for payment infrastructure
- [Vitest](https://vitest.dev/) for fast testing
