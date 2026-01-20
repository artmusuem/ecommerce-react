/**
 * createPersistedStore - A React 18+ external store factory for localStorage persistence
 *
 * Uses useSyncExternalStore pattern for proper SSR hydration without flicker.
 * This is the recommended React approach for external state that differs between
 * server and client.
 *
 * @example
 * const cartStore = createPersistedStore<CartItem[]>('cart-items', [])
 *
 * // In component:
 * const items = useSyncExternalStore(
 *   cartStore.subscribe,
 *   cartStore.getSnapshot,
 *   cartStore.getServerSnapshot
 * )
 */

type Listener = () => void

export interface PersistedStore<T> {
  getSnapshot: () => T
  getServerSnapshot: () => T
  subscribe: (listener: Listener) => () => void
  setState: (value: T | ((prev: T) => T)) => void
  /** Reset store to initial state (for testing) */
  _reset: () => void
}

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

  // Listeners for React's subscription model
  const listeners = new Set<Listener>()

  // In-memory cache for the current value
  let cachedValue: T = initialValue
  let isInitialized = false

  // Initialize from localStorage (client-side only)
  function initializeFromStorage(): void {
    if (typeof window === 'undefined' || isInitialized) return

    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        cachedValue = deserialize(stored)
      }
    } catch (error) {
      console.error(`[PersistedStore] Failed to read "${key}" from localStorage:`, error)
    }
    isInitialized = true
  }

  // Get current value (client-side, after hydration)
  function getSnapshot(): T {
    initializeFromStorage()
    return cachedValue
  }

  // Get server-side value (always returns initial value for consistent SSR)
  function getServerSnapshot(): T {
    return initialValue
  }

  // Subscribe to changes
  function subscribe(listener: Listener): () => void {
    listeners.add(listener)

    // Listen for storage events from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          cachedValue = deserialize(event.newValue)
          emitChange()
        } catch (error) {
          console.error(`[PersistedStore] Failed to parse storage event for "${key}":`, error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }

    return () => {
      listeners.delete(listener)
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }

  // Notify all subscribers of a change
  function emitChange(): void {
    listeners.forEach(listener => listener())
  }

  // Update the store value
  function setState(value: T | ((prev: T) => T)): void {
    initializeFromStorage()

    const nextValue = typeof value === 'function'
      ? (value as (prev: T) => T)(cachedValue)
      : value

    cachedValue = nextValue

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, serialize(nextValue))
      } catch (error) {
        console.error(`[PersistedStore] Failed to write "${key}" to localStorage:`, error)
      }
    }

    emitChange()
  }

  // Reset store to initial state (for testing)
  function _reset(): void {
    cachedValue = initialValue
    isInitialized = false
    emitChange()
  }

  return {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    setState,
    _reset
  }
}
