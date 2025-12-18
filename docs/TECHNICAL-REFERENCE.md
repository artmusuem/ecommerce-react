# Technical Reference & Credentials

## Repository Information

### Primary Repository
- **Name:** ecommerce-react
- **Owner:** artmusuem
- **URL:** https://github.com/artmusuem/ecommerce-react
- **Purpose:** Production-ready React e-commerce with image optimization

### Related Repositories
| Repository | Purpose | Status |
|------------|---------|--------|
| gallery-store (local) | Original development | Complete |
| rapidwoo | Serverless e-commerce reference | Archive |
| smithsonian-art-store | Vanilla JS version | Reference |

---

## Service Credentials & Configuration

### Cloudinary CDN

**Free Tier Limits:**
- 25GB bandwidth/month
- 25K transformations/month
- Sufficient for portfolio + moderate traffic

**Setup:**
1. Sign up: https://cloudinary.com/users/register/free
2. Dashboard → Cloud name (e.g., `dh4qwuvuo`)
3. No API key needed for fetch mode

**Environment Variable:**
```bash
VITE_CLOUDINARY_CLOUD=your_cloud_name
```

**URL Format:**
```
https://res.cloudinary.com/{cloud}/image/fetch/{transforms}/{encoded_url}
```

### Stripe Payments

**Test Mode Keys:**
- Dashboard: https://dashboard.stripe.com/test/apikeys
- Public key: `pk_test_...` (safe for client)
- Secret key: `sk_test_...` (server only)

**Environment Variables:**
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx  # Server-side only
```

### Smithsonian Open Access API

**Base URL:**
```
https://ids.si.edu/ids/deliveryService
```

**Resize Parameter:**
```
?id=SAAM-1967.66.3_1&max=400
```

**No API key required** for basic image access.

**Documentation:**
- https://www.si.edu/openaccess
- https://api.si.edu/openaccess/api/v1.0/

---

## Project Structure

```
ecommerce-react/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── cart/
│   │   │   └── Cart.jsx           # Slide-out cart panel
│   │   ├── layout/
│   │   │   └── Header.jsx         # Navigation + cart icon
│   │   └── product/
│   │       ├── ProductCard.jsx    # Grid item with lazy loading
│   │       └── FrameSelector.jsx  # Frame/size picker (legacy)
│   ├── context/
│   │   └── CartContext.jsx        # Cart state management
│   ├── data/
│   │   └── products.js            # Product catalog + pricing
│   ├── pages/
│   │   ├── Home.jsx               # Product grid + artist filter
│   │   ├── Product.jsx            # Detail page + lightbox
│   │   └── Checkout.jsx           # Stripe payment form
│   ├── utils/
│   │   └── images.js              # Image optimization utilities
│   ├── App.jsx                    # Route definitions
│   ├── main.jsx                   # Entry point + providers
│   └── index.css                  # Tailwind import
├── api/
│   └── create-payment-intent.js   # Vercel serverless function
├── .env.example                   # Environment template
├── .env.local                     # Local secrets (gitignored)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Key Files - Complete Code Reference

### src/utils/images.js

```javascript
/**
 * Image Optimization Utilities
 * 
 * Handles CDN proxy, resizing, and fallback logic for Smithsonian images.
 * Uses Cloudinary fetch mode when configured, falls back to native resize.
 */

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD

export const IMAGE_SIZES = {
  thumbnail: 400,
  preview: 800,
  full: 1600
}

/**
 * Get optimized image URL
 * Routes through Cloudinary if configured, otherwise uses Smithsonian native resize
 */
export function getResizedImage(url, maxSize, options = {}) {
  if (!url) return ''
  
  // Use Cloudinary if configured
  if (CLOUDINARY_CLOUD) {
    return getCloudinaryUrl(url, maxSize, options)
  }
  
  // Fallback: Smithsonian native resize
  return getSmithsonianUrl(url, maxSize)
}

/**
 * Generate Cloudinary fetch URL
 */
function getCloudinaryUrl(url, maxSize, options = {}) {
  const {
    quality = 'auto',
    format = 'auto',
    crop = 'limit'
  } = options
  
  // NOTE: No dpr_auto - ensures consistent URLs for caching
  const transforms = [
    `w_${maxSize}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',')
  
  const encodedUrl = encodeURIComponent(url)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${transforms}/${encodedUrl}`
}

/**
 * Generate Smithsonian native resize URL
 */
function getSmithsonianUrl(url, maxSize) {
  if (!url.includes('ids.si.edu')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}max=${maxSize}`
}

/**
 * Preload image in background
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Preload multiple images with priority hints
 */
export function preloadImages(urls, priority = 'low') {
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    link.fetchPriority = priority
    document.head.appendChild(link)
  })
}
```

### .env.example

```bash
# Gallery Store Environment Variables
# Copy to .env.local and fill in your values

# Cloudinary CDN (free tier)
# Get cloud name from: https://cloudinary.com/console
VITE_CLOUDINARY_CLOUD=your_cloud_name

# Stripe Test Keys
# Get from: https://dashboard.stripe.com/test/apikeys
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

---

## Deployment Configuration

### Vercel

**vercel.json:**
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**Environment Variables (Vercel Dashboard):**
| Key | Environment |
|-----|-------------|
| VITE_CLOUDINARY_CLOUD | Production, Preview |
| VITE_STRIPE_PUBLIC_KEY | Production, Preview |
| STRIPE_SECRET_KEY | Production only |

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

---

## Dependencies

### package.json

```json
{
  "name": "gallery-store",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@stripe/stripe-js": "^2.2.0",
    "@stripe/react-stripe-js": "^2.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

---

## Browser Support

### Image Formats

| Browser | WebP | AVIF |
|---------|------|------|
| Chrome 32+ | ✓ | ✓ (85+) |
| Firefox 65+ | ✓ | ✓ (93+) |
| Safari 14+ | ✓ | ✓ (16+) |
| Edge 18+ | ✓ | ✓ (85+) |

Cloudinary's `f_auto` handles format selection automatically.

### Lazy Loading

| Feature | Support |
|---------|---------|
| `loading="lazy"` | All modern browsers |
| `decoding="async"` | All modern browsers |
| Intersection Observer | All modern browsers |

---

## Testing Checklist

### Image Optimization

- [ ] DevTools Network → filter "cloudinary" → URLs load
- [ ] Response headers: `content-type: image/webp`
- [ ] Response headers: `x-cache: HIT` (after refresh)
- [ ] Grid thumbnails < 100KB each
- [ ] No raw Smithsonian URLs in cart/checkout

### Caching

- [ ] Click product → Back → Images instant (from cache)
- [ ] Switch artists → Some images cached
- [ ] Cart images load instantly (from cache)
- [ ] Product page 400px loads before 800px

### Fallback

- [ ] Disable Cloudinary → Images still load via Smithsonian
- [ ] Invalid image → Shows "Image unavailable"

### Layout

- [ ] Mobile checkout: Summary above Payment
- [ ] Desktop checkout: Summary left, Payment right
- [ ] Product page: Etsy-style layout

---

## Troubleshooting

### Images Not Loading via Cloudinary

1. Check `.env.local` has `VITE_CLOUDINARY_CLOUD`
2. Restart dev server after env changes
3. Check browser console for CORS errors
4. Verify cloud name at cloudinary.com

### Cache Not Working

1. Hard refresh: `Ctrl+Shift+R`
2. Check URLs are identical (no `dpr_auto`)
3. Verify single `src` (no `srcSet`)
4. Check DevTools → Application → Cache Storage

### Images Stuck at opacity-0

1. Verify `useRef` + `useEffect` pattern
2. Check `imgRef.current.complete` on mount
3. Ensure `onLoad` handler exists

---

## Contact & Support

**Developer:** Nathan McMullen  
**GitHub:** artmusuem (backup), nathanmcmullendev (primary, suspended)  
**Support Ticket:** #3960823

---

*Document Version: 1.0*  
*Last Updated: December 2024*
