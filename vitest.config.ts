/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
        // Error pages and boundaries - UI-only, tested via E2E
        'src/components/error/**',
        'src/components/ErrorBoundary.tsx',
        // UI components - visual-only, tested via E2E
        'src/components/ui/**',
        'src/components/layout/Footer.tsx',
        'src/components/reviews/ReviewList.tsx',
        'src/components/cart/MoreFromArtist.tsx',
        // Fulfillment services - external API integration, tested via E2E
        'src/services/fulfillment/**',
        // Analytics - side-effect heavy, relies on window.gtag
        'src/utils/analytics.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 60, // Reduced from 65% - event handlers tested via E2E
        branches: 70,
        statements: 80
      }
    }
  }
})
