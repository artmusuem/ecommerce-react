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

<!-- Claude Code updates this section as work progresses -->

| Date | Phase | Changes Made | Tests Status |
|------|-------|--------------|--------------|
| | | | |

---

## Notes

<!-- Add any discoveries, decisions, or blockers here -->
