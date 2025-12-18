# React E-Commerce with Production Image Optimization

A senior-level React e-commerce implementation demonstrating production-grade image delivery, CDN integration, and real-world optimization patterns.

![Gallery Store](screenshot.png)

## 🎯 What This Demonstrates

This isn't a tutorial project—it's a complete, deployable storefront showcasing:

- **Image CDN Integration** — Cloudinary fetch proxy for automatic WebP/AVIF
- **Intelligent Caching** — URL-consistent strategy for maximum cache hits
- **Graceful Degradation** — Three-tier fallback (CDN → API resize → original)
- **Performance** — 98.5% reduction in image payload (80MB → 1.2MB)
- **Real Payments** — Stripe Payment Intents with custom Elements

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/artmusuem/ecommerce-react.git
cd ecommerce-react

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your Cloudinary cloud name

# Run
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
src/
├── components/
│   ├── cart/Cart.jsx           # Animated slide-out cart
│   ├── layout/Header.jsx       # Navigation
│   └── product/ProductCard.jsx # Grid items with lazy loading
├── context/CartContext.jsx     # State management
├── pages/
│   ├── Home.jsx               # Product grid + artist filter
│   ├── Product.jsx            # Detail + lightbox + preloading
│   └── Checkout.jsx           # Stripe integration
├── utils/images.js            # CDN proxy + fallback logic
└── data/products.js           # Product catalog
```

## 🖼️ Image Optimization Architecture

### The Problem
Smithsonian images are 2-8MB each. Loading 20 products = 80MB page weight.

### The Solution

```
User Request → Cloudinary CDN → Smithsonian API
                    ↓
            Transform + Cache
            (WebP, resize, compress)
                    ↓
              ~60KB per image
```

### Size Tiers

| Context | Size | File Size |
|---------|------|-----------|
| Grid thumbnail | 400px | 30-50KB |
| Product preview | 800px | 80-120KB |
| Lightbox zoom | 1600px | 200-400KB |

### Key Implementation Details

**URL Consistency for Caching:**
```javascript
// ❌ BAD: dpr_auto creates different URLs per device
`w_400,dpr_auto` → Cache misses

// ✅ GOOD: Consistent URLs everywhere
`w_400,q_auto,f_auto` → Cache hits
```

**Three-Tier Fallback:**
```javascript
1. Cloudinary CDN (primary)
2. Smithsonian ?max= (fallback)  
3. Original URL (last resort)
```

## 📊 Performance Results

| Metric | Before | After |
|--------|--------|-------|
| Page weight | 80MB | 1.2MB |
| LCP | 8-15s | 1.5-2.5s |
| Cache hit rate | ~20% | ~90% |

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
VITE_CLOUDINARY_CLOUD=your_cloud_name
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### Cloudinary Setup (Free)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy your cloud name from Dashboard
3. Add to `.env.local`

No API keys needed—we use fetch mode to proxy remote URLs.

## 📚 Documentation

- [**REACT-ECOMMERCE-IMAGE-OPTIMIZATION.md**](./docs/REACT-ECOMMERCE-IMAGE-OPTIMIZATION.md) — Complete architecture guide
- [**TECHNICAL-REFERENCE.md**](./docs/TECHNICAL-REFERENCE.md) — Credentials, configs, and code reference

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 6 |
| State | React Context + useReducer |
| Images | Cloudinary CDN |
| Payments | Stripe Payment Intents |
| Deploy | Vercel |

## 🐛 Common Issues Solved

1. **Cached images invisible** — `onLoad` doesn't fire for cached images. Solution: Check `img.complete` on mount.

2. **Blur placeholder flashing** — LQIP effects cause visual noise. Solution: Use solid background instead.

3. **Cache misses on navigation** — `srcSet` and `dpr_auto` create different URLs. Solution: Single consistent URL everywhere.

4. **Cart loading huge images** — Using raw `item.image`. Solution: Always use `getResizedImage()`.

## 📦 Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel Dashboard
```

## 📄 License

MIT — Use for your portfolio, customize it, learn from it.

## 👤 Author

Built by [Nathan McMullen](https://github.com/artmusuem) as a demonstration of production React + e-commerce patterns.

---

**Why this approach?** See [REACT-ECOMMERCE-IMAGE-OPTIMIZATION.md](./docs/REACT-ECOMMERCE-IMAGE-OPTIMIZATION.md) for the full architectural rationale.
