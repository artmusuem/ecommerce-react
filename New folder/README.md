# Gallery Store

A production-grade React e-commerce application for museum-quality art prints, featuring advanced image optimization, type-safe architecture, and real payment processing.

**Live Demo:** [ecommerce-react-beta-woad.vercel.app](https://ecommerce-react-beta-woad.vercel.app)  
**Repository:** [github.com/artmusuem/ecommerce-react](https://github.com/artmusuem/ecommerce-react)

---

## Overview

Gallery Store transforms high-resolution artwork from the Smithsonian Open Access collection into purchasable framed prints. The application demonstrates senior-level React patterns including CDN-based image optimization that reduces page weight by 98.5%, persistent cart state, type-safe component architecture, and Stripe payment integration.

### Key Metrics

| Metric | Before Optimization | After Optimization | Improvement |
|--------|--------------------|--------------------|-------------|
| Page Weight | 80MB | 1.2MB | **98.5% reduction** |
| Largest Contentful Paint | 8-15s | 1.5-2.5s | **5-10x faster** |
| Image Cache Hit Rate | ~20% | ~90% | **4.5x better** |

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

### Direct URL Access Pattern

Product pages work via both navigation and direct URL access. When accessed directly, the component fetches product data by searching all artist JSON files:

```typescript
// Simplified from src/pages/Product.tsx
useEffect(() => {
  if (routerProduct) return // Already have data from navigation
  
  for (const artist of artists) {
    const data = await fetch(artist.file)
    const found = data.artworks.find(art => art.id === decodedId)
    if (found) {
      setProduct(transformArtwork(found))
      return
    }
  }
  setNotFound(true)
}, [id])
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
| **Deployment** | Vercel | Zero-config, automatic preview deploys |

---

## Project Structure

```
src/
├── components/
│   ├── cart/
│   │   └── Cart.tsx              # Slide-out cart panel with quantity controls
│   ├── layout/
│   │   └── Header.tsx            # Navigation, cart icon with badge
│   └── product/
│       └── ProductCard.tsx       # Grid item with lazy loading, fallback handling
├── context/
│   └── CartContext.tsx           # Cart state provider with localStorage sync
├── data/
│   └── products.ts               # Product transforms, pricing logic
├── pages/
│   ├── Home.tsx                  # Artist filter, product grid
│   ├── Product.tsx               # Detail view, lightbox, size/frame selectors
│   └── Checkout.tsx              # Stripe Elements integration
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
├── utils/
│   └── images.ts                 # CDN URL generation, preloading utilities
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
# Start dev server with API proxy
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173` with the Stripe API proxy at `/api/create-payment-intent`.

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

---

## Image Size Tiers

| Context | Size | Typical File Size | Usage |
|---------|------|-------------------|-------|
| Grid thumbnail | 400px | 30-50KB | Product cards |
| Product preview | 800px | 80-120KB | Detail page main image |
| Lightbox | 1600px | 200-400KB | Full-screen zoom |
| Cart/Checkout | 100px | 5-10KB | Order summary |

The 400px thumbnail is deliberately oversized for display (typically 200-250px) to ensure crisp rendering on 2x displays without serving different URLs per device pixel ratio.

---

## Stripe Integration

Payment flow uses Stripe Payment Intents for SCA compliance:

1. **Client** requests payment intent from serverless function
2. **Server** creates PaymentIntent, returns `clientSecret`
3. **Client** renders `PaymentElement` with secret
4. **User** completes payment, Stripe handles 3DS if required
5. **Client** redirects to success page with `payment_intent` ID

```typescript
// api/create-payment-intent.js (Vercel serverless)
const paymentIntent = await stripe.paymentIntents.create({
  amount: total * 100, // cents
  currency: 'usd',
  automatic_payment_methods: { enabled: true }
})
return { clientSecret: paymentIntent.client_secret }
```

---

## Performance Optimizations

### Implemented

- **Lazy loading** — `loading="lazy"` on all grid images
- **Async decoding** — `decoding="async"` prevents main thread blocking
- **Preloading** — Full-res images preloaded in background on product pages
- **Cache-first navigation** — URL consistency maximizes browser cache hits
- **Code splitting** — Vite's automatic chunk splitting

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

## Testing Checklist

### Image Optimization
- [ ] DevTools Network → filter "cloudinary" → verify CDN URLs
- [ ] Response headers show `content-type: image/webp`
- [ ] Second load shows `x-cache: HIT`
- [ ] Grid thumbnails < 100KB each

### Cart Persistence
- [ ] Add items → refresh page → items persist
- [ ] Check `localStorage` → `gallery-store-cart` key exists

### Direct URL Access
- [ ] Copy product URL → open in new tab → page loads correctly
- [ ] Works for any product across all artists

### Payment Flow
- [ ] Use test card `4242 4242 4242 4242`
- [ ] Success page displays order ID
- [ ] Cart clears after successful payment

---

## Data Source

Artwork sourced from the [Smithsonian Open Access](https://www.si.edu/openaccess) initiative, specifically the Smithsonian American Art Museum collection. All images are in the public domain.

Featured artists:
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

Built by [Nathan McMullen](https://github.com/artmusuem) as a demonstration of production React architecture and e-commerce patterns.

---

## Acknowledgments

- [Smithsonian Institution](https://www.si.edu/) for Open Access artwork
- [Cloudinary](https://cloudinary.com/) for image CDN services
- [Stripe](https://stripe.com/) for payment infrastructure
