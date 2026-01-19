# Full Session Handoff - January 18, 2026

## Project Overview

**Project:** Gallery Store - Headless Shopify Storefront
**Repo:** `C:\xampp\htdocs\ecommerce-react-shopify`
**GitHub:** https://github.com/nathanmcmullendev/ecommerce-react
**Live:** https://ecommerce-react-shopify.vercel.app
**Inspiration:** https://hikariandink.com

---

## Goal

Transform Gallery Store from "working demo" to "portfolio showpiece" with premium framing UI.

---

## Current Task: Frame Selector Icons

The frame selector on product pages shows L-shaped corner icons for each frame type. These need to visually match the actual frame preview.

**Status:** 3D bevel effects added, but styling approach differs from main FramePreview.

**Next Step:** Unify FrameIcon CSS with FramePreview's `border-color` technique for perfect visual consistency.

---

## Key Files (Full Paths)

### Frame Preview Components
```
C:\xampp\htdocs\ecommerce-react-shopify\src\components\product\FramePreview.tsx
C:\xampp\htdocs\ecommerce-react-shopify\src\components\product\FramePreview.test.tsx
C:\xampp\htdocs\ecommerce-react-shopify\src\components\product\FrameIcon.tsx
```

### Styles
```
C:\xampp\htdocs\ecommerce-react-shopify\app\app.css
```
- Lines 180-204: CSS variables (--frame-width, --mat-width)
- Lines 205-286: Frame View styles (.frame-outer, .frame-black, etc.)
- Lines 289-400: Room Mockup View styles
- Lines 480-700: Frame Selector Icon styles (.frame-icon-*)

### Product Page Integration
```
C:\xampp\htdocs\ecommerce-react-shopify\app\routes\product.tsx
```

### Assets
```
C:\xampp\htdocs\ecommerce-react-shopify\public\images\background-room.png
```

### Documentation
```
C:\xampp\htdocs\ecommerce-react-shopify\docs\ENHANCEMENT-PLAN.md
C:\xampp\htdocs\ecommerce-react-shopify\docs\SESSION-LOG.md
C:\xampp\htdocs\ecommerce-react-shopify\CLAUDE.md
```

---

## Frame Types & CSS Classes

| Shopify Variant | FramePreview Class | FrameIcon Class |
|-----------------|-------------------|-----------------|
| Unframed | frame-unframed | frame-icon-unframed |
| Black Frame | frame-black | frame-icon-black |
| White Frame | frame-white | frame-icon-white |
| Natural Wood | frame-natural | frame-icon-natural |

---

## 3D Bevel Technique (FramePreview)

FramePreview uses CSS `border-color` with 4 values for 3D effect:
```css
/* border-color: top right bottom left */
/* Top/left = lighter (highlight), Bottom/right = darker (shadow) */

.frame-outer.frame-black .frame-mat-layer {
  border-color: #3a3a3a #0a0a0a #0a0a0a #3a3a3a;
}

.frame-outer.frame-white .frame-mat-layer {
  border-color: #ffffff #e0e0e0 #d0d0d0 #f5f5f5;
}

.frame-outer.frame-natural .frame-mat-layer {
  border-color: #d4b896 #9a7040 #8a6030 #c4a886;
}
```

---

## FrameIcon Structure

```tsx
// C:\xampp\htdocs\ecommerce-react-shopify\src\components\product\FrameIcon.tsx

<button className="frame-icon-button selected">
  <div className="frame-icon frame-icon-black">
    <div className="frame-icon-h" />   {/* Horizontal bar (top) */}
    <div className="frame-icon-v" />   {/* Vertical bar (left) */}
    <div className="frame-icon-artwork" />  {/* White artwork area */}
  </div>
  <span className="frame-icon-label">Black</span>
</button>
```

---

## Commands

```bash
# Navigate to project
cd C:\xampp\htdocs\ecommerce-react-shopify

# Start dev server
npm run dev
# Visit: http://localhost:5173/product/high-cliff-coast-of-maine

# Run tests
npm run test

# Type check
npm run typecheck

# Build
npm run build

# Git status
git status
git log --oneline -10
```

---

## Test Product URLs

```
http://localhost:5173/product/high-cliff-coast-of-maine
http://localhost:5173/product/snap-the-whip
http://localhost:5173/product/the-caress
```

---

## Recent Git History

```
adc69be docs: add session log and update enhancement plan
b9acc8c Revert "refactor(FrameIcon): use same border-color technique"
0de92fc refactor(FrameIcon): use same border-color technique as FramePreview
a390319 style(FrameIcon): add realistic 3D bevel effects to frame icons
d67c7ae fix(FrameIcon): white background, more specific CSS selectors
ec073d2 feat(FrameIcon): add visual L-shaped frame corner icons for selector
9b1475a fix(FramePreview): restructure Frame View to match Room View approach
6c35fbe feat(FramePreview): add room view toggle with living room mockup
e32e668 feat(ui): integrate FramePreview into product page
1d34d16 feat(ui): create FramePreview component
```

---

## Architecture: "Grow Outward" Pattern

Both Frame View and Room View use this approach:
1. **Artwork is anchor** - fixed size, never changes
2. **Mat layer** - `position: absolute; inset: calc(-1 * var(--mat-width))`
3. **Frame** - border on mat layer with 4-value border-color for 3D
4. **Result** - Selecting a frame doesn't shrink artwork, frame grows outward

---

## What Was Attempted (Reverted)

Commit `0de92fc` tried using the same `border-color` technique in FrameIcon:
```css
.frame-icon.frame-icon-black .frame-icon-h,
.frame-icon.frame-icon-black .frame-icon-v {
  background: #1a1a1a;
  border-style: solid;
  border-width: 2px;
  border-color: #3a3a3a #0a0a0a #0a0a0a #3a3a3a;
}
```
This was reverted (`b9acc8c`) to come back to later.

---

## Current FrameIcon CSS (Gradient Approach)

Currently uses linear gradients with box-shadow for 3D effect:
```css
.frame-icon.frame-icon-black .frame-icon-h {
  background: linear-gradient(180deg,
    #4a4a4a 0%,
    #2a2a2a 15%,
    #1a1a1a 50%,
    #0a0a0a 85%,
    #000000 100%
  );
  box-shadow:
    inset 1px 1px 0 rgba(255,255,255,0.15),
    inset -1px -1px 0 rgba(0,0,0,0.4),
    inset 0 -2px 3px rgba(0,0,0,0.3);
}
```

---

## Pending Tasks

1. **FrameIcon refinement** - Match FramePreview styling
2. **Phase 4: Polish**
   - Responsive checks
   - Cross-browser testing
   - Lighthouse verification
   - Update screenshots
   - Update README

---

## MCP Servers Available

- **shopify** - Shopify Admin API
- **playwright** - Browser automation for testing
- **github** - Repo operations

---

## Credentials Location

```
C:\xampp\htdocs\PRIVATE\CREDENTIALS-MASTER.md
```

---

## Quick Start

1. Read this file
2. Read `C:\xampp\htdocs\ecommerce-react-shopify\CLAUDE.md`
3. Start dev server: `npm run dev`
4. Visit: `http://localhost:5173/product/high-cliff-coast-of-maine`
5. Look at Frame selector icons, compare to Frame Preview
6. Refine CSS in `app/app.css` lines 480-700
