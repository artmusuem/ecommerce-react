# context/

React Context providers for application-wide state management.

## Modules

### `CartContext.tsx`

Shopping cart state management with SSR-safe localStorage persistence.

#### Architecture

```
CartProvider
├── useSyncExternalStore (items)    ← Persisted to localStorage
├── useSyncExternalStore (isOpen)   ← Transient, in-memory only
├── dispatch function               ← Action handler
└── Computed values (total, count)  ← Derived from items
```

#### Usage

**Wrap your app:**

```tsx
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <YourApp />
    </CartProvider>
  )
}
```

**Access cart state:**

```tsx
import { useCart } from './context/CartContext'

function CartIcon() {
  const { itemCount, isOpen } = useCart()

  return (
    <button>
      Cart ({itemCount})
    </button>
  )
}
```

**Dispatch actions:**

```tsx
import { useCartDispatch } from './context/CartContext'

function ProductPage({ product }) {
  const dispatch = useCartDispatch()

  const addToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        variantId: product.variants[0].id,
        sizeId: 'medium',
        frameId: 'black',
        title: product.title,
        artist: product.artist,
        image: product.image,
        price: parseFloat(product.variants[0].price)
      }
    })
  }

  return <button onClick={addToCart}>Add to Cart</button>
}
```

#### Available Actions

| Action | Payload | Description |
|--------|---------|-------------|
| `ADD_ITEM` | `AddItemPayload` | Add item or increment quantity |
| `REMOVE_ITEM` | `string` (key) | Remove item from cart |
| `UPDATE_QUANTITY` | `{ key, quantity }` | Update item quantity |
| `CLEAR_CART` | - | Remove all items |
| `TOGGLE_CART` | - | Toggle drawer open/closed |
| `CLOSE_CART` | - | Close drawer |
| `LOAD_CART` | `CartItem[]` | Replace cart contents |

#### State Shape

```typescript
// From useCart()
{
  items: CartItem[]   // Array of cart items
  isOpen: boolean     // Cart drawer state
  total: number       // Sum of (price * quantity)
  itemCount: number   // Sum of quantities
}

// CartItem shape
{
  key: string         // Unique ID: productId-variantId
  productId: string
  variantId: string
  sizeId: string
  frameId: string
  title: string
  artist: string
  image: string
  price: number
  quantity: number
}
```

#### Persistence Behavior

| State | Storage | Survives Refresh | Syncs Across Tabs |
|-------|---------|------------------|-------------------|
| `items` | localStorage | Yes | Yes |
| `isOpen` | Memory | No | No |
| `total` | Computed | N/A | N/A |
| `itemCount` | Computed | N/A | N/A |

#### SSR Hydration

This context uses `useSyncExternalStore` to handle SSR correctly:

1. **Server render**: Empty cart (no localStorage)
2. **Client hydration**: Empty cart (matches server)
3. **After hydration**: Cart populated from localStorage

No hydration errors. No flash of empty content.

#### Legacy Data Migration

The context automatically migrates data from older formats:

```typescript
// Old format (auto-migrated)
{ items: [{ key: '1', ... }] }

// New format
[{ key: '1', ... }]
```

#### Related Documentation

- [Architecture Overview](../../docs/architecture/ARCHITECTURE.md)
- [SSR Persistence Guide](../../docs/guides/SSR-PERSISTENCE-GUIDE.md)
- [Full API Reference](../../docs/api/API.md)

## Design Principles

1. **SSR-Safe**: No hydration mismatches
2. **Separated Concerns**: Persisted vs transient state
3. **Type-Safe**: Full TypeScript coverage
4. **Testable**: Pure reducer logic, injectable stores
