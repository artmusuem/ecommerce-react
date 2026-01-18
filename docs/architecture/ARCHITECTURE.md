# SSR-Safe State Persistence Architecture

## Overview

This document describes the architectural approach for implementing SSR-safe localStorage persistence in a React 18+ application with server-side rendering. The solution eliminates hydration mismatches while maintaining seamless state persistence across page refreshes and browser tabs.

## Problem Statement

### The Hydration Challenge

Server-side rendering (SSR) generates HTML on the server that must match the initial client render byte-for-byte. When state depends on browser APIs like `localStorage`, a fundamental mismatch occurs:

```
Server render:  cart = []           (no localStorage access)
Client render:  cart = [3 items]    (reads from localStorage)
Result:         React Error #418/#423 - Hydration mismatch
```

### Common Anti-Patterns

| Approach | Issue |
|----------|-------|
| `typeof window !== 'undefined'` checks | Still causes mismatch during hydration |
| `useEffect` for loading | Flash of empty content, poor UX |
| `suppressHydrationWarning` | Masks the problem, doesn't solve it |
| Cookies for state | Adds server complexity, cookie size limits |

## Solution Architecture

### External Store Pattern with `useSyncExternalStore`

React 18 introduced `useSyncExternalStore` specifically for this use case. It provides:

1. **Separate server and client snapshots** - Different return values for SSR vs client
2. **Tearing prevention** - Consistent reads during concurrent rendering
3. **Automatic subscription management** - React handles re-renders on state change

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  CartProvider                                                    │
│  ├── useSyncExternalStore(cartItemsStore)  ← Persisted state    │
│  ├── useSyncExternalStore(isOpenStore)     ← Transient state    │
│  └── dispatch(action)                      ← State mutations    │
├─────────────────────────────────────────────────────────────────┤
│                        Store Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  createPersistedStore<T>                                         │
│  ├── getSnapshot()        → T              (client value)        │
│  ├── getServerSnapshot()  → T              (initial value)       │
│  ├── subscribe(listener)  → unsubscribe    (React subscription) │
│  └── setState(value)      → void           (update + persist)   │
├─────────────────────────────────────────────────────────────────┤
│                       Persistence Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  localStorage                                                    │
│  ├── getItem(key)                                               │
│  ├── setItem(key, value)                                        │
│  └── StorageEvent (cross-tab sync)                              │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Server-Side Render
```
1. React calls getServerSnapshot()
2. Returns initialValue (empty array)
3. Server generates HTML with empty cart
4. HTML sent to client
```

#### Client Hydration
```
1. React hydrates with getServerSnapshot() initially
2. HTML matches server (no mismatch)
3. React subscribes via subscribe()
4. getSnapshot() called, reads localStorage
5. If different, React schedules re-render
6. UI updates to show persisted cart
```

#### State Update
```
1. Component calls dispatch({ type: 'ADD_ITEM', ... })
2. dispatch calls cartItemsStore.setState(reducer)
3. setState updates cachedValue
4. setState writes to localStorage
5. setState calls emitChange()
6. All subscribed components re-render
```

## Key Design Decisions

### 1. Separation of Persisted vs Transient State

```typescript
// Persisted to localStorage - survives refresh
const cartItemsStore = createPersistedStore<CartItem[]>(...)

// In-memory only - resets on refresh
let cartIsOpen = false
```

**Rationale**: Not all state should persist. UI state like "is cart drawer open" should reset on page load for consistent UX.

### 2. Lazy Initialization

```typescript
function getSnapshot(): T {
  initializeFromStorage()  // Only runs once, client-side
  return cachedValue
}
```

**Rationale**: Defer localStorage read until actually needed. Prevents unnecessary work during SSR.

### 3. Custom Serialization Support

```typescript
createPersistedStore<CartItem[]>(key, [], {
  deserialize: deserializeCartItems  // Handle legacy formats
})
```

**Rationale**: Production systems often need to migrate data formats. Custom deserializers enable backward compatibility.

### 4. Cross-Tab Synchronization

```typescript
window.addEventListener('storage', handleStorageChange)
```

**Rationale**: Users expect cart state to sync across tabs. The Storage event API provides this automatically.

## File Structure

```
src/
├── lib/
│   └── createPersistedStore.ts    # Generic store factory
├── context/
│   └── CartContext.tsx            # Cart-specific implementation
└── types/
    └── index.ts                   # Type definitions
```

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Initial render | O(1) | Returns cached/initial value |
| localStorage read | O(1) | Single read, then cached |
| State update | O(n) | n = number of subscribers |
| Cross-tab sync | O(n) | Triggered by StorageEvent |

## Security Considerations

1. **No sensitive data in localStorage** - Cart items are non-sensitive product references
2. **XSS vulnerability** - localStorage is accessible to any script; ensure proper CSP headers
3. **Storage limits** - localStorage has ~5MB limit; implement cleanup for large datasets

## Testing Strategy

```typescript
// Unit tests for store factory
describe('createPersistedStore', () => {
  it('returns initialValue from getServerSnapshot')
  it('reads localStorage on first getSnapshot')
  it('notifies subscribers on setState')
  it('syncs across tabs via StorageEvent')
})

// Integration tests for cart
describe('CartContext', () => {
  it('hydrates without mismatch errors')
  it('persists items across refresh')
  it('handles legacy data format migration')
})
```

## References

- [React 18 useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [React Hydration Errors Explained](https://react.dev/errors/418)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
