# Troubleshooting Guide

This guide covers common issues and their solutions when working with the Gallery Store project.

## Table of Contents

- [Hydration Errors](#hydration-errors)
- [Shopify API Issues](#shopify-api-issues)
- [Cloudinary Configuration](#cloudinary-configuration)
- [Cart Persistence](#cart-persistence)
- [Build and Deploy](#build-and-deploy)
- [Testing Issues](#testing-issues)

---

## Hydration Errors

### "Hydration failed because the initial UI does not match what was rendered on the server"

**Cause:** This occurs when localStorage data (like cart items) is read during initial render, causing a mismatch between server and client.

**Solution:** This project uses `useSyncExternalStore` with separate server/client snapshots:

```typescript
// src/lib/createPersistedStore.ts
export function createPersistedStore<T>(key: string, initialState: T) {
  return {
    getSnapshot: () => {
      // Client: read from localStorage
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialState
    },
    getServerSnapshot: () => initialState  // Server: always return initial
  }
}
```

**If you still see errors:**

1. Check if you're accessing `window` or `localStorage` outside of `useEffect`
2. Ensure conditional rendering uses `useEffect` + state, not direct checks
3. Verify your component is wrapped with the correct provider

**Anti-pattern to avoid:**

```typescript
// BAD: Causes hydration mismatch
function Component() {
  const isClient = typeof window !== 'undefined'
  return isClient ? <ClientContent /> : <ServerContent />
}

// GOOD: Defer to client with useEffect
function Component() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <ServerContent />
  return <ClientContent />
}
```

---

## Shopify API Issues

### "Shopify API error: 401"

**Cause:** Invalid or missing Storefront API access token.

**Solution:**

1. Verify your `.env.local` file has the correct token:
   ```bash
   VITE_SHOPIFY_STOREFRONT_TOKEN=your_token_here
   ```

2. Check the token in Shopify Admin:
   - Go to Settings → Apps and sales channels → Develop apps
   - Select your app → API credentials
   - Verify the Storefront API access token

3. Ensure the token has the required scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_collection_listings`

### "Shopify API error: 429"

**Cause:** Rate limit exceeded.

**Solution:** The API includes retry logic with exponential backoff. If you still hit limits:

1. Reduce request frequency
2. Implement request batching
3. Cache responses where appropriate

### API Response Validation Errors

**Cause:** Shopify API response structure changed or is missing expected fields.

**Solution:**

1. Check the Zod validation error message for specific field issues
2. Verify your Shopify store has the expected data (products, collections)
3. Check for API version compatibility in `src/data/shopify-api.ts`

```typescript
// Update API version if needed
const API_VERSION = '2025-01'
```

### Network Timeout Errors

**Cause:** Slow network or Shopify API latency.

**Solution:** The default timeout is 10 seconds with 3 retries. Adjust if needed:

```typescript
// In shopify-api.ts
const FETCH_TIMEOUT_MS = 15000  // Increase to 15s
const MAX_RETRIES = 5           // Increase retries
```

---

## Cloudinary Configuration

### Images Not Loading Through CDN

**Cause:** Cloudinary cloud name not configured or invalid.

**Solution:**

1. Set your Cloudinary cloud name in `.env.local`:
   ```bash
   VITE_CLOUDINARY_CLOUD=your_cloud_name
   ```

2. Verify your cloud name at [cloudinary.com](https://cloudinary.com/console)

3. Test with a simple URL:
   ```
   https://res.cloudinary.com/YOUR_CLOUD/image/fetch/w_400/https://example.com/image.jpg
   ```

### Fallback to Original URLs

**Cause:** Without Cloudinary configured, images fall back to original Smithsonian URLs.

**This is expected behavior.** The app works without Cloudinary, just without CDN optimization.

### CORS Errors with Cloudinary

**Cause:** The original image server doesn't allow cross-origin requests.

**Solution:** Cloudinary's fetch API typically handles this. If issues persist:

1. Use Cloudinary upload instead of fetch
2. Proxy images through your server

---

## Cart Persistence

### Cart Not Persisting After Refresh

**Cause:** localStorage not being read correctly on client hydration.

**Solution:**

1. Verify `CartProvider` wraps your app in `root.tsx`
2. Check browser console for localStorage errors
3. Clear localStorage and test fresh:
   ```javascript
   localStorage.removeItem('gallery-store-cart')
   ```

### Cart Shows Wrong Quantity

**Cause:** State synchronization issue between multiple tabs.

**Solution:** The cart uses `storage` event listeners for cross-tab sync. If issues persist:

1. Close all tabs and refresh
2. Clear localStorage
3. Check for console errors during add-to-cart

### Cart Items Missing After Deploy

**Cause:** localStorage key changed between versions.

**Solution:** The cart key is `gallery-store-cart`. If you changed it:

1. Migrate old data to new key
2. Or inform users to clear their cart

---

## Build and Deploy

### TypeScript Errors on Build

```bash
npm run typecheck
```

**Common issues:**

1. **Missing types**: Install `@types/package-name`
2. **Strict null checks**: Add null checks or use optional chaining
3. **Import errors**: Check path aliases in `tsconfig.json`

### ESLint Errors

```bash
npm run lint
```

**Common fixes:**

1. **Unused variables**: Remove or prefix with `_`
2. **Missing dependencies in hooks**: Add to dependency array
3. **Auto-fix available**: Run `npm run lint:fix`

### Build Fails on Vercel

**Common causes:**

1. **Environment variables**: Set all required vars in Vercel dashboard
2. **Node version**: Ensure Vercel uses Node 18+
3. **Memory issues**: Increase build memory limit in Vercel settings

### CSS Not Loading in Production

**Cause:** Tailwind purging unused styles.

**Solution:**

1. Check `tailwind.config.js` content paths
2. Ensure dynamic class names use complete strings:

```typescript
// BAD: Tailwind can't detect
const color = `text-${status}-500`

// GOOD: Complete class names
const colors = {
  success: 'text-green-500',
  error: 'text-red-500'
}
```

---

## Testing Issues

### Tests Failing with "act() warning"

**Cause:** State updates happening outside React's control.

**Solution:**

```typescript
import { act } from '@testing-library/react'

// Wrap state-updating code
await act(async () => {
  fireEvent.click(button)
})
```

### Mocking localStorage in Tests

**Solution:** Use the mock in `src/test/setup.ts`:

```typescript
// Already configured in setup.ts
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

### E2E Tests Timing Out

**Cause:** Slow CI environment or network issues.

**Solution:**

1. Increase timeout in test:
   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(30000)  // 30 seconds
     // ...
   })
   ```

2. Add explicit waits:
   ```typescript
   await page.waitForSelector('[data-testid="product-card"]')
   ```

### E2E Tests Fail on CI but Pass Locally

**Cause:** Different browser versions, timing issues, or missing env vars.

**Solution:**

1. Use same browser version as CI:
   ```bash
   npx playwright install chromium
   ```

2. Add retry logic in playwright.config.ts:
   ```typescript
   retries: process.env.CI ? 2 : 0
   ```

3. Check CI environment variables match local

---

## Still Having Issues?

1. **Search existing issues**: Check GitHub Issues for similar problems
2. **Create a new issue**: Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and stack traces
   - Environment details (OS, Node version, browser)

3. **Check the docs**:
   - [Architecture Guide](docs/architecture/ARCHITECTURE.md)
   - [SSR Persistence Guide](docs/guides/SSR-PERSISTENCE-GUIDE.md)
   - [API Reference](docs/api/API.md)
