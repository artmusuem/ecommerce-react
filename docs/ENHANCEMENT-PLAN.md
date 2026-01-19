# UI Enhancement Plan

## Goal
Transform Gallery Store from "working demo" to "portfolio showpiece" with premium UI that makes developers ask "how did you build this?"

## Reference
- **Live site:** https://ecommerce-react-shopify.vercel.app
- **Inspiration:** https://hikariandink.com

---

## Phase 1: Typography & Spacing

### Tasks
- [ ] Add premium font pairing (serif headlines, clean body)
- [ ] Configure fonts in `app/root.tsx` or CSS
- [ ] Increase whitespace throughout layouts
- [ ] Refine product grid spacing
- [ ] Update color palette for sophistication
- [ ] Review: Compare before/after screenshots

### Files to Modify
- `app/root.tsx` - Font imports, global styles
- `src/index.css` or Tailwind config - Typography scale
- `app/routes/_index.tsx` - Homepage layout spacing
- Product grid components - Card spacing

### Acceptance Criteria
- [ ] Fonts load without FOUT (flash of unstyled text)
- [ ] Lighthouse performance stays 90+
- [ ] All existing tests pass

---

## Phase 2: Animations & Micro-interactions

### Tasks
- [ ] Smooth page transitions (fade or slide)
- [ ] Product card hover effects (subtle lift/shadow)
- [ ] Cart drawer slide animation
- [ ] Loading states with skeleton or shimmer
- [ ] Image fade-in on load
- [ ] Review: Test on mobile devices

### Files to Modify
- Navigation/layout components - Page transitions
- `ProductCard` component - Hover effects
- Cart drawer component - Slide animation
- Image components - Fade-in effect

### Acceptance Criteria
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No jank or dropped frames
- [ ] All existing tests pass

---

## Phase 3: Frame Preview Feature

### Tasks
- [ ] Create `FramePreview` component
- [ ] Show artwork with selected frame overlaid
- [ ] Real-time frame color/style switching
- [ ] Size visualization (relative proportions)
- [ ] Integration with variant selector on product page
- [ ] Write tests for new component
- [ ] Review: User flow from selection to cart

### Files to Create/Modify
- `src/components/product/FramePreview.tsx` - New component
- `app/routes/products.$handle.tsx` - Integration
- `src/components/product/VariantSelector.tsx` - Connect to preview

### Acceptance Criteria
- [ ] Preview updates instantly on variant change
- [ ] Works on mobile (responsive)
- [ ] Accessible (proper ARIA labels)
- [ ] New tests written and passing

---

## Phase 4: Polish & Documentation

### Tasks
- [ ] Final responsive checks (mobile, tablet, desktop)
- [ ] Lighthouse score verification (maintain 95+)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Update screenshots in `docs/screenshots/`
- [ ] Update README with new features
- [ ] Final commit and push

### Acceptance Criteria
- [ ] All 185+ tests passing
- [ ] Lighthouse Performance 90+, Accessibility 95+
- [ ] No console errors or warnings
- [ ] README reflects current state

---

## Progress Log

| Date | Phase | Changes Made | Tests Status |
|------|-------|--------------|--------------|
| Jan 2026 | 1 | Typography & spacing enhancements | ✅ Passing |
| Jan 2026 | 2 | Page animations, hover effects | ✅ Passing |
| Jan 2026 | 3 | FramePreview component with Frame/Room view | ✅ Passing |
| Jan 2026 | 3 | FrameIcon L-shaped corner icons | ✅ Passing |
| Jan 18 | 3 | 3D bevel effects on frame icons | ✅ Passing |

---

## Current Status

### Completed
- [x] Phase 1: Typography & Spacing
- [x] Phase 2: Animations & Micro-interactions
- [x] Phase 3: FramePreview component (Frame View + Room View)
- [x] Phase 3: FrameIcon visual selector icons

### In Progress
- [ ] Phase 3: Refine FrameIcon to match FramePreview styling exactly
- [ ] Phase 4: Final polish and documentation

### Key Decision Pending
**FrameIcon styling approach:** Currently uses CSS gradients for 3D bevel. Alternative approach is to use the same `border-color` 4-value technique as FramePreview for visual consistency.

---

## Notes

- FramePreview uses `border-color: top right bottom left` for 3D bevel (e.g., `#3a3a3a #0a0a0a #0a0a0a #3a3a3a` for black)
- FrameIcon uses linear gradients which look slightly different
- Room mockup background: `public/images/background-room.png`
- See `docs/SESSION-LOG.md` for detailed continuation notes
