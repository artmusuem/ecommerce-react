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
    </main>
  );
}
