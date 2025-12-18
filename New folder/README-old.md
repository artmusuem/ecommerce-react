# Gallery Store

A museum-quality art print marketplace featuring masterpieces from the Smithsonian American Art Museum.

Built with React, Tailwind CSS, and Stripe Payment Intents.

## Features

- **Artist Collections** - Browse curated artwork by Winslow Homer, Mary Cassatt, Thomas Cole, and more
- **Custom Framing** - Choose from 5 frame styles and 4 print sizes
- **Real Payments** - Secure checkout with Stripe Payment Intents
- **Responsive Design** - Beautiful on desktop and mobile

## Quick Start

```bash
# Install dependencies
npm install

# Add your Stripe keys to .env.local
cp .env.example .env.local
# Edit .env.local with your keys

# Start development server
npm run dev

# Open http://localhost:5173
```

## Environment Variables

Create `.env.local`:

```
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

Get keys at: https://dashboard.stripe.com/test/apikeys

## Tech Stack

- **React 18** + Vite 5
- **Tailwind CSS 4**
- **React Router 6**
- **Stripe Payment Intents**
- **Smithsonian Open Access API**

## Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## Adding Artists

1. Use the Smithsonian curator tool to generate a JSON file
2. Save to `public/data/artist-name.json`
3. Add to `src/data/products.js` artists array

## License

MIT - Use freely for your own projects.

## Credits

- Artwork from [Smithsonian Open Access](https://www.si.edu/openaccess)
- Payment processing by [Stripe](https://stripe.com)
