# Premium UX Enhancement Plan
## Mirroring hikariandink.com's Gallery Experience

**Goal:** Transform Gallery Store into a visually cohesive premium art e-commerce experience

---

## Overview of Changes

| Category | Current State | Target State |
|----------|---------------|--------------|
| Add to Cart button | Green (`bg-green-500`) on click | Ink palette (`bg-ink-700`) |
| Cart "Free shipping" | Green badge | Ink/paper palette badge |
| Cart product images | Rounded corners | No radius, thin frame border |
| Frame color selector | Not in cart | Clickable color circles in cart |
| "More from Artist" | Not implemented | Carousel with < > navigation |
| Product card images | Plain | Thin black frame + shadow |
| Fade animations | None | Ease fade-in on load/scroll |
| Mobile menu | Instant toggle | Smooth drop/fade animation |
| Collection title | "Collections" static | Dynamic: "All Collections" / "Artist Collection" |
| Print count | Per artist only | Show total or filtered count |

---

## Phase 1: Color Scheme Alignment

### 1.1 Add to Cart Button (product.tsx)
**File:** `app/routes/product.tsx` (lines 287-291)

**Current:**
```tsx
className={`... ${added ? 'bg-green-500 text-white' : 'btn-primary'}`}
```

**Target:**
```tsx
className={`... ${added ? 'bg-ink-700 text-paper-50' : 'btn-primary'}`}
```

### 1.2 Free Shipping Badge (ShippingBanner.tsx)
**File:** `src/components/layout/ShippingBanner.tsx` (lines 64-78)

**Current:**
```tsx
<div className="bg-green-50 rounded-lg p-3 mb-4">
  <p className="text-sm text-green-700 font-medium ...">
```

**Target:**
```tsx
<div className="bg-ink-50 rounded-lg p-3 mb-4 border border-ink-200">
  <p className="text-sm text-ink-700 font-medium ...">
```

---

## Phase 2: Cart Product Image Enhancement

### 2.1 Remove Radius + Add Frame Border (Cart.tsx)
**File:** `src/components/cart/Cart.tsx` (lines 116-131)

**Current:**
```tsx
<Link
  className="w-20 h-20 rounded-lg overflow-hidden ..."
  style={{ border: `3px solid ${frameColor}`, ... }}
>
```

**Target:**
```tsx
<Link
  className="w-20 h-20 overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
  style={{
    border: `3px solid ${frameColor}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 0 4px rgba(0,0,0,0.1)'
  }}
>
```

### 2.2 Frame Color Selector Circles in Cart (Cart.tsx)
Add clickable color circles below each cart item allowing frame change.

**New Component:** `FrameColorPicker` (inline or extracted)

```tsx
{/* Frame Color Selector */}
<div className="flex items-center gap-2 mt-2">
  <span className="text-xs text-ink-500">Frame:</span>
  {Object.entries(frameColors).map(([name, color]) => (
    <button
      key={name}
      onClick={() => dispatch({
        type: 'UPDATE_FRAME',
        payload: { key: item.key, frameId: name }
      })}
      className={cn(
        "w-5 h-5 rounded-full border-2 transition-all",
        item.frameId === name ? "ring-2 ring-ink-400 ring-offset-1" : "border-ink-200"
      )}
      style={{ backgroundColor: color }}
      aria-label={`Select ${name}`}
      title={name}
    />
  ))}
</div>
```

**Required:** Add `UPDATE_FRAME` action to CartContext reducer.

---

## Phase 3: "More from Artist" Carousel

### 3.1 Create MoreFromArtist Component
**File:** `src/components/cart/MoreFromArtist.tsx` (new)

```tsx
interface MoreFromArtistProps {
  artist: string
  currentProductId: string
  products: Product[]
}

export function MoreFromArtist({ artist, currentProductId, products }: MoreFromArtistProps) {
  const artistProducts = products.filter(p =>
    p.artist === artist && p.id !== currentProductId
  )
  const [currentIndex, setCurrentIndex] = useState(0)

  if (artistProducts.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-ink-100">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500">
          More from {artist}
        </span>
        <div className="flex items-center gap-1 text-xs text-ink-400">
          <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>{currentIndex + 1}/{artistProducts.length}</span>
          <button onClick={() => setCurrentIndex(i => Math.min(artistProducts.length - 1, i + 1))}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Mini product preview */}
      <Link to={`/product/${artistProducts[currentIndex].id}`}>
        <img src={artistProducts[currentIndex].image} alt="" className="w-12 h-12 object-cover mt-2" />
      </Link>
    </div>
  )
}
```

**Required:** Pass products list to Cart component (via context or loader).

---

## Phase 4: Product Card Frame & Shadow

### 4.1 Update ProductCard Styling (home.tsx)
**File:** `app/routes/home.tsx` (lines 105-137)

**Target:** Add thin black border + shadow to all product images.

```tsx
<div className="aspect-[4/5] overflow-hidden relative bg-paper-100">
  {/* Thin black frame with shadow */}
  <div className="absolute inset-0 border border-ink-900/80 shadow-lg pointer-events-none z-10" />
  <img
    src={thumbnailSrc}
    alt={product.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    ...
  />
</div>
```

**CSS Addition (app.css):**
```css
/* Product card frame effect */
.product-card-frame {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08);
  border: 1px solid rgba(26, 26, 26, 0.8);
}
```

---

## Phase 5: Fade-In Animations

### 5.1 Add Intersection Observer Hook
**File:** `src/hooks/useFadeIn.ts` (new)

```tsx
import { useEffect, useRef, useState } from 'react'

export function useFadeIn(options = { threshold: 0.1 }) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      options
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [options])

  return { ref, isVisible }
}
```

### 5.2 Apply to Product Cards
```tsx
<div
  ref={fadeRef}
  className={cn(
    "transition-all duration-500 ease-out",
    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
  )}
>
  <ProductCard product={product} />
</div>
```

### 5.3 Update CSS for Staggered Animation
**File:** `app/app.css`

```css
/* Staggered fade-in for product grid */
.fade-in-stagger > * {
  opacity: 0;
  transform: translateY(16px);
  animation: fadeInUp 0.5s ease-out forwards;
}

.fade-in-stagger > *:nth-child(1) { animation-delay: 0ms; }
.fade-in-stagger > *:nth-child(2) { animation-delay: 50ms; }
.fade-in-stagger > *:nth-child(3) { animation-delay: 100ms; }
.fade-in-stagger > *:nth-child(4) { animation-delay: 150ms; }
.fade-in-stagger > *:nth-child(5) { animation-delay: 200ms; }
/* ... up to 10 for first row */

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Phase 6: Mobile Menu Animation

### 6.1 Update Header.tsx Menu Animation
**File:** `src/components/layout/Header.tsx`

**Current:** Instant show/hide
**Target:** Smooth slide down + fade

```tsx
{/* Mobile Menu - animated */}
<div
  className={cn(
    "md:hidden overflow-hidden transition-all duration-300 ease-out",
    mobileMenuOpen
      ? "max-h-40 opacity-100"
      : "max-h-0 opacity-0"
  )}
>
  <nav className="px-4 py-4 space-y-3 border-t border-ink-100">
    {navLinks.map(link => (
      <Link key={link.href} to={link.href} className="block py-2 ...">
        {link.label}
      </Link>
    ))}
  </nav>
</div>
```

---

## Phase 7: Dynamic Collection Title & Count

### 7.1 Update Home Page Header (home.tsx)
**File:** `app/routes/home.tsx`

**Logic:**
- No artist selected → "All Collections" + total count
- Artist selected → "{Artist Name} Collection" + filtered count

```tsx
const collectionTitle = currentArtist
  ? `${currentArtist.name} Collection`
  : 'All Collections'

const printCount = filteredProducts.length
const printLabel = printCount === 1 ? 'print' : 'prints'
```

### 7.2 Update ArtistCircles.tsx
Change heading to show dynamic title:

```tsx
<h2 className="text-center font-display text-2xl text-ink-900 mb-2">
  {selectedArtist ? `${selectedArtistName} Collection` : 'Collections'}
</h2>
<p className="text-center text-sm text-ink-500 mb-6">
  {selectedArtist
    ? `${filteredCount} ${filteredCount === 1 ? 'print' : 'prints'}`
    : 'Museum-quality prints from the Smithsonian'
  }
</p>
```

---

## Implementation Order

| Phase | Task | Files Modified |
|-------|------|----------------|
| 1.1 | Add to Cart button color | `app/routes/product.tsx` |
| 1.2 | Free shipping badge color | `src/components/layout/ShippingBanner.tsx` |
| 2.1 | Cart image: no radius, frame shadow | `src/components/cart/Cart.tsx` |
| 2.2 | Frame color selector in cart | `src/components/cart/Cart.tsx`, `src/context/CartContext.tsx` |
| 3 | "More from Artist" carousel | New: `src/components/cart/MoreFromArtist.tsx` |
| 4 | Product card frame + shadow | `app/routes/home.tsx`, `app/app.css` |
| 5 | Fade-in animations | New: `src/hooks/useFadeIn.ts`, `app/app.css` |
| 6 | Mobile menu animation | `src/components/layout/Header.tsx` |
| 7 | Dynamic collection title + count | `app/routes/home.tsx`, `src/components/home/ArtistCircles.tsx` |

---

## Verification Checklist

- [ ] TypeScript: `npm run typecheck`
- [ ] Lint: `npm run lint`
- [ ] Tests: `npm run test`
- [ ] Build: `npm run build`
- [ ] Manual: Add to cart button shows ink color on click
- [ ] Manual: Cart free shipping badge uses ink palette
- [ ] Manual: Cart images have no radius, thin frame border
- [ ] Manual: Frame color circles work in cart
- [ ] Manual: "More from Artist" carousel appears
- [ ] Manual: Product cards have black frame + shadow
- [ ] Manual: Products fade in on page load
- [ ] Manual: Mobile menu slides down smoothly
- [ ] Manual: Collection title changes based on selection
- [ ] Manual: Print count updates correctly

---

## Files Summary

### Modified Files
- `app/routes/product.tsx` - Add to cart button color
- `app/routes/home.tsx` - Product card frame, dynamic title, fade-in
- `src/components/layout/ShippingBanner.tsx` - Badge color
- `src/components/layout/Header.tsx` - Menu animation
- `src/components/cart/Cart.tsx` - Image styling, frame selector
- `src/components/home/ArtistCircles.tsx` - Dynamic title
- `src/context/CartContext.tsx` - UPDATE_FRAME action
- `app/app.css` - Fade animations, frame styling

### New Files
- `src/hooks/useFadeIn.ts` - Intersection Observer hook
- `src/components/cart/MoreFromArtist.tsx` - Artist carousel
