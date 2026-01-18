# Changelog: SSR-Safe Cart Persistence

## Decision Log

This document captures the engineering decisions, iterations, and rationale behind the SSR-safe cart persistence implementation.

---

## [2.0.0] - 2026-01-18

### Breaking Changes
- Cart localStorage format changed from `{ items: [...] }` to `[...]`
- Backward compatibility maintained via custom deserializer

### Added
- `src/lib/createPersistedStore.ts` - Generic external store factory
- Custom serialization/deserialization support
- Cross-tab synchronization via StorageEvent API
- Legacy format migration in CartContext

### Changed
- **CartContext.tsx** - Complete rewrite using `useSyncExternalStore`
- Separated persisted state (items) from transient state (isOpen)
- Removed `useState`/`useReducer` pattern for external store pattern

### Removed
- `loadCartFromStorage()` helper function
- `useEffect`-based initialization pattern

### Technical Details

#### Decision: External Store Pattern
**Context**: React 18 introduced `useSyncExternalStore` for external state synchronization.

**Options Considered**:
1. `useState` + `useEffect` - Simple but causes content flash
2. `suppressHydrationWarning` - Masks problem, doesn't solve
3. Cookies - Adds server complexity
4. `useSyncExternalStore` - React's official solution

**Decision**: Implement `useSyncExternalStore` pattern.

**Rationale**:
- Official React recommendation for external state
- Handles server/client snapshot differentiation
- Prevents tearing in concurrent mode
- Clean separation of concerns

---

## [1.1.0] - 2026-01-18 (Superseded)

### Added
- `useEffect`-based cart loading to fix hydration errors

### Technical Details

#### Decision: useEffect Loading Pattern
**Context**: Initial attempt to fix React hydration errors #418/#423.

**Implementation**:
```typescript
const [state, dispatch] = useReducer(cartReducer, initialCartState)

useEffect(() => {
  const saved = loadCartFromStorage()
  if (saved.length > 0) {
    dispatch({ type: 'LOAD_CART', payload: saved })
  }
}, [])
```

**Outcome**:
- Fixed hydration errors
- Introduced flash of empty cart content
- User feedback: "is this senior developer architecture?"

**Learning**: Quick fixes that technically work may not meet production quality standards. The proper solution requires understanding React's hydration model.

---

## [1.0.0] - Initial Implementation

### Original Problem
- Cart state initialized from localStorage during render
- Server returns empty cart (no localStorage access)
- Client returns populated cart
- React detects HTML mismatch → Error #418/#423

### Original Code Pattern
```typescript
const initialCartState: CartState = {
  items: loadCartFromStorage(),  // ← Causes hydration mismatch
  isOpen: false
}
```

---

## Migration Guide

### From v1.x to v2.0

No action required. The custom deserializer automatically handles legacy format:

```typescript
// Automatically migrates:
// Old: { items: [{ key: '...', ... }] }
// New: [{ key: '...', ... }]

function deserializeCartItems(stored: string): CartItem[] {
  const parsed = JSON.parse(stored)

  // Handle legacy format
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
    return parsed.items
  }

  // Handle new format
  if (Array.isArray(parsed)) {
    return parsed
  }

  return []
}
```

---

## Error Resolution Log

### TypeError: t.reduce is not a function

**Date**: 2026-01-18
**Environment**: Production (Vercel)
**Severity**: Critical (blocked cart functionality)

**Root Cause Analysis**:
1. New store expected array format: `[...]`
2. Existing localStorage had object format: `{ items: [...] }`
3. `items.reduce()` called on object instead of array

**Stack Trace**:
```
TypeError: t.reduce is not a function
    at CartProvider (CartContext.tsx:207)
```

**Resolution**:
Added custom deserializer to `createPersistedStore` options:
```typescript
const cartItemsStore = createPersistedStore<CartItem[]>(CART_STORAGE_KEY, [], {
  deserialize: deserializeCartItems
})
```

**Prevention**:
- Always consider existing data formats when changing storage schemas
- Implement migration logic in deserializers
- Test with production data snapshots

---

### React Hydration Error #418

**Date**: 2026-01-18
**Environment**: Development + Production
**Severity**: High (user-visible console errors)

**Error Message**:
```
Hydration failed because the initial UI does not match what was rendered on the server.
```

**Root Cause Analysis**:
1. Server rendered cart with 0 items
2. Client rendered cart with N items from localStorage
3. HTML mismatch detected by React

**Resolution**:
Implemented `useSyncExternalStore` with separate server/client snapshots:
```typescript
const items = useSyncExternalStore(
  cartItemsStore.subscribe,
  cartItemsStore.getSnapshot,      // Client: reads localStorage
  cartItemsStore.getServerSnapshot // Server: returns []
)
```

---

## Lessons Learned

### 1. React's Hydration Model
The server and client must produce identical HTML on first render. Any browser-only API access must be deferred or handled via React's official patterns.

### 2. Data Migration is Critical
Production systems accumulate data in various formats. Always implement backward-compatible deserialization when changing storage schemas.

### 3. Quick Fixes vs Proper Architecture
`useEffect` loading "works" but introduces UX issues. The proper solution (`useSyncExternalStore`) requires more upfront investment but delivers production-quality results.

### 4. Reusability Pays Off
Extracting `createPersistedStore` as a generic factory means future persistence needs (user preferences, UI state, etc.) can reuse the same battle-tested pattern.

---

## Version History Summary

| Version | Date | Status | Key Change |
|---------|------|--------|------------|
| 2.0.0 | 2026-01-18 | **Current** | useSyncExternalStore pattern |
| 1.1.0 | 2026-01-18 | Superseded | useEffect loading |
| 1.0.0 | Pre-2026 | Initial | Direct localStorage read |
