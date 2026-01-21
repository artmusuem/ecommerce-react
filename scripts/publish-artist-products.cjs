/**
 * Publish Products for Target Artists
 *
 * Publishes up to 12 products for each target artist to make them visible
 * in the Storefront API.
 */

const CONFIG = {
  SHOPIFY_STORE: process.env.SHOPIFY_STORE || 'your-store.myshopify.com',
  SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN || '',
  API_VERSION: '2024-10',
  MAX_PER_ARTIST: 12,
  TARGET_ARTISTS: [
    'Winslow Homer',
    'Mary Cassatt',
    'Thomas Cole',
    'George Inness',
    'Thomas Moran',
    'Henry Ossawa Tanner',
    'Tanner, Henry Ossawa'
  ],
  RATE_LIMIT_DELAY: 300,
};

if (!CONFIG.SHOPIFY_ADMIN_TOKEN) {
  console.error('Error: SHOPIFY_ADMIN_TOKEN environment variable is required');
  console.error('Usage: SHOPIFY_STORE=xxx SHOPIFY_ADMIN_TOKEN=shpat_xxx node scripts/publish-artist-products.cjs');
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getProductsByArtist(artist) {
  const url = `https://${CONFIG.SHOPIFY_STORE}/admin/api/${CONFIG.API_VERSION}/products.json?limit=50&vendor=${encodeURIComponent(artist)}`;

  const response = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': CONFIG.SHOPIFY_ADMIN_TOKEN },
  });

  const data = await response.json();
  return data.products || [];
}

async function publishProduct(productId) {
  const url = `https://${CONFIG.SHOPIFY_STORE}/admin/api/${CONFIG.API_VERSION}/products/${productId}.json`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': CONFIG.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({
      product: {
        published: true,
        status: 'active'
      }
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to publish: ${response.status} - ${text}`);
  }

  return response.json();
}

async function main() {
  console.log('='.repeat(60));
  console.log('Publish Products for Target Artists');
  console.log('='.repeat(60));
  console.log(`Store: ${CONFIG.SHOPIFY_STORE}`);
  console.log(`Max per artist: ${CONFIG.MAX_PER_ARTIST}`);
  console.log('');

  let totalPublished = 0;
  const artistResults = {};

  for (const artist of CONFIG.TARGET_ARTISTS) {
    console.log(`\nProcessing: ${artist}`);

    const products = await getProductsByArtist(artist);
    console.log(`  Found ${products.length} products`);

    if (products.length === 0) continue;

    // Take up to MAX_PER_ARTIST products
    const toPublish = products.slice(0, CONFIG.MAX_PER_ARTIST);
    let published = 0;

    for (const product of toPublish) {
      // Skip if already published and active
      if (product.published_at && product.status === 'active') {
        console.log(`  ✓ Already published: ${product.title}`);
        published++;
        continue;
      }

      try {
        await publishProduct(product.id);
        console.log(`  ✓ Published: ${product.title}`);
        published++;
        totalPublished++;
        await sleep(CONFIG.RATE_LIMIT_DELAY);
      } catch (error) {
        console.log(`  ✗ Failed: ${product.title} - ${error.message}`);
      }
    }

    artistResults[artist] = published;
  }

  console.log('\n' + '='.repeat(60));
  console.log('PUBLISH COMPLETE');
  console.log('='.repeat(60));
  console.log('Results by artist:');
  for (const [artist, count] of Object.entries(artistResults)) {
    if (count > 0) {
      console.log(`  ${artist}: ${count} products`);
    }
  }
  console.log(`\nTotal newly published: ${totalPublished}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
