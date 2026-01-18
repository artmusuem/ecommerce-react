# lib/

Reusable utility modules that are framework-agnostic or provide React-specific functionality that could be extracted to a separate package.

## Modules

### `createPersistedStore.ts`

A React 18+ external store factory for localStorage persistence with SSR support.

#### Purpose

Solves the React hydration mismatch problem when using localStorage in SSR applications. Provides a pattern for state that:

- Persists across page refreshes
- Syncs across browser tabs
- Hydrates without errors
- Supports custom serialization

#### Quick Start

```typescript
import { useSyncExternalStore } from 'react'
import { createPersistedStore } from './lib/createPersistedStore'

// Create store
const themeStore = createPersistedStore<'light' | 'dark'>('theme', 'light')

// Use in component
function ThemeToggle() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  )

  return (
    <button onClick={() => themeStore.setState(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

#### API

```typescript
function createPersistedStore<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
): PersistedStore<T>

interface PersistedStore<T> {
  getSnapshot: () => T
  getServerSnapshot: () => T
  subscribe: (listener: () => void) => () => void
  setState: (value: T | ((prev: T) => T)) => void
}
```

#### Advanced: Data Migration

Handle legacy data formats with custom deserializers:

```typescript
const store = createPersistedStore<User[]>('users', [], {
  deserialize: (stored) => {
    const data = JSON.parse(stored)

    // Migrate from v1 format
    if (data.version === 1) {
      return data.users.map(u => ({ ...u, role: 'user' }))
    }

    return data
  }
})
```

#### Related Documentation

- [Architecture Overview](../../docs/architecture/ARCHITECTURE.md)
- [SSR Persistence Guide](../../docs/guides/SSR-PERSISTENCE-GUIDE.md)
- [Full API Reference](../../docs/api/API.md)

## Design Principles

1. **SSR-First**: All modules assume server-side rendering context
2. **Type-Safe**: Full TypeScript with generic support
3. **Zero Dependencies**: Only React peer dependency
4. **Testable**: Pure functions with clear interfaces
