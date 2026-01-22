# Checkout Modes Guide

This starter kit supports **two checkout modes** that can be switched with a single environment variable. This flexibility is a key feature for headless Shopify development.

## Quick Start

Set `VITE_CHECKOUT_MODE` in your `.env.local`:

```bash
# Option 1: Stripe checkout (default)
VITE_CHECKOUT_MODE=stripe

# Option 2: Shopify native checkout
VITE_CHECKOUT_MODE=shopify
```

That's it! The application automatically loads the appropriate checkout component.

---

## Mode Comparison

| Feature | Stripe Mode | Shopify Mode |
|---------|-------------|--------------|
| **Works on free dev stores** | Yes | No* |
| **UI customization** | Full control | Limited to Shopify Plus |
| **Payment gateway required** | No (uses Stripe) | Yes |
| **Order sync to Shopify** | Via Admin API | Automatic |
| **Checkout.liquid access** | N/A | Shopify Plus only |
| **Best for** | Development, custom UX | Production with Shopify Payments |

*Free Shopify dev stores have checkout locked. Native checkout only works with an active payment gateway.

---

## Stripe Mode (Default)

### Why Stripe Mode?

Shopify's checkout on free development stores is **locked** - you can't complete purchases or test the checkout flow. This is a major blocker for headless development.

Stripe mode solves this by:
1. Processing payments directly through Stripe
2. Creating orders in Shopify via the Admin API
3. Giving you complete control over the checkout UI

### Setup

1. **Get Stripe API keys** from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

2. **Add to `.env.local`:**
   ```bash
   VITE_CHECKOUT_MODE=stripe
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

3. **Test with Stripe test cards:**

   | Card Number | Result |
   |-------------|--------|
   | 4242 4242 4242 4242 | Success |
   | 4000 0000 0000 0002 | Declined |
   | 4000 0000 0000 9995 | Insufficient funds |

   Use any future expiry date and any 3-digit CVC.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Stripe Checkout Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Customer fills shipping form                             │
│                    │                                         │
│                    ▼                                         │
│  2. Create PaymentIntent via /api/create-payment-intent      │
│                    │                                         │
│                    ▼                                         │
│  3. Stripe Elements handles card input                       │
│                    │                                         │
│                    ▼                                         │
│  4. Payment confirmed with Stripe                            │
│                    │                                         │
│                    ▼                                         │
│  5. Create Shopify order via /api/create-order               │
│     (uses Admin API, marks as paid)                          │
│                    │                                         │
│                    ▼                                         │
│  6. Show success, clear cart                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/pages/Checkout.tsx` | Custom checkout UI with Stripe Elements |
| `app/routes/api.create-payment-intent.ts` | Creates Stripe PaymentIntent |
| `app/routes/api.create-order.ts` | Creates Shopify draft order, marks paid |

---

## Shopify Mode

### When to Use

Use Shopify mode when:
- You have a production store with Shopify Payments enabled
- You want to leverage Shopify's hosted checkout
- You need Shopify's built-in fraud protection
- You're using Shopify Plus and want checkout customization

### Setup

1. **Ensure Shopify is configured:**
   ```bash
   VITE_CHECKOUT_MODE=shopify
   VITE_SHOPIFY_STORE=your-store.myshopify.com
   VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
   ```

2. **Verify payment gateway is active** in Shopify Admin → Settings → Payments

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                   Shopify Checkout Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Customer clicks checkout                                 │
│                    │                                         │
│                    ▼                                         │
│  2. Create Shopify cart via Storefront API                   │
│                    │                                         │
│                    ▼                                         │
│  3. Redirect to Shopify's hosted checkout                    │
│     (checkoutUrl from cart)                                  │
│                    │                                         │
│                    ▼                                         │
│  4. Customer completes payment on Shopify                    │
│                    │                                         │
│                    ▼                                         │
│  5. Shopify handles order creation, emails, etc.             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/pages/ShopifyCheckout.tsx` | Cart creation and redirect to Shopify |

### Custom Checkout Domain (Optional)

If you have a custom checkout domain configured in Shopify:

```bash
VITE_SHOPIFY_CHECKOUT_DOMAIN=https://checkout.yourstore.com
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    /checkout route                           │
│                (app/routes/checkout.tsx)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  VITE_CHECKOUT_MODE=stripe    VITE_CHECKOUT_MODE=shopify     │
│            │                             │                   │
│            ▼                             ▼                   │
│  ┌─────────────────┐           ┌─────────────────┐          │
│  │ Checkout.tsx    │           │ ShopifyCheckout │          │
│  │ (Stripe)        │           │     .tsx        │          │
│  └────────┬────────┘           └────────┬────────┘          │
│           │                             │                    │
│           ▼                             ▼                    │
│  ┌─────────────────┐           ┌─────────────────┐          │
│  │ Stripe Elements │           │ Shopify Cart    │          │
│  │ + Admin API     │           │ + Redirect      │          │
│  │ Order Creation  │           │                 │          │
│  └─────────────────┘           └─────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

The `checkoutConfig` module (`src/config/checkout.ts`) handles:
- Reading the environment variable
- Validating configuration
- Providing fallback behavior
- Generating helpful error messages

---

## Fallback Behavior

The configuration module includes smart fallback logic:

1. **If Shopify mode is set but Shopify isn't configured** → Falls back to Stripe (if configured)
2. **If Stripe mode is set but Stripe isn't configured** → Falls back to Shopify (if configured)
3. **If neither is configured** → Shows helpful error with required variables

This prevents checkout from completely breaking due to misconfiguration.

---

## Troubleshooting

### "Checkout Not Configured" Error

**Cause:** Required environment variables are missing.

**Solution:** Check that you have the required variables for your chosen mode:

For Stripe mode:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

For Shopify mode:
```bash
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_...
```

### Stripe Checkout Shows Empty

**Cause:** PaymentIntent creation failed.

**Solution:**
1. Check browser console for errors
2. Verify `STRIPE_SECRET_KEY` is set (server-side)
3. Check `/api/create-payment-intent` response

### Shopify Checkout Fails to Redirect

**Cause:** Cart creation failed or checkout is locked.

**Solution:**
1. Verify products have valid Shopify variant IDs
2. Check that payment gateway is active (not just test mode)
3. Review console for API errors

### Order Not Appearing in Shopify (Stripe Mode)

**Cause:** Admin API order creation failed.

**Solution:**
1. Check that `SHOPIFY_ADMIN_TOKEN` has `write_orders` scope
2. Verify the API response in `/api/create-order`
3. Check Shopify Admin → Apps → Your app → API logs

---

## Recommended Configurations

### Local Development
```bash
VITE_CHECKOUT_MODE=stripe
# Use Stripe test keys
```
Stripe mode lets you test the full checkout flow on free dev stores.

### Staging/Preview
```bash
VITE_CHECKOUT_MODE=stripe
# Use Stripe test keys with real Shopify integration
```
Test order creation in Shopify while using Stripe test payments.

### Production
```bash
VITE_CHECKOUT_MODE=shopify
# or stripe depending on your needs
```
Choose based on your business requirements:
- **Shopify mode**: Simpler, uses Shopify Payments, automatic fraud protection
- **Stripe mode**: Full UI control, works without Shopify Payments

---

## Related Documentation

- [Architecture](../architecture/ARCHITECTURE.md) - System design overview
- [API Reference](../api/API.md) - API route documentation
- [SSR Persistence](SSR-PERSISTENCE-GUIDE.md) - Cart state management
