# SSR-Safe State Persistence: A Complete Guide

## Introduction

This guide walks through the implementation of SSR-safe localStorage persistence in React 18+. By the end, you'll understand:

1. Why hydration errors occur with browser APIs
2. How `useSyncExternalStore` solves the problem
3. How to build a reusable persistence layer
4. How to handle data migrations gracefully

## Prerequisites

- React 18+ (for `useSyncExternalStore`)
- TypeScript (recommended)
- Understanding of React Context and hooks
- Basic SSR concepts

---

## Part 1: Understanding the Problem

### What is Hydration?

When React performs server-side rendering:

1. **Server**: React renders components to HTML string
2. **Network**: HTML sent to browser
3. **Client**: Browser displays HTML immediately (fast first paint)
4. **Hydration**: React "attaches" to existing HTML, adding interactivity

During hydration, React expects the client render to produce **identical** HTML to what the server produced.

### The localStorage Problem

```typescript
// This causes hydration errors in SSR
const [cart, setCart] = useState(() => {
  const saved = localStorage.getItem('cart')
  return saved ? JSON.parse(saved) : []
})
```

**Why it fails:**
- Server: `localStorage` doesn't exist → returns `[]`
- Client: `localStorage` has data → returns `[item1, item2]`
- React: HTML mismatch detected → Error #418

### Common Mistakes

#### Mistake 1: Window checks don't help
```typescript
// Still causes mismatch!
const [cart, setCart] = useState(() => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('cart') || '[]')
  }
  return []
})
```

The check runs during render, so client still returns different value than server.

#### Mistake 2: useEffect causes flash
```typescript
// Works, but poor UX
const [cart, setCart] = useState([])

useEffect(() => {
  const saved = localStorage.getItem('cart')
  if (saved) setCart(JSON.parse(saved))
}, [])
```

User sees empty cart, then items "pop in" after hydration.

---

## Part 2: The Solution - External Store Pattern

### Understanding useSyncExternalStore

React 18 introduced `useSyncExternalStore` for subscribing to external data sources:

```typescript
const value = useSyncExternalStore(
  subscribe,           // How to subscribe to changes
  getSnapshot,         // Get current value (client)
  getServerSnapshot    // Get value for SSR (optional)
)
```

The key insight: **separate snapshots for server and client**.

### How It Solves Hydration

```
Server Render:
  getServerSnapshot() → []
  HTML: <div>Cart: 0 items</div>

Client Hydration:
  getServerSnapshot() → []  (matches server!)
  HTML: <div>Cart: 0 items</div>  ✓ No mismatch

After Hydration:
  getSnapshot() → [item1, item2]
  React schedules re-render
  HTML: <div>Cart: 2 items</div>
```

React handles the transition internally - no errors, no flash.

---

## Part 3: Building the Store Factory

### Step 1: Define the Interface

```typescript
// src/lib/createPersistedStore.ts

type Listener = () => void

export interface PersistedStore<T> {
  getSnapshot: () => T
  getServerSnapshot: () => T
  subscribe: (listener: Listener) => () => void
  setState: (value: T | ((prev: T) => T)) => void
}
```

### Step 2: Implement the Factory

```typescript
export function createPersistedStore<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
): PersistedStore<T> {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options ?? {}

  // Subscription management
  const listeners = new Set<Listener>()

  // In-memory cache
  let cachedValue: T = initialValue
  let isInitialized = false
```

### Step 3: Lazy Initialization

```typescript
  function initializeFromStorage(): void {
    // Skip on server
    if (typeof window === 'undefined') return
    // Only initialize once
    if (isInitialized) return

    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        cachedValue = deserialize(stored)
      }
    } catch (error) {
      console.error(`Failed to read "${key}":`, error)
    }
    isInitialized = true
  }
```

**Key insight**: We defer localStorage access until `getSnapshot` is called on the client.

### Step 4: Implement Snapshots

```typescript
  function getSnapshot(): T {
    initializeFromStorage()
    return cachedValue
  }

  function getServerSnapshot(): T {
    return initialValue  // Always return initial value for SSR
  }
```

### Step 5: Subscription with Cross-Tab Sync

```typescript
  function subscribe(listener: Listener): () => void {
    listeners.add(listener)

    // Sync across browser tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          cachedValue = deserialize(event.newValue)
          emitChange()
        } catch (error) {
          console.error(`Failed to parse storage event:`, error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }

    // Return unsubscribe function
    return () => {
      listeners.delete(listener)
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }

  function emitChange(): void {
    listeners.forEach(listener => listener())
  }
```

### Step 6: State Updates

```typescript
  function setState(value: T | ((prev: T) => T)): void {
    initializeFromStorage()

    // Support functional updates
    const nextValue = typeof value === 'function'
      ? (value as (prev: T) => T)(cachedValue)
      : value

    cachedValue = nextValue

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, serialize(nextValue))
      } catch (error) {
        console.error(`Failed to write "${key}":`, error)
      }
    }

    emitChange()
  }

  return { getSnapshot, getServerSnapshot, subscribe, setState }
}
```

---

## Part 4: Implementing CartContext

### Step 1: Create the Store Instance

```typescript
// src/context/CartContext.tsx

import { createPersistedStore } from '../lib/createPersistedStore'

const CART_STORAGE_KEY = 'gallery-store-cart'

const cartItemsStore = createPersistedStore<CartItem[]>(
  CART_STORAGE_KEY,
  [],  // Initial value (empty cart)
)
```

### Step 2: Handle Transient State Separately

Some state shouldn't persist (like UI state):

```typescript
// Not persisted - resets on page load
let cartIsOpen = false
const isOpenListeners = new Set<() => void>()

function subscribeToIsOpen(listener: () => void): () => void {
  isOpenListeners.add(listener)
  return () => isOpenListeners.delete(listener)
}

function getIsOpenSnapshot(): boolean {
  return cartIsOpen
}

function getIsOpenServerSnapshot(): boolean {
  return false  // Cart drawer always closed on server
}
```

### Step 3: Use in Provider Component

```typescript
export function CartProvider({ children }: { children: ReactNode }) {
  // Subscribe to persisted items
  const items = useSyncExternalStore(
    cartItemsStore.subscribe,
    cartItemsStore.getSnapshot,
    cartItemsStore.getServerSnapshot
  )

  // Subscribe to transient UI state
  const isOpen = useSyncExternalStore(
    subscribeToIsOpen,
    getIsOpenSnapshot,
    getIsOpenServerSnapshot
  )

  // Dispatch function
  const dispatch = useCallback((action: CartAction) => {
    switch (action.type) {
      case 'ADD_ITEM':
        cartItemsStore.setState(prev => reduceCartItems(prev, action))
        setIsOpen(true)
        break
      // ... other actions
    }
  }, [])

  // ... rest of provider
}
```

---

## Part 5: Handling Data Migrations

### The Problem

Your localStorage format might change over time:

```typescript
// Old format (v1)
{ items: [{ id: '1', qty: 2 }] }

// New format (v2)
[{ key: '1-variant', productId: '1', quantity: 2 }]
```

### The Solution: Custom Deserializer

```typescript
function deserializeCartItems(stored: string): CartItem[] {
  const parsed = JSON.parse(stored)

  // Handle legacy format
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
    return parsed.items
  }

  // Handle current format
  if (Array.isArray(parsed)) {
    return parsed
  }

  // Fallback
  return []
}

const cartItemsStore = createPersistedStore<CartItem[]>(
  CART_STORAGE_KEY,
  [],
  { deserialize: deserializeCartItems }
)
```

---

## Part 6: Testing

### Unit Tests for Store Factory

```typescript
describe('createPersistedStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initialValue from getServerSnapshot', () => {
    const store = createPersistedStore('test', [1, 2, 3])
    expect(store.getServerSnapshot()).toEqual([1, 2, 3])
  })

  it('reads from localStorage on getSnapshot', () => {
    localStorage.setItem('test', '[4, 5, 6]')
    const store = createPersistedStore('test', [])
    expect(store.getSnapshot()).toEqual([4, 5, 6])
  })

  it('persists state changes', () => {
    const store = createPersistedStore('test', [])
    store.setState([1, 2])
    expect(localStorage.getItem('test')).toBe('[1,2]')
  })

  it('notifies subscribers on change', () => {
    const store = createPersistedStore('test', [])
    const listener = vi.fn()
    store.subscribe(listener)
    store.setState([1])
    expect(listener).toHaveBeenCalled()
  })
})
```

### Integration Tests for Hydration

```typescript
describe('CartContext hydration', () => {
  it('renders without hydration errors', async () => {
    // Pre-populate localStorage
    localStorage.setItem('gallery-store-cart', '[{"key":"1","quantity":2}]')

    const { container } = render(
      <CartProvider>
        <CartDisplay />
      </CartProvider>
    )

    // Should not throw hydration error
    // Should eventually show cart items
    await waitFor(() => {
      expect(container).toHaveTextContent('2 items')
    })
  })
})
```

---

## Summary

### Key Takeaways

1. **Never access browser APIs during render** for SSR apps
2. **useSyncExternalStore** provides separate server/client snapshots
3. **Lazy initialization** defers localStorage access to client
4. **Custom deserializers** enable backward-compatible migrations
5. **Separate persisted from transient state** for correct behavior

### Files to Reference

| File | Purpose |
|------|---------|
| `src/lib/createPersistedStore.ts` | Generic store factory |
| `src/context/CartContext.tsx` | Cart implementation |
| `src/types/index.ts` | Type definitions |

### Further Reading

- [React useSyncExternalStore docs](https://react.dev/reference/react/useSyncExternalStore)
- [React Hydration Error explanations](https://react.dev/errors/418)
- [External store pattern RFC](https://github.com/reactwg/react-18/discussions/86)
