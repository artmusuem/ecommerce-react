/**
 * Bulk Product Upload Script for Shopify
 *
 * Two approaches for different scales:
 *
 * 1. Sequential GraphQL (< 100 products)
 *    - Use `productSet` mutation (creates product + options + variants in one call)
 *    - Then `productCreateMedia` for images
 *    - Then `publishablePublish` to make visible via Storefront API
 *    - See: scripts/bulk-import-products.cjs for production example
 *
 * 2. Bulk Operations API (100+ products)
 *    - Upload JSONL file via staged uploads
 *    - Shopify processes async - no rate limits
 *    - Poll for completion or use webhooks
 *
 * IMPORTANT SEQUENCE (can't be parallelized):
 * 1. Create product → returns product ID
 * 2. Create variants → requires product ID (or use productSet for all-in-one)
 * 3. Upload images → requires product ID
 * 4. Publish → requires product ID
 *
 * Usage:
 *   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxx \
 *   npx tsx scripts/bulk-product-upload.ts
 */

import 'dotenv/config';

// Types
interface ProductInput {
  title: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  variants?: VariantInput[];
  images?: ImageInput[];
}

interface VariantInput {
  price: string;
  compareAtPrice?: string;
  sku?: string;
  barcode?: string;
  inventoryQuantity?: number;
  options?: string[];
  weight?: number;
  weightUnit?: 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES';
}

interface ImageInput {
  src: string;
  altText?: string;
}

interface ShopifyConfig {
  storeDomain: string;
  accessToken: string;
}

// GraphQL client
async function shopifyGraphQL(
  config: ShopifyConfig,
  query: string,
  variables?: Record<string, unknown>
): Promise<unknown> {
  const url = `https://${config.storeDomain}/admin/api/2024-01/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors, null, 2)}`);
  }

  return data;
}

// Rate limit helper - Shopify allows ~2 requests/second for REST, more for GraphQL
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * APPROACH 1: Sequential GraphQL Mutations using productSet
 * Best for: < 100 products, immediate feedback needed
 *
 * productSet creates product + options + variants in ONE call
 * Then: productCreateMedia for images
 */
async function createProductSequential(
  config: ShopifyConfig,
  product: ProductInput
): Promise<{ productId: string; variantIds: string[] }> {

  // Use productSet mutation - creates product, options, and variants in one call
  const productSetMutation = `
    mutation productSet($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          title
          handle
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

  // Build variants array for productSet
  const variants = product.variants?.map(v => ({
    optionValues: v.options?.map(opt => ({
      optionName: 'Size',
      name: opt,
    })) || [],
    price: v.price,
    sku: v.sku,
  })) || [];

  // Extract unique option values for productOptions
  const optionValues = [...new Set(product.variants?.flatMap(v => v.options || []) || [])];

  const productInput: Record<string, unknown> = {
    title: product.title,
    descriptionHtml: product.descriptionHtml || '',
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    status: product.status || 'DRAFT',
  };

  // Add options and variants if provided
  if (optionValues.length > 0) {
    productInput.productOptions = [{
      name: 'Size',
      values: optionValues.map(v => ({ name: v })),
    }];
    productInput.variants = variants;
  }

  console.log(`Creating product: ${product.title}`);

  const createResult = await shopifyGraphQL(config, productSetMutation, {
    input: productInput,
  }) as { data: { productSet: { product: { id: string; variants: { nodes: { id: string }[] } }; userErrors: { field: string; message: string }[] } } };

  const { productSet } = createResult.data;

  if (productSet.userErrors.length > 0) {
    throw new Error(`Product create errors: ${JSON.stringify(productSet.userErrors)}`);
  }

  const productId = productSet.product.id;
  const variantIds = productSet.product.variants.nodes.map(n => n.id);

  console.log(`  Created product: ${productId}`);
  console.log(`  Variants created: ${variantIds.length}`);

  // Step 2: Upload images if provided
  if (product.images && product.images.length > 0) {
    const mediaIds = await uploadProductImages(config, productId, product.images);

    // Step 3: Assign images to variants (1:1 mapping by index)
    if (mediaIds.length > 0 && variantIds.length > 0) {
      await assignImagesToVariants(config, productId, variantIds, mediaIds);
    }
  }

  return { productId, variantIds };
}

/**
 * Upload images to a product
 * Uses productCreateMedia mutation for URL-based uploads
 */
async function uploadProductImages(
  config: ShopifyConfig,
  productId: string,
  images: ImageInput[]
): Promise<string[]> {

  const createMediaMutation = `
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

  const mediaInput = images.map(img => ({
    originalSource: img.src,
    alt: img.altText || '',
    mediaContentType: 'IMAGE',
  }));

  console.log(`  Uploading ${images.length} images...`);

  const result = await shopifyGraphQL(config, createMediaMutation, {
    productId,
    media: mediaInput,
  }) as { data: { productCreateMedia: { media: { id: string }[]; mediaUserErrors: { field: string; message: string }[] } } };

  const { productCreateMedia } = result.data;

  if (productCreateMedia.mediaUserErrors.length > 0) {
    console.warn(`  Image upload warnings: ${JSON.stringify(productCreateMedia.mediaUserErrors)}`);
  }

  const mediaIds = productCreateMedia.media.map(m => m.id);
  console.log(`  Uploaded ${mediaIds.length} images`);

  return mediaIds;
}

/**
 * Assign images to variants - maps by index (image[0] -> variant[0], etc.)
 * If fewer images than variants, last image is reused for remaining variants
 * Uses productVariantsBulkUpdate mutation
 */
async function assignImagesToVariants(
  config: ShopifyConfig,
  productId: string,
  variantIds: string[],
  mediaIds: string[]
): Promise<void> {

  const bulkUpdateMutation = `
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          image {
            url
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Map each variant to its corresponding image by index
  // If fewer images than variants, reuse the last image
  const variantsInput = variantIds.map((id, index) => ({
    id,
    mediaId: mediaIds[Math.min(index, mediaIds.length - 1)],
  }));

  console.log(`  Assigning ${mediaIds.length} images to ${variantIds.length} variants...`);

  const result = await shopifyGraphQL(config, bulkUpdateMutation, {
    productId,
    variants: variantsInput,
  }) as { data: { productVariantsBulkUpdate: { productVariants: { id: string; title: string }[]; userErrors: { field: string; message: string }[] } } };

  const { productVariantsBulkUpdate } = result.data;

  if (productVariantsBulkUpdate.userErrors.length > 0) {
    console.warn(`  Variant image assignment errors: ${JSON.stringify(productVariantsBulkUpdate.userErrors)}`);
  } else {
    console.log(`  Assigned images to ${productVariantsBulkUpdate.productVariants.length} variants`);
  }
}

/**
 * APPROACH 2: Bulk Operations API
 * Best for: 100+ products, background processing OK
 *
 * Steps:
 * 1. Create JSONL file with mutations
 * 2. Upload via stagedUploadsCreate
 * 3. Run bulkOperationRunMutation
 * 4. Poll for completion
 */
async function createProductsBulk(
  config: ShopifyConfig,
  products: ProductInput[]
): Promise<string> {

  // Step 1: Create staged upload URL
  const stagedUploadMutation = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  console.log('Creating staged upload...');

  const stagedResult = await shopifyGraphQL(config, stagedUploadMutation, {
    input: [{
      resource: 'BULK_MUTATION_VARIABLES',
      filename: 'bulk-products.jsonl',
      mimeType: 'text/jsonl',
      httpMethod: 'POST',
    }],
  }) as { data: { stagedUploadsCreate: { stagedTargets: { url: string; resourceUrl: string; parameters: { name: string; value: string }[] }[]; userErrors: { field: string; message: string }[] } } };

  const target = stagedResult.data.stagedUploadsCreate.stagedTargets[0];

  if (!target) {
    throw new Error('Failed to create staged upload');
  }

  // Step 2: Generate JSONL content
  const jsonlLines = products.map(product => {
    const input: Record<string, unknown> = {
      title: product.title,
      descriptionHtml: product.descriptionHtml || '',
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags,
      status: product.status || 'DRAFT',
    };

    if (product.variants) {
      input.variants = product.variants.map(v => ({
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        sku: v.sku,
        options: v.options,
      }));
    }

    return JSON.stringify({ input });
  });

  const jsonlContent = jsonlLines.join('\n');
  console.log(`Generated JSONL with ${products.length} products`);

  // Step 3: Upload JSONL to staged URL
  const formData = new FormData();

  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }

  formData.append('file', new Blob([jsonlContent], { type: 'text/jsonl' }), 'bulk-products.jsonl');

  const uploadResponse = await fetch(target.url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload JSONL: ${uploadResponse.status}`);
  }

  console.log('Uploaded JSONL file');

  // Step 4: Start bulk operation
  const bulkMutation = `
    mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
      bulkOperationRunMutation(
        mutation: $mutation
        stagedUploadPath: $stagedUploadPath
      ) {
        bulkOperation {
          id
          status
          url
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const productCreateMutation = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  console.log('Starting bulk operation...');

  const bulkResult = await shopifyGraphQL(config, bulkMutation, {
    mutation: productCreateMutation,
    stagedUploadPath: target.resourceUrl,
  }) as { data: { bulkOperationRunMutation: { bulkOperation: { id: string; status: string }; userErrors: { field: string; message: string }[] } } };

  const { bulkOperationRunMutation } = bulkResult.data;

  if (bulkOperationRunMutation.userErrors.length > 0) {
    throw new Error(`Bulk operation errors: ${JSON.stringify(bulkOperationRunMutation.userErrors)}`);
  }

  const operationId = bulkOperationRunMutation.bulkOperation.id;
  console.log(`Bulk operation started: ${operationId}`);

  // Step 5: Poll for completion
  return await pollBulkOperation(config, operationId);
}

/**
 * Poll bulk operation until complete
 */
async function pollBulkOperation(
  config: ShopifyConfig,
  operationId: string
): Promise<string> {

  const pollQuery = `
    query bulkOperationStatus($id: ID!) {
      node(id: $id) {
        ... on BulkOperation {
          id
          status
          errorCode
          objectCount
          url
        }
      }
    }
  `;

  let status = 'RUNNING';
  let resultUrl = '';

  while (status === 'RUNNING' || status === 'CREATED') {
    await sleep(2000); // Poll every 2 seconds

    const result = await shopifyGraphQL(config, pollQuery, { id: operationId }) as {
      data: { node: { status: string; errorCode?: string; objectCount: number; url?: string } }
    };

    const operation = result.data.node;
    status = operation.status;

    console.log(`  Status: ${status}, Objects: ${operation.objectCount}`);

    if (status === 'COMPLETED') {
      resultUrl = operation.url || '';
    } else if (status === 'FAILED') {
      throw new Error(`Bulk operation failed: ${operation.errorCode}`);
    }
  }

  console.log('Bulk operation completed!');
  return resultUrl;
}

/**
 * Batch processor with rate limiting
 * Processes products in batches with delays between batches
 */
async function processBatch(
  config: ShopifyConfig,
  products: ProductInput[],
  batchSize: number = 10,
  delayMs: number = 1000
): Promise<{ productId: string; variantIds: string[] }[]> {

  const results: { productId: string; variantIds: string[] }[] = [];

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);

    for (const product of batch) {
      try {
        const result = await createProductSequential(config, product);
        results.push(result);
        await sleep(500); // Small delay between products
      } catch (error) {
        console.error(`Failed to create "${product.title}":`, error);
      }
    }

    // Delay between batches to respect rate limits
    if (i + batchSize < products.length) {
      console.log(`Waiting ${delayMs}ms before next batch...`);
      await sleep(delayMs);
    }
  }

  return results;
}

// Sample products for testing - each variant gets its own image
const sampleProducts: ProductInput[] = [
  {
    title: 'Test Artwork - Sunset Valley',
    descriptionHtml: '<p>A beautiful sunset over rolling hills.</p>',
    vendor: 'Gallery Store',
    productType: 'Art Print',
    tags: ['landscape', 'sunset', 'nature'],
    status: 'DRAFT',
    variants: [
      { price: '49.99', sku: 'SV-SMALL', options: ['Small'] },
      { price: '79.99', sku: 'SV-MEDIUM', options: ['Medium'] },
      { price: '129.99', sku: 'SV-LARGE', options: ['Large'] },
    ],
    images: [
      { src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', altText: 'Sunset Valley - Small' },
      { src: 'https://res.cloudinary.com/demo/image/upload/cld-sample.jpg', altText: 'Sunset Valley - Medium' },
      { src: 'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg', altText: 'Sunset Valley - Large' },
    ],
  },
  {
    title: 'Test Artwork - Ocean Waves',
    descriptionHtml: '<p>Crashing waves on a rocky shore.</p>',
    vendor: 'Gallery Store',
    productType: 'Art Print',
    tags: ['seascape', 'ocean', 'nature'],
    status: 'DRAFT',
    variants: [
      { price: '49.99', sku: 'OW-SMALL', options: ['Small'] },
      { price: '79.99', sku: 'OW-MEDIUM', options: ['Medium'] },
      { price: '129.99', sku: 'OW-LARGE', options: ['Large'] },
    ],
    images: [
      { src: 'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg', altText: 'Ocean Waves - Small' },
      { src: 'https://res.cloudinary.com/demo/image/upload/cld-sample-4.jpg', altText: 'Ocean Waves - Medium' },
      { src: 'https://res.cloudinary.com/demo/image/upload/cld-sample-5.jpg', altText: 'Ocean Waves - Large' },
    ],
  },
];

// Main execution
async function main() {
  const config: ShopifyConfig = {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE || '',
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
  };

  if (!config.storeDomain || !config.accessToken) {
    console.error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN');
    console.log('\nUsage:');
    console.log('  SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \\');
    console.log('  SHOPIFY_ACCESS_TOKEN=shpat_xxx \\');
    console.log('  npx tsx scripts/bulk-product-upload.ts');
    process.exit(1);
  }

  console.log(`\nConnecting to: ${config.storeDomain}`);
  console.log('=' .repeat(50));

  // For small batches (< 50), use sequential
  if (sampleProducts.length < 50) {
    console.log('\nUsing sequential upload (small batch)...\n');
    const results = await processBatch(config, sampleProducts, 5, 1000);
    console.log(`\nCreated ${results.length} products`);
    results.forEach(r => console.log(`  - ${r.productId}`));
  } else {
    // For large batches, use bulk operations
    console.log('\nUsing Bulk Operations API (large batch)...\n');
    const resultUrl = await createProductsBulk(config, sampleProducts);
    console.log(`\nResults available at: ${resultUrl}`);
  }
}

// Run if executed directly
main().catch(console.error);

export {
  createProductSequential,
  createProductsBulk,
  processBatch,
  uploadProductImages,
  type ProductInput,
  type VariantInput,
  type ImageInput,
  type ShopifyConfig,
};
