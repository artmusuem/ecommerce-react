import { useLoaderData, Link } from "react-router";
// @ts-expect-error - React Router 7 generates these types at build time
import type { Route } from "./+types/product";
import { fetchShopifyProduct } from "@/data/shopify-api";
import { getResizedImage, IMAGE_SIZES } from "@/utils/images";
import { useCartDispatch } from "@/context/CartContext";
import { useState, useMemo } from "react";
import type { ProductVariant } from "@/types";
import FramePreview from "@/components/product/FramePreview";
import FrameIcon from "@/components/product/FrameIcon";

// Details section component
function ProductDetails({
  title,
  artist,
  description,
  smithsonianUrl
}: {
  title: string
  artist: string
  description: string
  smithsonianUrl?: string
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="border-t border-gray-200 mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Collapsible header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between text-left group"
          aria-expanded={isOpen}
        >
          <h2 className="text-sm font-semibold tracking-widest text-gray-900 uppercase">
            Details
          </h2>
          <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
            {isOpen ? '−' : '+'}
          </span>
        </button>

        {/* Collapsible content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Rich description */}
          <p className="text-gray-700 leading-relaxed mb-4">
            <em className="text-gray-900">{title}</em> by{' '}
            <em className="text-gray-900">{artist}</em>
            {description && `. ${description}`}
          </p>

          {/* Print quality info */}
          <p className="text-gray-600 leading-relaxed mb-6">
            Printed on museum-quality archival paper with a matte finish.
            Each print is made to order using giclée printing technology,
            ensuring exceptional color accuracy and longevity.
          </p>

          {/* Smithsonian link */}
          {smithsonianUrl && (
            <a
              href={smithsonianUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
            >
              View Original at Smithsonian
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// Server-side data loading
export async function loader({ params }: Route.LoaderArgs) {
  const product = await fetchShopifyProduct(params.id || "");

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return { product };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.product ? `${data.product.title} - Gallery Store` : "Product - Gallery Store" },
    { name: "description", content: data?.product?.description || "Art print from the Smithsonian" },
  ];
}

export default function Product() {
  const { product } = useLoaderData<typeof loader>();
  const dispatch = useCartDispatch();

  // Get options
  const sizeOption = product?.options?.find(o => o.name === 'Size');
  const frameOption = product?.options?.find(o => o.name === 'Frame');
  const sizes = sizeOption?.values || ['8×10'];
  const frames = frameOption?.values || ['Unframed'];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);
  const [added, setAdded] = useState(false);

  // Find selected variant
  const selectedVariant = useMemo((): ProductVariant | undefined => {
    if (!product?.variants) return undefined;
    return product.variants.find(v =>
      v.selectedOptions.some(o => o.name === 'Size' && o.value === selectedSize) &&
      v.selectedOptions.some(o => o.name === 'Frame' && o.value === selectedFrame)
    );
  }, [product?.variants, selectedSize, selectedFrame]);

  const price = selectedVariant ? parseFloat(selectedVariant.price) : 0;
  const previewSrc = getResizedImage(product.image, IMAGE_SIZES.preview);

  // Construct Smithsonian URL: https://www.si.edu/object/{title-slug}:{accession_number}
  const getSmithsonianSlug = (title: string): string => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')          // Replace spaces with dashes
      .replace(/-+/g, '-')           // Replace multiple dashes with single dash
      .replace(/^-|-$/g, '')         // Trim leading/trailing dashes
  };

  const smithsonianUrl = product.accession_number
    ? `https://www.si.edu/object/${getSmithsonianSlug(product.title)}:${product.accession_number}`
    : undefined;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        variantId: selectedVariant.id,
        sizeId: selectedSize,
        frameId: selectedFrame,
        title: product.title,
        artist: product.artist || '',
        image: product.image,
        price: parseFloat(selectedVariant.price) || 0
      }
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="bg-gray-50 min-h-screen page-enter">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/" className="text-primary hover:underline text-sm">
          ← Back to Gallery
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Frame Preview */}
          <FramePreview
            imageSrc={previewSrc}
            imageAlt={product.title}
            frameType={selectedFrame}
            size={selectedSize}
          />

          {/* Details */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">
              {product.title}
            </h1>

            {/* Subtitle (Artist) */}
            <p className="text-lg text-gray-600">{product.artist}</p>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
              {selectedVariant?.availableForSale === false && (
                <span className="text-red-500 text-sm">Out of stock</span>
              )}
            </div>

            {/* Frame selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Frame
              </label>
              <div className="flex flex-wrap gap-1">
                {frames.map(frame => (
                  <FrameIcon
                    key={frame}
                    frameType={frame}
                    selected={selectedFrame === frame}
                    onClick={() => setSelectedFrame(frame)}
                  />
                ))}
              </div>
            </div>

            {/* Size/Dimensions selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.availableForSale === false}
                className={`w-full py-4 rounded-xl text-lg font-semibold transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'btn-primary'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <ProductDetails
        title={product.title}
        artist={product.artist || 'Unknown Artist'}
        description={product.description}
        smithsonianUrl={smithsonianUrl}
      />
    </main>
  );
}
