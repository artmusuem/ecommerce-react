# Gallery Store Testing Guide

## Overview

This testing suite uses **Vitest** (Vite-native test runner) and **React Testing Library** for component testing.

## Test Coverage

| Category | Files | Coverage |
|----------|-------|----------|
| **Unit Tests** | `images.test.ts`, `products.test.ts` | Utility functions, price calculations |
| **Component Tests** | `ProductCard.test.tsx`, `Cart.test.tsx` | UI rendering, user interactions |
| **Context Tests** | `CartContext.test.tsx` | State management, actions |
| **Integration Tests** | `integration.test.tsx` | Full cart flow, persistence |

---

## Installation

### 1. Install Testing Dependencies

Run this command in your project root:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

### 2. Copy Test Files

Copy these files/folders to your project:

```
src/
├── test/
│   ├── setup.ts          # Test configuration
│   ├── mocks.ts          # Mock data and utilities
│   └── integration.test.tsx
├── utils/
│   └── images.test.ts
├── data/
│   └── products.test.ts
├── context/
│   └── CartContext.test.tsx
└── components/
    ├── product/
    │   └── ProductCard.test.tsx
    └── cart/
        └── Cart.test.tsx

vitest.config.ts          # Vitest configuration (project root)
```

### 3. Update package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

---

## Running Tests

### Run All Tests (Watch Mode)
```bash
npm test
```
Tests will re-run automatically when files change.

### Run Tests Once
```bash
npm run test:run
```

### Run with Coverage Report
```bash
npm run test:coverage
```
Coverage report generated in `coverage/` folder.

### Run Specific Test File
```bash
npx vitest src/utils/images.test.ts
```

### Run Tests Matching Pattern
```bash
npx vitest -t "calculatePrice"
```

---

## Test Structure

### Unit Tests (`*.test.ts`)

Pure function testing - no React rendering:

```typescript
describe('calculatePrice', () => {
  it('should calculate price for 8x10 + black frame', () => {
    const price = calculatePrice('8x10', 'black')
    expect(price).toBe(45)
  })
})
```

### Component Tests (`*.test.tsx`)

React component rendering and interaction:

```typescript
describe('ProductCard', () => {
  it('should render product title', () => {
    render(<ProductCard product={mockProduct} index={0} artistId="test" />)
    expect(screen.getByText('The Gulf Stream')).toBeInTheDocument()
  })
})
```

### Integration Tests

Full flow testing across multiple components:

```typescript
describe('Cart Flow', () => {
  it('should maintain cart state across navigation', async () => {
    // Test add to cart → navigation → cart persistence
  })
})
```

---

## Key Test Patterns

### 1. Testing Image Optimization

```typescript
it('should use Cloudinary CDN URL', () => {
  render(<ProductCard product={mockProduct} />)
  
  const img = screen.getByAltText('Product Title')
  expect(img.getAttribute('src')).toContain('cloudinary.com')
  expect(img.getAttribute('src')).toContain('w_400')
})
```

### 2. Testing Cart Actions

```typescript
it('should add item to cart', () => {
  render(<CartTestComponent />)
  
  act(() => {
    screen.getByTestId('add-item').click()
  })
  
  expect(screen.getByTestId('item-count').textContent).toBe('1')
})
```

### 3. Testing Loading States

```typescript
it('should show opacity-0 before load', () => {
  render(<ProductCard product={mockProduct} />)
  
  const img = screen.getByAltText('Product')
  expect(img).toHaveStyle({ opacity: '0' })
})

it('should show opacity-1 after load', async () => {
  render(<ProductCard product={mockProduct} />)
  
  const img = screen.getByAltText('Product')
  fireEvent.load(img)
  
  await waitFor(() => {
    expect(img).toHaveStyle({ opacity: '1' })
  })
})
```

### 4. Testing Error Fallbacks

```typescript
it('should try fallback on image error', async () => {
  render(<ProductCard product={mockProduct} />)
  
  const img = screen.getByAltText('Product')
  fireEvent.error(img)
  
  await waitFor(() => {
    expect(img.getAttribute('src')).toContain('ids.si.edu')
  })
})
```

---

## Mocking

### Environment Variables

Set in `src/test/setup.ts`:

```typescript
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')
vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')
```

### localStorage

Mocked automatically in setup:

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
```

### Fetch API

Mock in individual tests:

```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ artworks: mockArtworks })
  })
) as unknown as typeof fetch
```

---

## Expected Test Output

```
 ✓ src/utils/images.test.ts (18 tests)
 ✓ src/data/products.test.ts (24 tests)
 ✓ src/context/CartContext.test.tsx (12 tests)
 ✓ src/components/product/ProductCard.test.tsx (14 tests)
 ✓ src/components/cart/Cart.test.tsx (16 tests)
 ✓ src/test/integration.test.tsx (8 tests)

 Test Files  6 passed (6)
      Tests  92 passed (92)
   Start at  10:00:00
   Duration  2.5s
```

---

## Continuous Integration

Add to your GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

---

## Troubleshooting

### "Cannot find module '@testing-library/jest-dom'"

Run: `npm install -D @testing-library/jest-dom`

### "ReferenceError: vi is not defined"

Add to test file: `import { vi } from 'vitest'`

### Tests hanging

Check for unresolved promises or missing `await` on async operations.

### Snapshot mismatch

Run: `npx vitest -u` to update snapshots.

---

## File Reference

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Test runner configuration |
| `src/test/setup.ts` | Global test setup, mocks |
| `src/test/mocks.ts` | Mock data factory functions |
| `*.test.ts` | Unit tests |
| `*.test.tsx` | Component tests |
