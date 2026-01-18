// Image optimization utilities
// Supports: Direct Smithsonian resize OR Cloudinary CDN proxy
//
// CDN Benefits:
// - Global edge caching (200+ PoPs)
// - Automatic WebP/AVIF format conversion
// - Quality optimization
// - Responsive breakpoints
// - ~70% smaller file sizes

/**
 * Configuration
 * Set VITE_CLOUDINARY_CLOUD to enable CDN proxy
 * Leave empty to use direct Smithsonian URLs
 */
const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || ''

/**
 * Image size presets (in pixels)
 */
export const IMAGE_SIZES = {
  blur: 20,        // Tiny placeholder for blur-up effect (~1KB)
  thumbnail: 400,  // Product grid cards (~30-50KB)
  preview: 800,    // Product page framed preview (~80-120KB)
  full: 1600       // Lightbox / high-res (~200-400KB)
}

/**
 * Generate optimized image URL
 * 
 * If Cloudinary configured: Proxies through CDN with auto-format
 * Otherwise: Uses Smithsonian's native resize parameter
 * 
 * @param {string} url - Original image URL
 * @param {number} maxSize - Maximum dimension in pixels
 * @param {object} options - Additional options
 * @returns {string} - Optimized image URL
 */
export function getResizedImage(url: string, maxSize: number, options: {
  quality?: string
  format?: string
  crop?: string
} = {}): string {
  if (!url) return ''
  
  // Use Cloudinary CDN if configured
  if (CLOUDINARY_CLOUD) {
    return getCloudinaryUrl(url, maxSize, options)
  }
  
  // Fallback to Smithsonian native resize
  return getSmithsonianUrl(url, maxSize)
}

/**
 * Cloudinary fetch URL (proxies remote images through CDN)
 * 
 * Transforms applied:
 * - f_auto: Automatic format (WebP/AVIF when supported)
 * - q_auto: Automatic quality optimization
 * - w_[size]: Width constraint
 * - c_limit: Don't upscale, only downscale
 */
function getCloudinaryUrl(url: string, maxSize: number, options: {
  quality?: string
  format?: string
  crop?: string
} = {}): string {
  const {
    quality = 'auto',
    format = 'auto',
    crop = 'limit'
  } = options
  
  // Note: Removed dpr_auto to ensure consistent URLs for caching
  // Same URL = cache hit when navigating from grid to product page
  const transforms = [
    `w_${maxSize}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',')
  
  // Cloudinary fetch URL format
  // https://res.cloudinary.com/{cloud}/image/fetch/{transforms}/{encoded_url}
  const encodedUrl = encodeURIComponent(url)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${transforms}/${encodedUrl}`
}

/**
 * Smithsonian IDS native resize
 * Their API supports max, max_w, max_h parameters
 */
function getSmithsonianUrl(url: string, maxSize: number): string {
  if (!url.includes('ids.si.edu')) return url
  
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}max=${maxSize}`
}

/**
 * Get srcset for responsive images
 * Returns multiple sizes for browser to choose from
 * 
 * @param {string} url - Original image URL
 * @param {number[]} widths - Array of widths to generate
 * @returns {string} - srcset attribute value
 */
export function getSrcSet(url: string, widths: number[] = [400, 800, 1200, 1600]): string {
  return widths
    .map(w => `${getResizedImage(url, w)} ${w}w`)
    .join(', ')
}

/**
 * Get sizes attribute for responsive images
 * Tells browser which size to use at each breakpoint
 * 
 * @param {object} breakpoints - Object mapping breakpoints to sizes
 * @returns {string} - sizes attribute value
 */
export function getSizes(breakpoints: Record<string, string> = {}): string {
  const defaults: Record<string, string> = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    'default': '400px'
  }
  
  const merged = { ...defaults, ...breakpoints }
  
  return Object.entries(merged)
    .map(([breakpoint, size]) => 
      breakpoint === 'default' ? size : `${breakpoint} ${size}`
    )
    .join(', ')
}

/**
 * Preload an image in the background
 * @param {string} url - Image URL to preload
 * @returns {Promise} - Resolves when image is loaded
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Preload multiple images with priority hints
 * @param {string[]} urls - Array of image URLs
 * @param {string} priority - 'high' | 'low' | 'auto'
 * @returns {Promise} - Resolves when all images loaded
 */
export function preloadImages(urls: string[], priority: 'high' | 'low' | 'auto' = 'auto'): Promise<HTMLImageElement[]> {
  // Add link preload hints to head for high priority
  if (priority === 'high') {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }
  
  return Promise.all(urls.map(preloadImage))
}

/**
 * Get Low Quality Image Placeholder (LQIP)
 * Returns tiny blurred version for instant display
 */
export function getLQIP(url: string): string {
  return getResizedImage(url, IMAGE_SIZES.blur)
}

/**
 * Check if browser supports modern image formats
 * Safe for test environments where canvas.toDataURL may return null
 */
export const supportsWebP = (() => {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const dataUrl = canvas.toDataURL('image/webp')
    return dataUrl ? dataUrl.indexOf('data:image/webp') === 0 : false
  } catch {
    return false
  }
})()

export const supportsAVIF = (() => {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const dataUrl = canvas.toDataURL('image/avif')
    return dataUrl ? dataUrl.indexOf('data:image/avif') === 0 : false
  } catch {
    return false
  }
})()
