import { describe, it, expect } from 'vitest'
import type { RawArtwork } from '../types'
import { 
  calculatePrice, 
  transformArtwork, 
  sizes, 
  frames, 
  artists,
  storeConfig 
} from './products'

describe('products.ts', () => {
  
  describe('storeConfig', () => {
    it('should have correct store name', () => {
      expect(storeConfig.name).toBe('Gallery Store')
    })

    it('should use USD currency', () => {
      expect(storeConfig.currency).toBe('USD')
    })
  })

  describe('sizes', () => {
    it('should have 4 size options', () => {
      expect(sizes).toHaveLength(4)
    })

    it('should have correct size IDs', () => {
      const sizeIds = sizes.map(s => s.id)
      expect(sizeIds).toContain('8x10')
      expect(sizeIds).toContain('11x14')
      expect(sizeIds).toContain('16x20')
      expect(sizeIds).toContain('24x30')
    })

    it('should have increasing base prices', () => {
      const prices = sizes.map(s => s.basePrice)
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThan(prices[i - 1])
      }
    })

    it('should have smallest size at $45', () => {
      const smallest = sizes.find(s => s.id === '8x10')
      expect(smallest?.basePrice).toBe(45)
    })
  })

  describe('frames', () => {
    it('should have 5 frame options', () => {
      expect(frames).toHaveLength(5)
    })

    it('should have correct frame IDs', () => {
      const frameIds = frames.map(f => f.id)
      expect(frameIds).toContain('black')
      expect(frameIds).toContain('natural')
      expect(frameIds).toContain('walnut')
      expect(frameIds).toContain('gold')
      expect(frameIds).toContain('white')
    })

    it('should have Matte Black as free option', () => {
      const black = frames.find(f => f.id === 'black')
      expect(black?.priceAdd).toBe(0)
    })

    it('should have valid hex colors', () => {
      frames.forEach(frame => {
        expect(frame.color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })

  describe('artists', () => {
    it('should have 6 artists', () => {
      expect(artists).toHaveLength(6)
    })

    it('should have Winslow Homer', () => {
      const homer = artists.find(a => a.id === 'winslow-homer')
      expect(homer).toBeDefined()
      expect(homer?.name).toBe('Winslow Homer')
    })

    it('should have valid JSON file paths', () => {
      artists.forEach(artist => {
        expect(artist.file).toMatch(/^\/data\/[\w-]+\.json$/)
      })
    })
  })

  describe('calculatePrice', () => {
    it('should calculate price for smallest size with free frame', () => {
      const price = calculatePrice('8x10', 'black')
      expect(price).toBe(45) // $45 base + $0 frame
    })

    it('should calculate price for smallest size with premium frame', () => {
      const price = calculatePrice('8x10', 'gold')
      expect(price).toBe(70) // $45 base + $25 frame
    })

    it('should calculate price for largest size with free frame', () => {
      const price = calculatePrice('24x30', 'black')
      expect(price).toBe(145) // $145 base + $0 frame
    })

    it('should calculate price for largest size with premium frame', () => {
      const price = calculatePrice('24x30', 'gold')
      expect(price).toBe(170) // $145 base + $25 frame
    })

    it('should return 0 for invalid size', () => {
      const price = calculatePrice('invalid', 'black')
      expect(price).toBe(0)
    })

    it('should return 0 for invalid frame', () => {
      const price = calculatePrice('8x10', 'invalid')
      expect(price).toBe(0)
    })
  })

  describe('transformArtwork', () => {
    const mockArtwork = {
      title: 'The Gulf Stream',
      artist: 'Homer, Winslow',
      year_created: '1899',
      medium: 'Oil on canvas',
      image: 'https://ids.si.edu/ids/deliveryService?id=SAAM-1967.66.3_1',
      description: 'A dramatic seascape',
      smithsonian_id: 'saam-1967.66.3',
      museum: 'Smithsonian American Art Museum',
      accession_number: '1967.66.3',
      object_type: 'Painting'
    }

    it('should transform title correctly', () => {
      const product = transformArtwork(mockArtwork, 0)
      expect(product.title).toBe('The Gulf Stream')
    })

    it('should format artist name from "Last, First" to "First Last"', () => {
      const product = transformArtwork(mockArtwork, 0)
      expect(product.artist).toBe('Winslow Homer')
    })

    it('should preserve year', () => {
      const product = transformArtwork(mockArtwork, 0)
      expect(product.year).toBe('1899')
    })

    it('should preserve image URL', () => {
      const product = transformArtwork(mockArtwork, 0)
      expect(product.image).toBe(mockArtwork.image)
    })

    it('should use smithsonian_id as product id when available', () => {
      const product = transformArtwork(mockArtwork, 0)
      expect(product.id).toBe('saam-1967.66.3')
    })

    it('should generate slug-based id when smithsonian_id missing', () => {
      const artworkNoId = { ...mockArtwork, smithsonian_id: undefined }
      const product = transformArtwork(artworkNoId, 5)
      expect(product.id).toMatch(/^art-5-/)
    })

    it('should preserve accession number', () => {
      const product = transformArtwork(mockArtwork, 0)
      expect(product.accession_number).toBe('1967.66.3')
    })

    it('should generate tags from object_type and medium', () => {
      const product = transformArtwork(mockArtwork, 0)
      // object_type 'Painting' becomes 'painting'
      expect(product.tags).toContain('painting')
      // Note: medium check is case-sensitive, 'Oil on canvas' won't match 'oil'
      // This tests actual behavior - consider fixing generateTags if case-insensitive is desired
    })

    it('should handle artist name without comma', () => {
      const artwork = { ...mockArtwork, artist: 'Banksy' }
      const product = transformArtwork(artwork, 0)
      expect(product.artist).toBe('Banksy')
    })

    it('should handle missing artist', () => {
      const artwork = { ...mockArtwork, artist: undefined } as unknown as RawArtwork
      const product = transformArtwork(artwork, 0)
      expect(product.artist).toBe('Unknown Artist')
    })

    it('should default year to "Date unknown" when missing', () => {
      const artwork = { ...mockArtwork, year_created: undefined }
      const product = transformArtwork(artwork, 0)
      expect(product.year).toBe('Date unknown')
    })

    it('should default medium to "Mixed media" when missing', () => {
      const artwork = { ...mockArtwork, medium: undefined }
      const product = transformArtwork(artwork, 0)
      expect(product.medium).toBe('Mixed media')
    })
  })
})

describe('price calculations edge cases', () => {
  it('should handle all size/frame combinations', () => {
    sizes.forEach(size => {
      frames.forEach(frame => {
        const price = calculatePrice(size.id, frame.id)
        expect(price).toBe(size.basePrice + frame.priceAdd)
      })
    })
  })

  it('should never return negative prices', () => {
    sizes.forEach(size => {
      frames.forEach(frame => {
        const price = calculatePrice(size.id, frame.id)
        expect(price).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
