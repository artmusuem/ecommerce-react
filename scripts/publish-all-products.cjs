/**
 * Publish All Products to Sales Channel
 *
 * This script publishes all existing products to the Online Store sales channel,
 * making them visible via the Storefront API.
 *
 * Usage: node scripts/publish-all-products.cjs
 */

const CONFIG = {
  SHOPIFY_STORE: process.env.SHOPIFY_STORE || 'dev-store-749237498237498787.myshopify.com',
  SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN || '',
  API_VERSION: '2024-10',
  RATE_LIMIT_DELAY: 250,
};

if (!CONFIG.SHOPIFY_ADMIN_TOKEN) {
  console.error('Error: SHOPIFY_ADMIN_TOKEN environment variable is required');
  process.exit(1);
}

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get all publications (sales channels)
 */
async function getPublications() {
  const query = `
    query {
      publications(first: 20) {
        nodes {
          id
          name
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query);
  return data.publications.nodes;
}

/**
 * Get all products
 */
async function getAllProducts() {
  const products = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              handle
              status
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const data = await shopifyGraphQL(query, { first: 50, after: cursor });

    products.push(...data.products.edges.map(e => e.node));
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

/**
 * Get current publications for a product
 */
async function getProductPublications(productId) {
  const query = `
    query getProductPublications($id: ID!) {
      product(id: $id) {
        resourcePublicationsV2(first: 20) {
          edges {
            node {
              publication {
                id
                name
              }
              isPublished
            }
          }
        }
      }
    }
  `;

  const data = await shopifyGraphQL(query, { id: productId });
  return data.product?.resourcePublicationsV2?.edges || [];
}

/**
 * Publish product to sales channel
 */
async function publishProduct(productId, publicationId) {
  const query = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable {
          ... on Product {
            id
            handle
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
    id: productId,
    input: [{ publicationId }],
  };

  const data = await shopifyGraphQL(query, variables);

  if (data.publishablePublish.userErrors.length > 0) {
    console.error(`  Publish errors: ${JSON.stringify(data.publishablePublish.userErrors)}`);
    return false;
  }

  return true;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Publish All Products to Sales Channel');
  console.log('='.repeat(60));
  console.log(`Store: ${CONFIG.SHOPIFY_STORE}`);
  console.log('');

  // Get all publications
  console.log('Fetching sales channels...');
  const publications = await getPublications();
  console.log('Available sales channels:');
  publications.forEach(p => console.log(`  - ${p.name} (${p.id})`));

  // Find Online Store publication
  const onlineStore = publications.find(p =>
    p.name.toLowerCase().includes('online store') ||
    p.name.toLowerCase().includes('headless')
  ) || publications[0];

  if (!onlineStore) {
    console.error('No sales channel found!');
    process.exit(1);
  }

  console.log(`\nUsing sales channel: ${onlineStore.name}`);
  console.log('');

  // Get all products
  console.log('Fetching all products...');
  const products = await getAllProducts();
  console.log(`Found ${products.length} products`);
  console.log('');

  if (products.length === 0) {
    console.log('No products to publish.');
    return;
  }

  // Publish each product
  let published = 0;
  let alreadyPublished = 0;
  let failed = 0;

  for (const product of products) {
    // Check if already published
    const currentPubs = await getProductPublications(product.id);
    const isPublished = currentPubs.some(
      e => e.node.publication.id === onlineStore.id && e.node.isPublished
    );

    if (isPublished) {
      console.log(`  ✓ Already published: ${product.title}`);
      alreadyPublished++;
      continue;
    }

    // Publish
    console.log(`  Publishing: ${product.title}`);
    const success = await publishProduct(product.id, onlineStore.id);

    if (success) {
      published++;
      console.log(`    ✓ Published`);
    } else {
      failed++;
      console.log(`    ✗ Failed`);
    }

    await sleep(CONFIG.RATE_LIMIT_DELAY);
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('PUBLISH COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total products: ${products.length}`);
  console.log(`Already published: ${alreadyPublished}`);
  console.log(`Newly published: ${published}`);
  console.log(`Failed: ${failed}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
