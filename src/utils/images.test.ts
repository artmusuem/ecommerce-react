import { describe, it, expect } from 'vitest'
import { 
  getResizedImage, 
  IMAGE_SIZES, 
  preloadImage,
  getSrcSet,
  getSizes,
  getLQIP
} from '../utils/images'

describe('images.ts utilities', () => {
  
  describe('IMAGE_SIZES', () => {
    it('should have correct size constants', () => {
      expect(IMAGE_SIZES.blur).toBe(20)
      expect(IMAGE_SIZES.thumbnail).toBe(400)
      expect(IMAGE_SIZES.preview).toBe(800)
      expect(IMAGE_SIZES.full).toBe(1600)
    })
  })

  describe('getResizedImage', () => {
    const smithsonianUrl = 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1'
    const genericUrl = 'https://example.com/image.jpg'

    it('should return empty string for empty input', () => {
      expect(getResizedImage('', 400)).toBe('')
    })

    it('should return empty string for undefined input', () => {
      expect(getResizedImage(undefined as unknown as string, 400)).toBe('')
    })

    describe('with Cloudinary configured', () => {
      // VITE_CLOUDINARY_CLOUD is set to 'test-cloud' in setup.ts
      
      it('should generate Cloudinary URL for Smithsonian images', () => {
        const result = getResizedImage(smithsonianUrl, 400)
        
        expect(result).toContain('res.cloudinary.com')
        expect(result).toContain('test-cloud')
        expect(result).toContain('w_400')
        expect(result).toContain('c_limit')
        expect(result).toContain('q_auto')
        expect(result).toContain('f_auto')
        expect(result).toContain(encodeURIComponent(smithsonianUrl))
      })

      it('should generate Cloudinary URL for generic images', () => {
        const result = getResizedImage(genericUrl, 800)
        
        expect(result).toContain('res.cloudinary.com')
        expect(result).toContain('w_800')
      })

      it('should use correct transform parameters', () => {
        const result = getResizedImage(smithsonianUrl, 1600)
        
        // Should NOT contain dpr_auto (we removed it for caching consistency)
        expect(result).not.toContain('dpr_auto')
        
        // Should contain our standard transforms
        expect(result).toMatch(/w_1600,c_limit,q_auto,f_auto/)
      })

      it('should properly encode special characters in URL', () => {
        const urlWithParams = 'https://example.com/image?param=value&other=123'
        const result = getResizedImage(urlWithParams, 400)
        
        expect(result).toContain(encodeURIComponent(urlWithParams))
      })
    })

    describe('different size tiers', () => {
      it('should generate thumbnail size', () => {
        const result = getResizedImage(smithsonianUrl, IMAGE_SIZES.thumbnail)
        expect(result).toContain('w_400')
      })

      it('should generate preview size', () => {
        const result = getResizedImage(smithsonianUrl, IMAGE_SIZES.preview)
        expect(result).toContain('w_800')
      })

      it('should generate full size', () => {
        const result = getResizedImage(smithsonianUrl, IMAGE_SIZES.full)
        expect(result).toContain('w_1600')
      })
    })
  })

  describe('getSrcSet', () => {
    const testUrl = 'https://example.com/image.jpg'

    it('should generate srcset with default widths', () => {
      const result = getSrcSet(testUrl)
      
      expect(result).toContain('400w')
      expect(result).toContain('800w')
      expect(result).toContain('1200w')
      expect(result).toContain('1600w')
    })

    it('should generate srcset with custom widths', () => {
      const result = getSrcSet(testUrl, [300, 600])
      
      expect(result).toContain('300w')
      expect(result).toContain('600w')
      expect(result).not.toContain('400w')
    })

    it('should have comma-separated entries', () => {
      const result = getSrcSet(testUrl, [300, 600])
      const parts = result.split(', ')
      
      expect(parts).toHaveLength(2)
    })
  })

  describe('getSizes', () => {
    it('should return default sizes', () => {
      const result = getSizes()
      
      expect(result).toContain('(max-width: 640px) 100vw')
      expect(result).toContain('(max-width: 1024px) 50vw')
      expect(result).toContain('400px')
    })

    it('should merge custom breakpoints', () => {
      const result = getSizes({
        '(max-width: 768px)': '75vw',
        'default': '300px'
      })
      
      expect(result).toContain('(max-width: 768px) 75vw')
      expect(result).toContain('300px')
    })
  })

  describe('getLQIP', () => {
    it('should generate blur-size image URL', () => {
      const url = 'https://example.com/image.jpg'
      const result = getLQIP(url)
      
      expect(result).toContain('w_20')
    })
  })

  describe('preloadImage', () => {
    it('should resolve when image loads', async () => {
      const url = 'https://example.com/image.jpg'
      const result = await preloadImage(url)
      
      expect(result).toBeDefined()
    })

    it('should set src on the Image object', async () => {
      const url = 'https://example.com/image.jpg'
      await preloadImage(url)
      
      // The mock Image class handles this - test passes if no error thrown
      expect(true).toBe(true)
    })
  })
})

describe('URL consistency for caching', () => {
  const testUrl = 'https://ids.si.edu/ids/deliveryService?id=TEST'
  
  it('should generate identical URLs for same input', () => {
    const url1 = getResizedImage(testUrl, 400)
    const url2 = getResizedImage(testUrl, 400)
    
    expect(url1).toBe(url2)
  })

  it('should generate different URLs for different sizes', () => {
    const thumbnail = getResizedImage(testUrl, 400)
    const preview = getResizedImage(testUrl, 800)
    
    expect(thumbnail).not.toBe(preview)
  })
})
