# API Reference

## Module: `createPersistedStore`

**Location:** `src/lib/createPersistedStore.ts`

A factory function that creates an external store compatible with React's `useSyncExternalStore` hook, with automatic localStorage persistence and cross-tab synchronization.

---

### `createPersistedStore<T>(key, initialValue, options?)`

Creates a new persisted store instance.

#### Type Parameters

| Parameter | Description |
|-----------|-------------|
| `T` | The type of data stored. Must be JSON-serializable. |

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | `string` | Yes | The localStorage key for persistence |
| `initialValue` | `T` | Yes | Default value when no stored data exists |
| `options` | `PersistedStoreOptions<T>` | No | Configuration options |

#### Options

```typescript
interface PersistedStoreOptions<T> {
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serialize` | `(value: T) => string` | `JSON.stringify` | Custom serialization function |
| `deserialize` | `(value: string) => T` | `JSON.parse` | Custom deserialization function |

#### Returns

```typescript
interface PersistedStore<T> {
  getSnapshot: () => T
  getServerSnapshot: () => T
  subscribe: (listener: () => void) => () => void
  setState: (value: T | ((prev: T) => T)) => void
}
```

#### Example

```typescript
import { createPersistedStore } from '../lib/createPersistedStore'

// Basic usage
const settingsStore = createPersistedStore('user-settings', {
  theme: 'light',
  notifications: true
})

// With custom serialization
const cartStore = createPersistedStore<CartItem[]>('cart', [], {
  deserialize: (stored) => {
    const parsed = JSON.parse(stored)
    // Handle legacy format migration
    return Array.isArray(parsed) ? parsed : parsed.items ?? []
  }
})
```

---

### `PersistedStore<T>.getSnapshot()`

Returns the current value of the store. On the client, this will read from localStorage on first call.

#### Returns

`T` - The current store value

#### Behavior

- **Server:** Returns `initialValue`
- **Client (first call):** Reads from localStorage, caches result
- **Client (subsequent):** Returns cached value

#### Example

```typescript
const store = createPersistedStore('key', [])
const items = store.getSnapshot() // Returns stored items or []
```

---

### `PersistedStore<T>.getServerSnapshot()`

Returns the server-side value. Always returns `initialValue` for consistent SSR.

#### Returns

`T` - The initial value passed to `createPersistedStore`

#### Example

```typescript
const store = createPersistedStore('key', [1, 2, 3])
store.getServerSnapshot() // Always returns [1, 2, 3]
```

---

### `PersistedStore<T>.subscribe(listener)`

Subscribes to store changes. Called by React's `useSyncExternalStore` internally.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `listener` | `() => void` | Callback invoked on state changes |

#### Returns

`() => void` - Unsubscribe function

#### Behavior

- Adds listener to internal Set
- Attaches `storage` event listener for cross-tab sync
- Returns cleanup function that removes both listeners

#### Example

```typescript
const store = createPersistedStore('key', [])

const unsubscribe = store.subscribe(() => {
  console.log('Store updated:', store.getSnapshot())
})

// Later...
unsubscribe()
```

---

### `PersistedStore<T>.setState(value)`

Updates the store value and persists to localStorage.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `T \| ((prev: T) => T)` | New value or updater function |

#### Behavior

1. Resolves value (if function, calls with previous value)
2. Updates internal cache
3. Writes to localStorage
4. Notifies all subscribers

#### Example

```typescript
const store = createPersistedStore('count', 0)

// Direct value
store.setState(5)

// Functional update
store.setState(prev => prev + 1)
```

---

## Module: `CartContext`

**Location:** `src/context/CartContext.tsx`

React Context implementation for shopping cart state management with SSR-safe persistence.

---

### `<CartProvider>`

Provider component that wraps the application to provide cart state.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | Child components |

#### Example

```tsx
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <Header />
      <Main />
      <Footer />
    </CartProvider>
  )
}
```

---

### `useCart()`

Hook to access cart state.

#### Returns

```typescript
interface CartContextValue {
  items: CartItem[]      // Array of cart items
  isOpen: boolean        // Whether cart drawer is open
  total: number          // Total price (sum of item.price * item.quantity)
  itemCount: number      // Total item count (sum of quantities)
}
```

#### Throws

`Error` - If used outside of `CartProvider`

#### Example

```tsx
function CartSummary() {
  const { items, total, itemCount } = useCart()

  return (
    <div>
      <span>{itemCount} items</span>
      <span>${total.toFixed(2)}</span>
    </div>
  )
}
```

---

### `useCartDispatch()`

Hook to access cart dispatch function.

#### Returns

`(action: CartAction) => void` - Dispatch function

#### Throws

`Error` - If used outside of `CartProvider`

#### Example

```tsx
function AddToCartButton({ product }) {
  const dispatch = useCartDispatch()

  const handleClick = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        variantId: product.variantId,
        sizeId: 'medium',
        frameId: 'black',
        title: product.title,
        artist: product.artist,
        image: product.image,
        price: product.price
      }
    })
  }

  return <button onClick={handleClick}>Add to Cart</button>
}
```

---

## Cart Actions

### `ADD_ITEM`

Adds an item to the cart or increments quantity if already present.

```typescript
{
  type: 'ADD_ITEM'
  payload: AddItemPayload
}
```

**Payload:**
```typescript
interface AddItemPayload {
  productId: string
  variantId: string
  sizeId: string
  frameId: string
  title: string
  artist: string
  image: string
  price: number
}
```

**Behavior:**
- If item with same `productId-variantId` exists, increments quantity
- Otherwise, adds new item with quantity 1
- Opens cart drawer

---

### `REMOVE_ITEM`

Removes an item from the cart.

```typescript
{
  type: 'REMOVE_ITEM'
  payload: string  // Item key (productId-variantId)
}
```

---

### `UPDATE_QUANTITY`

Updates the quantity of an item.

```typescript
{
  type: 'UPDATE_QUANTITY'
  payload: {
    key: string      // Item key
    quantity: number // New quantity
  }
}
```

**Behavior:**
- If quantity <= 0, removes item
- Otherwise, updates quantity

---

### `CLEAR_CART`

Removes all items from the cart.

```typescript
{ type: 'CLEAR_CART' }
```

---

### `TOGGLE_CART`

Toggles cart drawer open/closed state.

```typescript
{ type: 'TOGGLE_CART' }
```

---

### `CLOSE_CART`

Closes the cart drawer.

```typescript
{ type: 'CLOSE_CART' }
```

---

### `LOAD_CART`

Replaces cart contents with provided items.

```typescript
{
  type: 'LOAD_CART'
  payload: CartItem[]
}
```

---

## Types

**Location:** `src/types/index.ts`

### `CartItem`

```typescript
interface CartItem {
  key: string        // Unique identifier (productId-variantId)
  productId: string  // Product ID
  variantId: string  // Shopify variant GID
  sizeId: string     // Selected size
  frameId: string    // Selected frame
  title: string      // Product title
  artist: string     // Artist name
  image: string      // Image URL
  price: number      // Unit price
  quantity: number   // Quantity in cart
}
```

### `CartState`

```typescript
interface CartState {
  items: CartItem[]
  isOpen: boolean
}
```

### `CartContextValue`

```typescript
interface CartContextValue extends CartState {
  total: number      // Computed: sum of (price * quantity)
  itemCount: number  // Computed: sum of quantities
}
```

### `CartAction`

```typescript
type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
```

---

## Error Handling

### Store Errors

All store operations are wrapped in try-catch. Errors are logged to console but don't throw:

```typescript
// Safe - won't crash if localStorage is full
store.setState(largeData)
// Logs: [PersistedStore] Failed to write "key" to localStorage: QuotaExceededError
```

### Context Errors

Hooks throw if used outside provider:

```typescript
// Throws: "useCart must be used within a CartProvider"
function InvalidComponent() {
  const { items } = useCart()
}
```

---

## Browser Compatibility

| Feature | Browsers |
|---------|----------|
| `useSyncExternalStore` | React 18+ |
| `localStorage` | All modern browsers |
| `StorageEvent` | All modern browsers |

### SSR Compatibility

| Environment | Behavior |
|-------------|----------|
| Node.js | Returns `initialValue`, no localStorage access |
| Browser (hydration) | Returns `initialValue` initially |
| Browser (after hydration) | Returns localStorage value |
