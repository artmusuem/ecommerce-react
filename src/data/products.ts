import type { Product, RawArtwork, Artist, Frame, Size, StoreConfig } from '../types'

// Store configuration
export const storeConfig: StoreConfig = {
  name: "Gallery Store",
  tagline: "Museum-quality prints from the Smithsonian",
  currency: "USD"
}

// Available artists with their JSON file paths
export const artists: Artist[] = [
  { id: "winslow-homer", name: "Winslow Homer", file: "/data/winslow-homer.json", dates: "1836–1910" },
  { id: "mary-cassatt", name: "Mary Cassatt", file: "/data/mary-cassatt.json", dates: "1844–1926" },
  { id: "thomas-cole", name: "Thomas Cole", file: "/data/thomas-cole.json", dates: "1801–1848" },
  { id: "frederic-remington", name: "Frederic Remington", file: "/data/frederic-remington.json", dates: "1861–1909" },
  { id: "georgia-okeeffe", name: "Georgia O'Keeffe", file: "/data/georgia-okeeffe.json", dates: "1887–1986" },
  { id: "edward-hopper", name: "Edward Hopper", file: "/data/edward-hopper.json", dates: "1882–1967" }
]

// Frame options
export const frames: Frame[] = [
  { id: "black", name: "Matte Black", priceAdd: 0, color: "#1a1a1a" },
  { id: "natural", name: "Natural Oak", priceAdd: 15, color: "#c4a574" },
  { id: "walnut", name: "Rich Walnut", priceAdd: 20, color: "#5c4033" },
  { id: "gold", name: "Antique Gold", priceAdd: 25, color: "#d4af37" },
  { id: "white", name: "Gallery White", priceAdd: 10, color: "#f5f5f5" }
]

// Size options
export const sizes: Size[] = [
  { id: "8x10", name: '8" × 10"', basePrice: 45, dimensions: { w: 8, h: 10 } },
  { id: "11x14", name: '11" × 14"', basePrice: 65, dimensions: { w: 11, h: 14 } },
  { id: "16x20", name: '16" × 20"', basePrice: 95, dimensions: { w: 16, h: 20 } },
  { id: "24x30", name: '24" × 30"', basePrice: 145, dimensions: { w: 24, h: 30 } }
]

// Calculate price based on size and frame
export function calculatePrice(sizeId: string, frameId: string): number {
  const size = sizes.find(s => s.id === sizeId)
  const frame = frames.find(f => f.id === frameId)
  if (!size || !frame) return 0
  return size.basePrice + frame.priceAdd
}

// Transform Smithsonian JSON artwork to store product format
export function transformArtwork(artwork: RawArtwork, index: number): Product {
  // Create a URL-safe ID from title
  const id = artwork.smithsonian_id || 
    `art-${index}-${artwork.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`
  
  return {
    id,
    title: artwork.title,
    artist: formatArtistName(artwork.artist),
    year: artwork.year_created || "Date unknown",
    origin: "United States",
    medium: artwork.medium || "Mixed media",
    image: artwork.image,
    description: artwork.description || `A work by ${artwork.artist}`,
    tags: generateTags(artwork),
    museum: artwork.museum,
    accession_number: artwork.accession_number,
    api_url: artwork.api_url
  }
}

// Format artist name from "Last, First" to "First Last"
function formatArtistName(name: string): string {
  if (!name) return "Unknown Artist"
  if (name.includes(", ")) {
    const [last, first] = name.split(", ")
    return `${first} ${last}`
  }
  return name
}

// Generate tags from artwork data
function generateTags(artwork: RawArtwork): string[] {
  const tags: string[] = []
  if (artwork.object_type) tags.push(artwork.object_type.toLowerCase())
  if (artwork.medium) {
    if (artwork.medium.includes("oil")) tags.push("oil painting")
    if (artwork.medium.includes("watercolor")) tags.push("watercolor")
    if (artwork.medium.includes("engraving")) tags.push("print")
    if (artwork.medium.includes("bronze")) tags.push("sculpture")
  }
  return tags.slice(0, 4)
}
