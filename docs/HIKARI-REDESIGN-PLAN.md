# Gallery Store Premium Redesign Plan
## Mirroring hikariandink.com's Senior Developer Quality

**Reference Site:** https://www.hikariandink.com
**Current Site:** https://ecommerce-react-shopify.vercel.app
**Goal:** Transform Gallery Store into a premium art print e-commerce starter kit

---

## Design Analysis: hikariandink.com

### Visual Identity
- **Aesthetic:** Minimalist Japanese-inspired elegance
- **Color Palette:** Neutral tones (ink-900 #1a1a1a, paper-50 #fafafa, warm accents)
- **Typography:** Elegant serif for headlines, clean sans-serif for body
- **Spacing:** Generous whitespace, refined margins and padding
- **Photography:** High-quality hero images with responsive variants

### Key Design Elements
1. **Hero Section:** Full-width banner with premium imagery and minimal text
2. **Artist Navigation:** Circular avatar images for artist browsing
3. **Product Cards:** Clean, minimal cards with hover effects
4. **Footer:** Multi-column layout with location, support, social links
5. **Before/After Slider:** Showcases restoration quality (we have this!)
6. **Premium Messaging:** "Museum-quality restoration" positioning

---

## Phase 1: Typography & Color Foundation

### 1.1 Update Tailwind Configuration

**File:** `tailwind.config.ts`

```ts
// Add premium color palette
colors: {
  ink: {
    50: '#f7f7f7',
    100: '#e3e3e3',
    200: '#c8c8c8',
    300: '#a4a4a4',
    400: '#818181',
    500: '#666666',
    600: '#515151',
    700: '#434343',
    800: '#383838',
    900: '#1a1a1a',
    950: '#0d0d0d',
  },
  paper: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
  },
  warm: {
    50: '#faf8f5',
    100: '#f5f0e8',
  }
}

// Typography
fontFamily: {
  display: ['Crimson Text', 'Georgia', 'serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
}
```

### 1.2 Update CSS Variables

**File:** `app/app.css`

```css
:root {
  --color-ink-900: #1a1a1a;
  --color-paper-50: #fafafa;
  --color-warm-50: #faf8f5;

  /* Typography scale */
  --font-display: 'Crimson Text', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
```

---

## Phase 2: Hero Section Redesign

### 2.1 Create Hero Component

**File:** `src/components/home/Hero.tsx`

Features:
- Full-width container with background image
- Elegant headline with serif font
- Subtle subtitle with premium positioning
- Optional CTA button
- Responsive image handling with srcset

```tsx
interface HeroProps {
  title?: string
  subtitle?: string
  backgroundImage?: string
}

export function Hero({
  title = "Smithsonian Art Prints",
  subtitle = "Museum-quality reproductions of American masterworks",
}: HeroProps) {
  return (
    <section className="relative bg-ink-900 text-paper-50">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 to-ink-900/90" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-paper-100/80 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
```

---

## Phase 3: Circular Artist Avatars

### 3.1 Create ArtistCircles Component

**File:** `src/components/home/ArtistCircles.tsx`

Features:
- Circular avatar images for each artist
- Hover animation with subtle scale
- Click to filter products
- Shows artist name below
- Responsive grid layout

```tsx
interface ArtistCircle {
  name: string
  handle: string
  image: string  // Featured artwork to use as avatar
  productCount: number
}

export function ArtistCircles({
  artists,
  selectedArtist,
  onSelect,
}: {
  artists: ArtistCircle[]
  selectedArtist: string | null
  onSelect: (handle: string) => void
}) {
  return (
    <section className="py-12 px-4">
      <h2 className="text-center font-display text-2xl text-ink-900 mb-8">
        Browse by Artist
      </h2>

      <div className="flex flex-wrap justify-center gap-8">
        {artists.map((artist) => (
          <button
            key={artist.handle}
            onClick={() => onSelect(artist.handle)}
            className={cn(
              "group flex flex-col items-center transition-all",
              selectedArtist === artist.handle && "scale-105"
            )}
          >
            {/* Circular Image */}
            <div className={cn(
              "w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden",
              "border-4 transition-all",
              selectedArtist === artist.handle
                ? "border-ink-900 shadow-lg"
                : "border-paper-200 group-hover:border-ink-400"
            )}>
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Artist Name */}
            <span className="mt-3 font-medium text-sm text-ink-700">
              {artist.name}
            </span>
            <span className="text-xs text-ink-500">
              {artist.productCount} prints
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
```

### 3.2 Get Artist Images from Products

Each artist's avatar will use their first/featured product image cropped to a circle. The home.tsx loader will be updated to include artist images.

---

## Phase 4: Premium Footer

### 4.1 Redesign Footer Component

**File:** Update footer section in `app/routes/home.tsx`

Layout:
- Multi-column grid
- Brand section with logo and tagline
- Shop links
- Support/Info links
- Social media icons
- Bottom bar with copyright

```tsx
<footer className="bg-ink-900 text-paper-100">
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      {/* Brand Column */}
      <div className="md:col-span-2">
        <h3 className="font-display text-2xl text-paper-50 mb-4">
          Gallery Store
        </h3>
        <p className="text-paper-100/70 max-w-sm">
          Museum-quality prints from the Smithsonian American Art Museum.
          Free shipping on all orders.
        </p>
      </div>

      {/* Shop Links */}
      <div>
        <h4 className="font-medium text-paper-50 mb-4">Shop</h4>
        <ul className="space-y-2 text-paper-100/70">
          <li><Link to="/">All Prints</Link></li>
          <li><Link to="/checkout">Cart</Link></li>
        </ul>
      </div>

      {/* Info Links */}
      <div>
        <h4 className="font-medium text-paper-50 mb-4">Info</h4>
        <ul className="space-y-2 text-paper-100/70">
          <li><a href="https://www.si.edu/openaccess">Smithsonian Open Access</a></li>
          <li><a href="#">Shipping & Returns</a></li>
        </ul>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="mt-12 pt-8 border-t border-paper-100/10">
      <p className="text-sm text-paper-100/50 text-center">
        © 2025 Gallery Store. Artwork courtesy of Smithsonian Open Access.
      </p>
    </div>
  </div>
</footer>
```

---

## Phase 5: Product Card Refinement

### 5.1 Update ProductCard Styling

- Remove border-radius for more sophisticated look
- Use elegant hover effects
- Typography updates (serif title option)
- Refined spacing

```tsx
<Link className="group block bg-paper-50 hover:bg-paper-100 transition-colors">
  <div className="aspect-[4/5] overflow-hidden">
    <img
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      ...
    />
  </div>
  <div className="p-4">
    <h2 className="font-display text-lg text-ink-900">
      {product.title}
    </h2>
    <p className="text-sm text-ink-500 mt-1">
      {product.artist}
    </p>
    <p className="text-ink-700 font-medium mt-2">
      From ${price}
    </p>
  </div>
</Link>
```

---

## Phase 6: Header Refinement

### 6.1 Update Header Styling

**File:** `src/components/layout/Header.tsx`

- Simplified, elegant logo area
- Clean navigation
- Cart icon with count badge
- Remove shipping text from header (already in banner)

---

## Implementation Order

| Sprint | Tasks | Est. Changes |
|--------|-------|--------------|
| 1 | Typography & Color (Phase 1) | tailwind.config.ts, app.css |
| 2 | Hero Section (Phase 2) | New Hero.tsx, update home.tsx |
| 3 | Artist Circles (Phase 3) | New ArtistCircles.tsx, update home.tsx |
| 4 | Footer Redesign (Phase 4) | Update home.tsx footer section |
| 5 | Product Card Refinement (Phase 5) | Update ProductCard in home.tsx |
| 6 | Header Refinement (Phase 6) | Update Header.tsx |
| 7 | Final Polish & Testing | All files, E2E tests |

---

## Immediate Next Steps

1. **Phase 1:** Update Tailwind config with ink/paper colors and typography
2. **Phase 2:** Create Hero component and integrate into home page
3. **Phase 3:** Build ArtistCircles with circular avatars derived from products
4. **Phase 4:** Redesign footer with multi-column premium layout

---

## Files to Create/Modify

### New Files
- `src/components/home/Hero.tsx`
- `src/components/home/ArtistCircles.tsx`

### Files to Modify
- `tailwind.config.ts` - Color palette, typography
- `app/app.css` - CSS variables, font imports
- `app/routes/home.tsx` - Integrate new components
- `src/components/layout/Header.tsx` - Refinement
- `src/components/layout/ShippingBanner.tsx` - Already done!

---

## Success Criteria

- [x] Premium typography with serif headlines (font-display class)
- [x] Neutral ink/paper color palette (ink-50 to ink-950, paper-50 to paper-200)
- [ ] Hero section with elegant messaging (deferred - optional enhancement)
- [x] Circular artist avatars for navigation (ArtistCircles component)
- [x] Premium footer with multi-column layout (dark footer with ink-900)
- [x] Refined product cards (premium styling with ink colors)
- [x] Maintains 90+ Lighthouse score
- [x] All existing tests pass (323 tests)
- [x] Mobile responsive throughout

---

## Reference Screenshots

When implementing, reference:
- hikariandink.com homepage for overall aesthetic
- Their artist navigation for circular avatar pattern
- Their footer for multi-column layout
- Their product cards for hover effects and spacing
