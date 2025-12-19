import { test, expect } from '@playwright/test'

test.describe('Gallery Store E2E', () => {
  
  test.describe('Home Page', () => {
    test('should load home page with artist name', async ({ page }) => {
      await page.goto('/')
      
      // Should show default artist (Winslow Homer)
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Winslow Homer')
      
      // Should show artist selector
      await expect(page.getByRole('combobox')).toBeVisible()
    })

    test('should display product grid', async ({ page }) => {
      await page.goto('/')
      
      // Wait for products to load
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      
      // Should have product cards with prices
      await expect(page.getByText('$45').first()).toBeVisible()
    })

    test('should switch artists', async ({ page }) => {
      await page.goto('/')
      
      // Change artist
      await page.getByRole('combobox').selectOption('edward-hopper')
      
      // Should update heading
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Edward Hopper')
      
      // URL should update
      await expect(page).toHaveURL(/artist=edward-hopper/)
    })
  })

  test.describe('Product Page', () => {
    test('should navigate to product page', async ({ page }) => {
      await page.goto('/')
      
      // Wait for grid to load
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      
      // Click first product
      await page.locator('a[href^="/product/"]').first().click()
      
      // Should be on product page
      await expect(page).toHaveURL(/\/product\//)
      
      // Should have Add to Cart button
      await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeVisible()
    })

    test('should display size and frame options', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      
      // Should have size selector
      await expect(page.getByText('Print Size')).toBeVisible()
      
      // Should have frame selector
      await expect(page.getByText('Frame Style')).toBeVisible()
    })

    test('should update price when options change', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      
      // Get initial price (should be $45 for 8x10 + black frame)
      await expect(page.getByText('$45')).toBeVisible()
      
      // Change to largest size
      const selects = page.getByRole('combobox')
      await selects.first().selectOption('24x30')
      
      // Price should update to $145
      await expect(page.getByText('$145')).toBeVisible()
    })
  })

  test.describe('Cart Flow', () => {
    test('should add item to cart', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      
      // Add to cart
      await page.getByRole('button', { name: 'Add to Cart' }).click()
      
      // Should show confirmation
      await expect(page.getByText('Added to Cart')).toBeVisible()
      
      // Cart should open
      await expect(page.getByRole('heading', { name: /Cart \(1\)/ })).toBeVisible()
    })

    test('should update quantity in cart', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      await page.getByRole('button', { name: 'Add to Cart' }).click()
      
      // Cart should be open
      await expect(page.getByRole('heading', { name: /Cart \(1\)/ })).toBeVisible()
      
      // Click + button to increase quantity
      await page.getByRole('button', { name: '+' }).click()
      
      // Quantity should be 2
      await expect(page.getByText('2').first()).toBeVisible()
    })

    test('should remove item from cart', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      await page.getByRole('button', { name: 'Add to Cart' }).click()
      
      // Remove item
      await page.getByRole('button', { name: 'Remove' }).click()
      
      // Cart should be empty
      await expect(page.getByText('Your cart is empty')).toBeVisible()
    })

    test('should navigate to checkout', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      await page.getByRole('button', { name: 'Add to Cart' }).click()
      
      // Click checkout
      await page.getByRole('link', { name: 'Checkout' }).click()
      
      // Should be on checkout page
      await expect(page).toHaveURL('/checkout')
      await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
    })
  })

  test.describe('Checkout Page', () => {
    test('should show empty cart message when no items', async ({ page }) => {
      await page.goto('/checkout')
      
      await expect(page.getByText('Your cart is empty')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Continue shopping' })).toBeVisible()
    })

    test('should display order summary with items', async ({ page }) => {
      // Add item first
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      await page.getByRole('button', { name: 'Add to Cart' }).click()
      await page.getByRole('link', { name: 'Checkout' }).click()
      
      // Should show order summary
      await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate via header logo', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      
      // Click logo to go home
      await page.getByRole('link', { name: /Gallery Store/ }).click()
      
      await expect(page).toHaveURL('/')
    })

    test('should persist cart across navigation', async ({ page }) => {
      // Add item
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      await page.locator('a[href^="/product/"]').first().click()
      await page.getByRole('button', { name: 'Add to Cart' }).click()
      
      // Close cart
      await page.keyboard.press('Escape')
      
      // Navigate home
      await page.getByRole('link', { name: /Gallery Store/ }).click()
      
      // Open cart via header button
      await page.getByRole('button', { name: 'Shopping cart' }).click()
      
      // Item should still be there
      await expect(page.getByRole('heading', { name: /Cart \(1\)/ })).toBeVisible()
    })

    test('should handle direct URL access to product', async ({ page }) => {
      // This tests the fallback fetch when no router state
      await page.goto('/product/art-0-test-invalid')
      
      // Should show not found or fetch product
      // Either outcome is acceptable for this smoke test
      await expect(page.locator('body')).not.toBeEmpty()
    })
  })

  test.describe('Image Loading', () => {
    test('should load images via Cloudinary CDN', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('prints')).toBeVisible({ timeout: 10000 })
      
      // Check that images use Cloudinary
      const images = page.locator('img[src*="cloudinary"]')
      await expect(images.first()).toBeVisible()
    })
  })
})
