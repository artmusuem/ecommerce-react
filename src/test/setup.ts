// IMPORTANT: Canvas mock must be first, before any imports
// This is needed for supportsWebP/supportsAVIF detection in images.ts
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.toDataURL = function() {
    return 'data:image/webp;base64,mock'
  }
}

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { _resetCartForTesting } from '../context/CartContext'

// Create a proper localStorage mock that actually stores values
function createLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    // Expose store for debugging
    _getStore: () => store
  }
}

const localStorageMock = createLocalStorageMock()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Reset modules and localStorage before each test to ensure clean state
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
  // Reset cart state to ensure test isolation
  _resetCartForTesting()
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
  value: IntersectionObserverMock
})

// Mock Image for preloading tests
class ImageMock {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
}
Object.defineProperty(window, 'Image', { value: ImageMock })

// Mock import.meta.env
vi.stubEnv('VITE_CLOUDINARY_CLOUD', 'test-cloud')
vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_mock')

// Suppress console errors for expected test failures
const originalError = console.error
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('Error: Not implemented'))
  ) {
    return
  }
  originalError.call(console, ...args)
}
