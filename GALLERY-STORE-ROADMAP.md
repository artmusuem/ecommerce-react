# Gallery Store - Development Roadmap & Handoff

## Last Successful Deployment
- **Date:** January 1, 2026
- **Commit:** `28323c1` (feat: Add Room View toggle with wall mockup display)
- **Live URL:** https://ecommerce-react-beta-woad.vercel.app
- **Status:** ✅ Working - 3D frames + Room View

---

## What's Currently Working

### Product Page Features
- ✅ Image display with Cloudinary CDN
- ✅ Size selector: 8×10, 11×14, 16×20, 24×30
- ✅ Frame selector: Black, Natural, Walnut, Gold, White
- ✅ Dynamic pricing based on selections
- ✅ Add to cart functionality
- ✅ Lightbox zoom on image click
- ✅ **3D frame bevel effect** (commit e5a8230)
- ✅ **Room View toggle** (commit 28323c1) - NEW!

### View Modes
| Mode | Description |
|------|-------------|
| Frame Preview | Close-up of framed art with 3D bevels |
| Room View | Art displayed on wall with furniture context |

---

## Repository
- **GitHub:** https://github.com/artmusuem/ecommerce-react
- **Auto-deploy:** Vercel (triggers on push to main)

---

## Planned Enhancements

### Phase 1: Enhanced Frame Preview ✅ COMPLETE
- [x] Add 3D bevel CSS classes (commit d3a1d83)
- [x] Apply classes to Product.tsx (commit e5a8230)

### Phase 2: Room Mockup View ✅ COMPLETE
- [x] Add room mockup CSS (commit 5a86fdd)
- [x] Add view toggle buttons (commit 28323c1)
- [x] Room background with furniture

### Phase 3: Button Selectors (NEXT)
- [ ] Replace size dropdown with button group
- [ ] Replace frame dropdown with visual swatches

### Phase 4: Commerce Hub Integration
- [ ] Sync products from Supabase
- [ ] Push frame/size variants to Shopify

---

## Development Rules

1. **ONE file at a time** - Don't batch changes
2. **CSS first** - Add classes without using them, verify deploy
3. **Then TSX** - Apply classes, verify deploy
4. **Meaningful commits** - Describe what changed
5. **Update this doc** - After each successful deployment

---

## Quick Recovery

Last known good commits:
- `28323c1` - Room View (current)
- `e5a8230` - 3D frames only
- `0519fc6` - Pre-3D frames (stable baseline)

---

## Milestones Completed

| Date | Milestone | Commit |
|------|-----------|--------|
| Dec 2024 | Basic Gallery Store with cart | various |
| Dec 26 | Reverted to JSON-only (stable) | `4fdde28` |
| Jan 1 | Added 3D frame CSS | `d3a1d83` |
| Jan 1 | Applied 3D frames | `e5a8230` |
| Jan 1 | Added room mockup CSS | `5a86fdd` |
| Jan 1 | **Room View toggle** | `28323c1` ✅ |

---

## Files Reference

| File | Purpose | Last Good Commit |
|------|---------|------------------|
| `src/pages/Product.tsx` | Product detail + view toggle | `28323c1` |
| `src/index.css` | 3D frames + room mockup CSS | `5a86fdd` |
| `src/data/products.ts` | Frame/size definitions | unchanged |

---

*Last Updated: January 1, 2026*
