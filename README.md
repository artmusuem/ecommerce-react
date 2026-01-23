# Gallery Store - Headless Shopify Starter Kit 

[![Stars](https://img.shields.io/github/stars/nathanmcmullendev/ecommerce-react?style=social)](https://github.com/nathanmcmullendev/ecommerce-react/stargazers)
[![Forks](https://img.shields.io/github/forks/nathanmcmullendev/ecommerce-react?style=social)](https://github.com/nathanmcmullendev/ecommerce-react/fork)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.1-ca4245)](https://reactrouter.com/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-98%2F95%2F96%2F100-brightgreen)](https://pagespeed.web.dev/)
[![Tests](https://img.shields.io/badge/Tests-347%20passing-success)](/)

> **Headless Shopify starter with working checkout - even on free dev stores.**
> Full UI control with Stripe, or use native Shopify checkout. Switch with one environment variable.

**If this saves you setup time, consider giving it a star — it helps others find it!**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnathanmcmullendev%2Fecommerce-react&env=VITE_SHOPIFY_STORE,VITE_SHOPIFY_STOREFRONT_TOKEN,VITE_CLOUDINARY_CLOUD,VITE_CHECKOUT_MODE,VITE_STRIPE_PUBLIC_KEY&envDescription=Shopify%20and%20Stripe%20credentials%20required&envLink=https%3A%2F%2Fgithub.com%2Fnathanmcmullendev%2Fecommerce-react%2Fblob%2Fmain%2Fdocs%2Fguides%2FSETUP-CHECKLIST.md)

**[Live Demo](https://ecommerce-react.vercel.app)** | **[Setup Guide](docs/guides/SETUP-CHECKLIST.md)** | **[Checkout Modes](docs/guides/CHECKOUT-MODES.md)**

---

## At a Glance

<table>
<tr>
<td width="50%">

### Homepage
![Homepage Hero](docs/screenshots/hero-homepage.png)
*Premium gallery layout with featured works*

</td>
<td width="50%">

### Product Page
![Product with Frame Selector](docs/screenshots/product-frame-selector.png)
*Frame preview with 4 options and 4 sizes*

</td>
</tr>
<tr>
<td width="50%">

### Room View
![Room View](docs/screenshots/product-room-view.png)
*See artwork in a living room context*

</td>
<td width="50%">

### Checkout
![Stripe Checkout](docs/screenshots/checkout-stripe-elements.png)
*Custom checkout with Stripe Elements*

</td>
</tr>
</table>

<details>
<summary><strong>Mobile Screenshots</strong></summary>

<table>
<tr>
<td width="50%">

![Mobile Homepage](docs/screenshots/mobile-homepage.png)

</td>
<td width="50%">

![Mobile Product](docs/screenshots/mobile-product.png)

</td>
</tr>
</table>

</details>

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/nathanmcmullendev/ecommerce-react.git
cd ecommerce-react && npm install

# Run setup wizard (configures Shopify + Stripe)
npm run setup

# Start development
npm run dev
```

**Test Checkout:** Use card `4242 4242 4242 4242` with any future expiry and CVC.

---

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        Home[Home Page]
        Product[Product Detail]
        Cart[Cart Drawer]
        Checkout[Checkout]
    end

    subgraph APIs["External APIs"]
        Storefront["Shopify Storefront API<br/>(Products, Collections)"]
        Admin["Shopify Admin API<br/>(Order Creation)"]
        Stripe["Stripe API<br/>(Payment Processing)"]
        CDN["Cloudinary CDN<br/>(Image Optimization)"]
    end

    Home --> Storefront
    Product --> Storefront
    Product --> CDN
    Checkout --> Stripe
    Checkout --> Admin

    style Frontend fill:#e1f5fe
    style APIs fill:#fff3e0
```

### Checkout Flow

```mermaid
flowchart LR
    A[Add to Cart] --> B{Checkout Mode?}
    B -->|VITE_CHECKOUT_MODE=stripe| C[Custom UI<br/>Stripe Elements]
    B -->|VITE_CHECKOUT_MODE=shopify| D[Shopify<br/>Native Checkout]

    C --> E[Payment Intent]
    E --> F[Shopify Admin API<br/>Create Order]
    F --> G[Order Confirmation]

    D --> H[Cart → Checkout URL]
    H --> I[Shopify Hosted]
    I --> G

    style C fill:#635bff,color:#fff
    style D fill:#96bf48,color:#fff
```

**Why two modes?**
- **Stripe mode**: Full UI control, works on free Shopify dev stores (no payment gateway required)
- **Shopify mode**: Native checkout, requires active payment gateway or Shopify Plus

[Full checkout documentation →](docs/guides/CHECKOUT-MODES.md)

---

## Features

### Core E-commerce
- [x] **Shopify Storefront API** - Products, collections, variants
- [x] **Cart with SSR persistence** - localStorage without hydration errors
- [x] **Dual checkout modes** - Stripe or Shopify ([docs](docs/guides/CHECKOUT-MODES.md))
- [x] **Product variants** - 16 variants per product (4 sizes × 4 frames)
- [x] **Cloudinary CDN** - Automatic WebP/AVIF optimization (~70% smaller)

### Premium UX
- [x] **Frame preview** - See artwork with selected frame in real-time
- [x] **Room view** - Visualize artwork in a living room setting
- [x] **Slide-out cart** - Quick access without page navigation
- [x] **Mobile-first design** - Responsive across all devices

### SEO & Marketing
- [x] **Google Analytics 4** - E-commerce events (add_to_cart, purchase)
- [x] **Open Graph tags** - Rich social sharing
- [x] **Dynamic sitemap** - Auto-generated from products
- [x] **Lighthouse SEO: 100** - Fully optimized

### Developer Experience
- [x] **TypeScript strict** - Zero `any` types
- [x] **347 passing tests** - Unit, component, integration
- [x] **89% coverage** - CI enforced
- [x] **Zero ESLint warnings** - Clean codebase

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, React Router 7 |
| **Styling** | Tailwind CSS 4 |
| **State** | useSyncExternalStore (SSR-safe) |
| **Backend** | Shopify Storefront + Admin APIs |
| **Payments** | Stripe Elements |
| **Images** | Cloudinary CDN |
| **Deploy** | Vercel |

---

## Performance

| Metric | Score |
|--------|-------|
| **Lighthouse Performance** | 98 |
| **Lighthouse Accessibility** | 95 |
| **Lighthouse Best Practices** | 96 |
| **Lighthouse SEO** | 100 |
| **Bundle Size** | 88KB gzipped |
| **Image Optimization** | ~70% reduction |

---

## Project Structure

```
├── app/routes/           # React Router pages
│   ├── checkout.tsx      # Dual-mode checkout
│   └── api.*.ts          # Server endpoints
├── src/
│   ├── components/       # UI components
│   ├── context/          # Cart state (SSR-safe)
│   ├── data/             # Shopify API client
│   └── pages/            # Page components
└── docs/
    ├── guides/           # Setup & configuration
    └── architecture/     # System design
```

---

## Key Files

| File | Purpose |
|------|---------|
| [`src/lib/createPersistedStore.ts`](src/lib/createPersistedStore.ts) | SSR-safe localStorage pattern |
| [`src/context/CartContext.tsx`](src/context/CartContext.tsx) | Cart with hydration-safe persistence |
| [`src/config/checkout.ts`](src/config/checkout.ts) | Checkout mode configuration |
| [`app/routes/checkout.tsx`](app/routes/checkout.tsx) | Dynamic checkout loading |
| [`docs/guides/CHECKOUT-MODES.md`](docs/guides/CHECKOUT-MODES.md) | Checkout setup guide |

---

## Environment Variables

```bash
# Required
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_token
VITE_CLOUDINARY_CLOUD=your_cloud_name

# Checkout (default: stripe)
VITE_CHECKOUT_MODE=stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Optional
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Full setup guide:** [docs/guides/SETUP-CHECKLIST.md](docs/guides/SETUP-CHECKLIST.md)

---

## Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run validate      # Full CI check
```

**347 tests** covering cart flow, checkout, components, and API integration.

---

## Deployment

```bash
# Deploy to Vercel
vercel

# Production
vercel --prod
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Setup Checklist](docs/guides/SETUP-CHECKLIST.md) | Step-by-step configuration |
| [Checkout Modes](docs/guides/CHECKOUT-MODES.md) | Stripe vs Shopify checkout |
| [Architecture](docs/architecture/ARCHITECTURE.md) | System design decisions |
| [SSR Persistence](docs/guides/SSR-PERSISTENCE-GUIDE.md) | Solving hydration errors |

---

## Show Your Support

If this project helped you:

- **Star** this repository
- **Fork** it for your own projects
- **Share** it with other developers

Your support helps others discover this starter kit!

---

## Data Source

Artwork from [Smithsonian Open Access](https://www.si.edu/openaccess) - public domain images from the Smithsonian American Art Museum.

---

## License

MIT - Use for learning, reference, or as a starting point for your own projects.

---

## Acknowledgments

- [Smithsonian Institution](https://www.si.edu/openaccess) - Open Access artwork
- [Shopify](https://shopify.dev/) - Storefront API
- [Stripe](https://stripe.com/docs) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Image CDN
