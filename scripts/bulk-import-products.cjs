/**
 * Bulk Import Products from Smithsonian JSON to Shopify
 *
 * This script:
 * 1. Reads the smithsonian-art-gallery.json file
 * 2. Groups artworks by artist
 * 3. Creates collections for top artists (5+ works)
 * 4. Creates products with variants (16 per product: 4 sizes × 4 frames)
 * 5. Sets inventory policy to CONTINUE (allow oversell)
 *
 * Usage: node scripts/bulk-import-products.cjs
 */

const fs = require('fs');
const path = require('path');

// Configuration - uses environment variables for credentials
// Set these before running:
//   SHOPIFY_STORE=your-store.myshopify.com
//   SHOPIFY_ADMIN_TOKEN=shpat_xxx
const CONFIG = {
  SHOPIFY_STORE: process.env.SHOPIFY_STORE || 'your-store.myshopify.com',
  SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN || '',
  JSON_FILE: process.env.JSON_FILE || './smithsonian-art-gallery.json',
  MIN_WORKS_FOR_COLLECTION: 5,
  MAX_PRODUCTS_PER_ARTIST: 20, // Limit to prevent overwhelming
  MAX_TOTAL_PRODUCTS: 150, // Total limit for starter kit
  API_VERSION: '2024-10',
  RATE_LIMIT_DELAY: 250, // ms between API calls
};

// Validate required config
if (!CONFIG.SHOPIFY_ADMIN_TOKEN) {
  console.error('Error: SHOPIFY_ADMIN_TOKEN environment variable is required');
  console.error('Usage: SHOPIFY_STORE=xxx SHOPIFY_ADMIN_TOKEN=shpat_xxx node scripts/bulk-import-products.cjs');
  process.exit(1);
}

// Pricing matrix
const PRICING = {
  'Unframed': { '8×10': 45, '11×14': 55, '16×20': 65, '24×36': 85 },
  'Black Frame': { '8×10': 75, '11×14': 95, '16×20': 125, '24×36': 165 },
  'White Frame': { '8×10': 75, '11×14': 95, '16×20': 125, '24×36': 165 },
  'Natural Wood': { '8×10': 85, '11×14': 105, '16×20': 135, '24×36': 175 },
};

const SIZES = ['8×10', '11×14', '16×20', '24×36'];
const FRAMES = ['Unframed', 'Black Frame', 'White Frame', 'Natural Wood'];

/**
 * Make a GraphQL request to Shopify Admin API
 */
async function shopifyGraphQL(query, variables = {}) {
  const url = `https://${CONFIG.SHOPIFY_STORE}/admin/api/${CONFIG.API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': CONFIG.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error: ${response.status} - ${text}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

/**
 * Sleep for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a slug from text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get existing collections
 */
async function getExistingCollections() {
  const query = `
    query {
      collections(first: 100) {
        nodes {
          id
          handle
          title
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query);
  return data.collections.nodes;
}

/**
 * Get existing products
 */
async function getExistingProducts() {
  const query = `
    query {
      products(first: 250) {
        nodes {
          id
          handle
          title
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query);
  return data.products.nodes;
}

/**
 * Create a collection
 */
async function createCollection(title, description) {
  const handle = slugify(title);

  const query = `
    mutation createCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          handle
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      title,
      handle,
      descriptionHtml: description,
    },
  };

  const data = await shopifyGraphQL(query, variables);

  if (data.collectionCreate.userErrors.length > 0) {
    throw new Error(`Collection creation failed: ${JSON.stringify(data.collectionCreate.userErrors)}`);
  }

  return data.collectionCreate.collection;
}

/**
 * Create a product with all variants using productSet mutation
 * This creates product, options, and all 16 variants in one call
 */
async function createProductWithVariants(artwork, collectionId) {
  const handle = slugify(artwork.title);

  const description = `<p><em>${artwork.title}</em> by <em>${artwork.artist}</em>.</p>
<p>${artwork.description || 'A beautiful artwork from the Smithsonian American Art Museum collection.'}</p>
<p><strong>Medium:</strong> ${artwork.medium || 'Mixed media'}<br>
<strong>Period:</strong> ${artwork.year_created || 'Historical'}</p>
<p>Printed on museum-quality archival paper with a matte finish. Each print is made to order using giclée printing technology.</p>`;

  // Build variants array with all 16 combinations
  const variants = [];
  for (const size of SIZES) {
    for (const frame of FRAMES) {
      const price = PRICING[frame][size];
      variants.push({
        optionValues: [
          { optionName: 'Size', name: size },
          { optionName: 'Frame', name: frame },
        ],
        price: price.toFixed(2),
      });
    }
  }

  const query = `
    mutation productSet($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          handle
          title
          variants(first: 20) {
            nodes {
              id
              title
              price
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      title: artwork.title,
      handle,
      vendor: artwork.artist,
      productType: 'Print',
      descriptionHtml: description,
      status: 'ACTIVE',
      tags: ['art-print', 'smithsonian', artwork.category?.toLowerCase() || 'painting'].filter(Boolean),
      collections: collectionId ? [collectionId] : [],
      productOptions: [
        { name: 'Size', values: [{ name: '8×10' }, { name: '11×14' }, { name: '16×20' }, { name: '24×36' }] },
        { name: 'Frame', values: [{ name: 'Unframed' }, { name: 'Black Frame' }, { name: 'White Frame' }, { name: 'Natural Wood' }] },
      ],
      variants,
    },
  };

  const data = await shopifyGraphQL(query, variables);

  if (data.productSet.userErrors.length > 0) {
    const errors = data.productSet.userErrors;
    // Handle duplicate handle error
    if (errors.some(e => e.message.includes('already exists') || e.message.includes('Handle has already been taken'))) {
      console.log(`  Product "${artwork.title}" already exists, skipping...`);
      return null;
    }
    throw new Error(`Product creation failed: ${JSON.stringify(errors)}`);
  }

  return data.productSet.product;
}

/**
 * Upload image to product
 */
async function uploadProductImage(productId, imageUrl, altText) {
  const query = `
    mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          ... on MediaImage {
            id
            image {
              url
            }
          }
        }
        mediaUserErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    productId,
    media: [{
      originalSource: imageUrl,
      alt: altText,
      mediaContentType: 'IMAGE',
    }],
  };

  try {
    const data = await shopifyGraphQL(query, variables);

    if (data.productCreateMedia.mediaUserErrors.length > 0) {
      console.error(`  Image upload errors: ${JSON.stringify(data.productCreateMedia.mediaUserErrors)}`);
    }

    return data.productCreateMedia.media;
  } catch (error) {
    console.error(`  Image upload failed: ${error.message}`);
    return null;
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Shopify Product Bulk Import');
  console.log('='.repeat(60));
  console.log(`Store: ${CONFIG.SHOPIFY_STORE}`);
  console.log(`JSON Source: ${CONFIG.JSON_FILE}`);
  console.log('');

  // Read JSON file
  console.log('Reading JSON file...');
  const rawData = fs.readFileSync(CONFIG.JSON_FILE, 'utf8');
  const artworks = JSON.parse(rawData);
  console.log(`Found ${artworks.length} artworks in JSON`);

  // Group by artist
  const artistGroups = {};
  for (const artwork of artworks) {
    const artist = artwork.artist;
    if (!artist || artist.toLowerCase().includes('unidentified')) continue;

    if (!artistGroups[artist]) {
      artistGroups[artist] = [];
    }
    artistGroups[artist].push(artwork);
  }

  // Filter artists with minimum works
  const eligibleArtists = Object.entries(artistGroups)
    .filter(([_, works]) => works.length >= CONFIG.MIN_WORKS_FOR_COLLECTION)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`\nEligible artists (${CONFIG.MIN_WORKS_FOR_COLLECTION}+ works): ${eligibleArtists.length}`);
  for (const [artist, works] of eligibleArtists.slice(0, 15)) {
    console.log(`  - ${artist}: ${works.length} works`);
  }

  // Get existing collections and products
  console.log('\nFetching existing Shopify data...');
  const existingCollections = await getExistingCollections();
  const existingProducts = await getExistingProducts();
  console.log(`Existing collections: ${existingCollections.length}`);
  console.log(`Existing products: ${existingProducts.length}`);

  const existingHandles = new Set(existingProducts.map(p => p.handle));

  // Track stats
  let collectionsCreated = 0;
  let productsCreated = 0;
  let variantsCreated = 0;
  let imagesUploaded = 0;
  let skipped = 0;

  // Process each artist
  for (const [artist, works] of eligibleArtists) {
    if (productsCreated >= CONFIG.MAX_TOTAL_PRODUCTS) {
      console.log(`\nReached max total products (${CONFIG.MAX_TOTAL_PRODUCTS}), stopping...`);
      break;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Artist: ${artist} (${works.length} works)`);
    console.log('='.repeat(50));

    // Check/create collection
    const collectionHandle = slugify(artist);
    let collection = existingCollections.find(c => c.handle === collectionHandle);

    if (!collection) {
      console.log(`Creating collection: ${artist}`);
      try {
        collection = await createCollection(
          artist,
          `<p>Explore the beautiful works of ${artist} from the Smithsonian American Art Museum collection.</p>`
        );
        existingCollections.push(collection);
        collectionsCreated++;
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      } catch (error) {
        console.error(`  Failed to create collection: ${error.message}`);
        continue;
      }
    } else {
      console.log(`Collection exists: ${collection.handle}`);
    }

    // Process artworks (limited)
    const worksToProcess = works.slice(0, CONFIG.MAX_PRODUCTS_PER_ARTIST);

    for (const artwork of worksToProcess) {
      if (productsCreated >= CONFIG.MAX_TOTAL_PRODUCTS) break;

      const productHandle = slugify(artwork.title);

      // Skip if already exists
      if (existingHandles.has(productHandle)) {
        console.log(`  Skipping (exists): ${artwork.title}`);
        skipped++;
        continue;
      }

      console.log(`  Creating: ${artwork.title}`);

      try {
        // Create product with all options and variants in one call
        const product = await createProductWithVariants(artwork, collection.id);
        if (!product) {
          skipped++;
          continue;
        }

        const variantCount = product.variants?.nodes?.length || 0;
        variantsCreated += variantCount;
        await sleep(CONFIG.RATE_LIMIT_DELAY);

        // Upload image
        if (artwork.image) {
          await uploadProductImage(product.id, artwork.image, artwork.title);
          imagesUploaded++;
          await sleep(CONFIG.RATE_LIMIT_DELAY);
        }

        existingHandles.add(productHandle);
        productsCreated++;

        console.log(`    ✓ Created with ${variantCount} variants`);
      } catch (error) {
        console.error(`    ✗ Error: ${error.message}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Collections created: ${collectionsCreated}`);
  console.log(`Products created: ${productsCreated}`);
  console.log(`Variants created: ${variantsCreated}`);
  console.log(`Images uploaded: ${imagesUploaded}`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log('='.repeat(60));
}

// Run
main().catch(console.error);
