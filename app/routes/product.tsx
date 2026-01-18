import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/product";
import { fetchShopifyProduct } from "@/data/shopify-api";
import { getResizedImage, IMAGE_SIZES } from "@/utils/images";
import { useCartDispatch } from "@/context/CartContext";
import { useState, useMemo } from "react";
import type { ProductVariant } from "@/types";

// Frame color mapping for preview
const frameColors: Record<string, string> = {
  'Unframed': '#f5f5f5',
  'Black Frame': '#1a1a1a',
  'White Frame': '#ffffff',
  'Natural Wood': '#c4a574',
};

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
    <main className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link to="/" className="text-primary hover:underline text-sm">
          ← Back to Gallery
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            <div
              className="aspect-square rounded-xl overflow-hidden bg-white shadow-lg"
              style={{
                border: selectedFrame !== 'Unframed'
                  ? `12px solid ${frameColors[selectedFrame]}`
                  : undefined
              }}
            >
              <img
                src={previewSrc}
                alt={product.title}
                className="w-full h-full object-contain"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <p className="text-lg text-gray-600">{product.artist}</p>
            </div>

            <p className="text-gray-700">{product.description}</p>

            {/* Size selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
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

            {/* Frame selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frame
              </label>
              <div className="flex flex-wrap gap-2">
                {frames.map(frame => (
                  <button
                    key={frame}
                    onClick={() => setSelectedFrame(frame)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      selectedFrame === frame
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {frame}
                  </button>
                ))}
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${price.toFixed(2)}
                </span>
                {selectedVariant?.availableForSale === false && (
                  <span className="text-red-500 text-sm">Out of stock</span>
                )}
              </div>

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
