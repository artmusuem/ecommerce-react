# Gallery Store - Development Roadmap & Handoff

## Last Successful Deployment
- **Date:** January 1, 2026
- **Commit:** `e5a8230` (feat: Add 3D bevel CSS class to frame preview)
- **Live URL:** https://ecommerce-react-beta-woad.vercel.app
- **Status:** ✅ Working - 3D frame bevels active

---

## What's Currently Working

### Product Page Features
- ✅ Image display with Cloudinary CDN
- ✅ Size selector: 8×10, 11×14, 16×20, 24×30
- ✅ Frame selector: Black, Natural, Walnut, Gold, White
- ✅ Dynamic pricing based on selections
- ✅ Add to cart functionality
- ✅ Lightbox zoom on image click
- ✅ **3D frame bevel effect** (NEW - commit e5a8230)

### 3D Frame CSS Classes (index.css)
```css
.frame-preview.frame-black {
  border: 4px solid;
  border-color: #3a3a3a #0a0a0a #0a0a0a #3a3a3a;
}
/* Similar for: frame-white, frame-natural, frame-walnut, frame-gold */
```

---

## Repository
- **GitHub:** https://github.com/artmusuem/ecommerce-react
- **Auto-deploy:** Vercel (triggers on push to main)

---

## Planned Enhancements

### Phase 1: Enhanced Frame Preview ✅ COMPLETE
- [x] Add 3D bevel CSS classes (commit d3a1d83)
- [x] Apply classes to Product.tsx (commit e5a8230)

### Phase 2: Room Mockup View (NEXT)
- [ ] Add "Room View" toggle button
- [ ] CSS room background (wall gradient, furniture)
- [ ] Position framed art on wall

### Phase 3: Button Selectors
- [ ] Replace size dropdown with button group
- [ ] Replace frame dropdown with visual swatches

---

## Development Rules

1. **ONE file at a time** - Don't batch changes
2. **Test before push** - Verify syntax
3. **Verify deployment** - Wait for Vercel, check site works
4. **Meaningful commits** - Describe what changed
5. **Update this doc** - After each successful deployment

---

## Quick Recovery

If deployment fails, revert to last working commit:
```bash
# Last known good: e5a8230
git revert HEAD
```

---

## Milestones Completed

| Date | Milestone | Commit |
|------|-----------|--------|
| Dec 2024 | Basic Gallery Store with cart | various |
| Dec 26 | Reverted to JSON-only (stable) | `4fdde28` |
| Dec 31 | Fixed corrupted artist JSON | `3a17bb0` |
| Jan 1 | Failed 3D frame attempt | `470a950` |
| Jan 1 | Reverted to stable | `0519fc6` |
| Jan 1 | Added roadmap doc | `d4c90f5` |
| Jan 1 | Added 3D frame CSS | `d3a1d83` |
| Jan 1 | **Applied 3D frames** | `e5a8230` ✅ |

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

## Files Reference

| File | Purpose | Last Good Commit |
|------|---------|------------------|
| `src/pages/Product.tsx` | Product detail page | `e5a8230` |
| `src/index.css` | Global styles + 3D frames | `d3a1d83` |
| `src/data/products.ts` | Frame/size definitions | unchanged |
| `GALLERY-STORE-ROADMAP.md` | This document | current |

---

*Last Updated: January 1, 2026*
