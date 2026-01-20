/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Ensure deps are processed before tests
    deps: {
      inline: [/src\/utils\/images/]
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      // Only include src/ files (not app/, api/, e2e/, config files)
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/App.tsx',
        // Integration files - tested via E2E, not unit tests
        'src/data/shopify-api.ts',
        'src/data/supabase-api.ts',
        'src/data/woocommerce-api.ts',
        'src/data/use-products.ts',
        'src/context/ShopifyProvider.tsx',
        'src/context/useShopifyCart.ts',
        'src/lib/shopify.ts',
        'src/pages/ShopifyCheckout.tsx',
        // Type definitions and schemas (no runtime code to test)
        'src/types/**',
        'src/schemas/**',
        // Error pages - UI-only, tested via E2E
        'src/components/error/**'
      ],
      thresholds: {
        lines: 80,
        functions: 65,
        branches: 70,
        statements: 80
      }
    }
  }
})
