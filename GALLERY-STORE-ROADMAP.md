# Gallery Store - Development Roadmap & Handoff

## Last Successful Deployment
- **Date:** January 1, 2026
- **Commit:** `0519fc6` (revert: Restore index.css to last working version)
- **Live URL:** https://ecommerce-react-beta-woad.vercel.app
- **Status:** ✅ Working

## Repository
- **GitHub:** https://github.com/artmusuem/ecommerce-react
- **Auto-deploy:** Vercel (triggers on push to main)

---

## Current State (What Works)

### Product Page Features
- ✅ Image display with Cloudinary CDN
- ✅ Size selector (dropdown): 8×10, 11×14, 16×20, 24×30
- ✅ Frame selector (dropdown): Black, Natural, Walnut, Gold, White
- ✅ Dynamic pricing based on selections
- ✅ Add to cart functionality
- ✅ Lightbox zoom on image click
- ✅ Basic frame color preview (colored border around image)

### Frame Display (Current Implementation)
```tsx
// In Product.tsx - lines ~215-230
<div 
  className="relative transition-all duration-300 cursor-zoom-in group mx-auto w-fit rounded-lg overflow-hidden p-5"
  style={{ 
    backgroundColor: frame?.color,
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.2)'
  }}
>
  <div className="bg-white p-1 shadow-inner relative">
    <img ... />
  </div>
</div>
```

This creates a simple colored padding around the image - functional but not realistic 3D.

---

## Planned Enhancements

### Phase 1: Enhanced Frame Preview (NEXT)
**Goal:** Make frame preview look more realistic with 3D depth

**Approach - CSS Enhancement (Minimal Change)**
Add CSS classes to index.css for 3D bevel effect:
```css
.frame-3d-black {
  box-shadow: 
    4px 5px 15px rgba(0,0,0,0.4),
    inset 0 0 20px rgba(0,0,0,0.15);
  border: 3px solid;
  border-color: #3a3a3a #151515 #151515 #3a3a3a; /* 3D bevel */
}
```

**Alternative - Cloudinary Borders**
Cloudinary can add borders via URL transform:
```
https://res.cloudinary.com/dh4qwuvuo/image/fetch/w_500,bo_25px_solid_rgb:1a1a1a/[image-url]
```
This was tested and works ✅

**Files to Change:**
- `src/index.css` - Add frame CSS classes (CSS only, low risk)
- `src/pages/Product.tsx` - Apply CSS classes to frame div (minimal change)

### Phase 2: Room Mockup View
**Goal:** Show framed art on a wall for context

**Approach:**
- Add "Room View" toggle button
- CSS-only room background (gradient wall, furniture silhouette)
- Scale down framed art and position on wall

**Files to Change:**
- `src/index.css` - Room mockup CSS
- `src/pages/Product.tsx` - View toggle state and conditional render

### Phase 3: Button Selectors (UX Improvement)
**Goal:** Replace dropdowns with clickable buttons for size/frame

**Current:** `<select>` dropdowns
**Target:** Button grid like professional stores (Minted, Society6)

---

## Development Rules

1. **ONE file at a time** - Don't batch changes
2. **Test before push** - Verify syntax, check for TypeScript errors
3. **Verify deployment** - Wait for Vercel, check site works
4. **Meaningful commits** - Describe what changed and why
5. **Update this doc** - After each successful deployment

---

## Quick Recovery

If deployment fails, revert to last working commit:

```bash
# Get last working version
curl -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3.raw" \
  "https://api.github.com/repos/artmusuem/ecommerce-react/contents/src/pages/Product.tsx?ref=0519fc6" \
  > Product-working.tsx

# Push revert (get current SHA first, then push)
```

---

## File Reference

| File | Purpose | Last Good Commit |
|------|---------|------------------|
| `src/pages/Product.tsx` | Product detail page | `0519fc6` |
| `src/index.css` | Global styles | `0519fc6` |
| `src/data/products.ts` | Frame/size definitions | unchanged |

---

## Frame Options (from products.ts)

```typescript
export const frames: Frame[] = [
  { id: "black", name: "Matte Black", priceAdd: 0, color: "#1a1a1a" },
  { id: "natural", name: "Natural Oak", priceAdd: 15, color: "#c4a574" },
  { id: "walnut", name: "Rich Walnut", priceAdd: 20, color: "#5c4033" },
  { id: "gold", name: "Antique Gold", priceAdd: 25, color: "#d4af37" },
  { id: "white", name: "Gallery White", priceAdd: 10, color: "#f5f5f5" }
]
```

---

## Milestones Completed

| Date | Milestone | Commit |
|------|-----------|--------|
| Dec 2024 | Basic Gallery Store with cart | various |
| Dec 25 | Supabase integration attempt | `7d5ec97` |
| Dec 26 | Reverted to JSON-only (stable) | `4fdde28` |
| Dec 31 | Fixed corrupted artist JSON files | `3a17bb0` |
| Jan 1 | Attempted 3D frames (failed) | `470a950` |
| Jan 1 | Reverted to stable | `0519fc6` ✅ |

---

*Last Updated: January 1, 2026*
