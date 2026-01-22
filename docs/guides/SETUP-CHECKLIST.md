# Setup Checklist

Complete setup guide for the Headless Shopify Starter Kit. Follow these steps to get from clone to running demo.

## Prerequisites

Before starting, ensure you have:

- [ ] **Node.js 18+** - Check with `node --version`
- [ ] **npm 9+** - Check with `npm --version`
- [ ] **Git** - Check with `git --version`
- [ ] **Shopify Partner Account** - [partners.shopify.com](https://partners.shopify.com)
- [ ] **Stripe Account** - [dashboard.stripe.com](https://dashboard.stripe.com) (for test keys)

---

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce-react-shopify.git
cd ecommerce-react-shopify

# Install dependencies
npm install
```

**Verify:** `npm run dev` should start without errors (will show config warnings - that's expected)

---

## Step 2: Create Shopify Development Store

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Navigate to **Stores** → **Add store** → **Create development store**
3. Choose **Create a store to test and build**
4. Name your store and create it

**Verify:** You can access `your-store.myshopify.com/admin`

---

## Step 3: Create Shopify Custom App

1. In Shopify Admin: **Settings** → **Apps and sales channels** → **Develop apps**
2. Click **Create an app** → Name it "Headless Storefront"
3. Configure **API scopes**:

   **Admin API scopes needed:**
   - `read_products`
   - `write_orders` (for Stripe checkout mode)
   - `read_orders`

   **Storefront API scopes needed:**
   - `unauthenticated_read_product_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`

4. Click **Install app**
5. Copy your tokens:
   - **Admin API access token** (starts with `shpat_`)
   - **Storefront API access token** (starts with a hex string)

**Verify:** Both tokens are copied and stored securely

---

## Step 4: Get Stripe Test Keys

1. Go to [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

**Verify:** Both keys are from "Test mode" (not live)

---

## Step 5: Configure Environment Variables

Create `.env.local` in the project root:

```bash
# ===================
# SHOPIFY CONFIGURATION
# ===================
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token_here
SHOPIFY_ADMIN_TOKEN=shpat_your_admin_token_here

# ===================
# STRIPE CONFIGURATION
# ===================
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# ===================
# CHECKOUT MODE
# ===================
# Options: 'stripe' (default), 'shopify'
VITE_CHECKOUT_MODE=stripe

# ===================
# CLOUDINARY (for images)
# ===================
VITE_CLOUDINARY_CLOUD=your_cloudinary_cloud_name
```

**Verify:** File exists at `.env.local` and is NOT committed to git

---

## Step 6: Add Test Products

Option A: **Use existing Shopify products**
- Ensure your store has products with images
- Products should have valid variants

Option B: **Create test products**
- In Shopify Admin: **Products** → **Add product**
- Add title, images, price, and variants

**Verify:** At least 3 products with images appear in Shopify Admin → Products

---

## Step 7: Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Verify:**
- [ ] Homepage loads without errors
- [ ] Products display with images
- [ ] Can add item to cart
- [ ] Cart sidebar opens with items

---

## Step 8: Test Checkout Flow

### Stripe Mode (Default)

1. Add a product to cart
2. Click "Checkout"
3. Fill in shipping information:
   - Name: Test User
   - Email: test@example.com
   - Address: 123 Test St, Test City, TS 12345
4. Use Stripe test card:
   - Number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
5. Click "Pay"

**Verify:**
- [ ] Payment succeeds
- [ ] Success message displays
- [ ] Order appears in Shopify Admin → Orders

### Shopify Mode (Optional)

1. Update `.env.local`:
   ```bash
   VITE_CHECKOUT_MODE=shopify
   ```
2. Restart dev server
3. Add product to cart and checkout
4. Should redirect to Shopify's hosted checkout

**Note:** Shopify mode requires an active payment gateway. Free dev stores have checkout locked.

---

## Step 9: Run Tests

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test
```

**Verify:**
- [ ] All tests pass (300+ tests)
- [ ] No test failures or warnings

---

## Step 10: Build for Production

```bash
# Check TypeScript
npm run typecheck

# Check linting
npm run lint

# Build
npm run build
```

**Verify:**
- [ ] Typecheck passes
- [ ] Lint passes (zero warnings)
- [ ] Build completes without errors

---

## Deployment Checklist

### Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `VITE_SHOPIFY_STORE` | your-store.myshopify.com | |
   | `VITE_SHOPIFY_STOREFRONT_TOKEN` | shpca_xxx... | Public token |
   | `SHOPIFY_ADMIN_TOKEN` | shpat_xxx... | **Keep secret** |
   | `VITE_STRIPE_PUBLIC_KEY` | pk_live_xxx... | Use live key |
   | `STRIPE_SECRET_KEY` | sk_live_xxx... | **Keep secret** |
   | `VITE_CHECKOUT_MODE` | stripe or shopify | |
   | `VITE_CLOUDINARY_CLOUD` | your_cloud_name | |

4. Deploy

**Security Note:**
- Variables prefixed with `VITE_` are exposed to the browser
- Variables WITHOUT `VITE_` prefix are server-side only
- Never expose `STRIPE_SECRET_KEY` or `SHOPIFY_ADMIN_TOKEN` to the client

---

## Quick Verification Commands

```bash
# Check everything at once
npm run typecheck && npm run lint && npm run test:run && npm run build

# Preview production build
npm run preview
```

---

## Common Setup Issues

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "VITE_SHOPIFY_STORE is not defined"
- Ensure `.env.local` exists in project root
- Restart the dev server after adding env vars
- Check variable names match exactly

### Products not loading
- Verify `VITE_SHOPIFY_STOREFRONT_TOKEN` is correct
- Check that products are "Active" in Shopify
- Ensure products are in "Online Store" sales channel

### Checkout errors
- For Stripe: Verify both `VITE_STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY`
- For Shopify: Ensure payment gateway is configured in Shopify Admin

### Images not displaying
- Verify `VITE_CLOUDINARY_CLOUD` is set
- Check Cloudinary dashboard for the cloud name
- Ensure images are uploaded to Shopify products

---

## Next Steps

After completing setup:

1. **Customize branding** - Update colors in `tailwind.config.js`
2. **Add your products** - Import or create in Shopify Admin
3. **Configure shipping** - Set up shipping rates in Shopify
4. **Set up analytics** - Add Google Analytics or similar
5. **Test thoroughly** - Complete multiple test purchases

See [CHECKOUT-MODES.md](CHECKOUT-MODES.md) for detailed checkout configuration.

---

## Support

- **Documentation:** Check `/docs` folder for detailed guides
- **Issues:** Open a GitHub issue for bugs
- **Shopify Help:** [help.shopify.com](https://help.shopify.com)
- **Stripe Help:** [stripe.com/docs](https://stripe.com/docs)
