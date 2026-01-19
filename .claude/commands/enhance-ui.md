# UI Enhancement Workflow

Execute a guided enhancement phase for Gallery Store.

## Phase: $ARGUMENTS

### Before Starting
1. Read `CLAUDE.md` for project context
2. Read `docs/ENHANCEMENT-PLAN.md` for the full checklist
3. Run `npm run typecheck` to ensure clean baseline

### Workflow
1. Identify the specific tasks for this phase from ENHANCEMENT-PLAN.md
2. Read current implementation of relevant components
3. Make changes incrementally - one component at a time
4. After each change:
   - Run `npm run typecheck`
   - Run relevant tests: `npm test -- [component].test`
5. Commit when tests pass: `git commit -m "feat(ui): [description]"`
6. Update the checklist in ENHANCEMENT-PLAN.md

### Phase Reference

**Phase 1 - Typography & Spacing:**
- Files: `app/root.tsx`, `src/index.css`, component styles
- Goal: Premium fonts, increased whitespace, refined grid

**Phase 2 - Animations:**
- Files: Components with hover states, transitions
- Goal: Smooth page transitions, micro-interactions

**Phase 3 - Frame Preview:**
- Files: New `FramePreview` component, product page integration
- Goal: Show artwork with selected frame overlaid

**Phase 4 - Polish:**
- Files: All touched components
- Goal: Final responsive checks, Lighthouse verification

### Critical Reminders
- 185+ tests must stay passing
- Preserve all existing functionality
- Run typecheck after every file change
- Commit after each working change

### Reference Links
- Live demo: https://ecommerce-react-shopify.vercel.app
- Inspiration: https://hikariandink.com
