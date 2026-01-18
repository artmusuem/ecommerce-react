import { useLoaderData, useSearchParams, Link } from "react-router";
import type { Route } from "./+types/home";
import { fetchShopifyProducts, fetchCollections, fetchCollectionProducts } from "../../src/data/shopify-api";
import { getResizedImage, IMAGE_SIZES } from "../../src/utils/images";
import type { Product, Collection } from "../../src/types";

// Server-side data loading - this runs on the server BEFORE HTML is sent
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const collectionHandle = url.searchParams.get("collection");

  // Fetch data on server - no client-side loading delay!
  const [products, collections] = await Promise.all([
    collectionHandle
      ? fetchCollectionProducts(collectionHandle)
      : fetchShopifyProducts(),
    fetchCollections(),
  ]);

  return { products, collections, selectedCollection: collectionHandle };
}

// Meta tags for SEO
export function meta() {
  return [
    { title: "Gallery Store - Smithsonian Art Prints" },
    { name: "description", content: "Museum-quality art prints from the Smithsonian American Art Museum." },
  ];
}

// Product Card Component - rendered server-side with products
function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const price = product.priceRange?.minPrice
    ? parseFloat(product.priceRange.minPrice)
    : 45;

  const thumbnailSrc = getResizedImage(product.image, IMAGE_SIZES.thumbnail);

  return (
    <Link
      to={`/product/${encodeURIComponent(product.id)}`}
      className="group block rounded-xl overflow-hidden card-lift bg-white"
    >
      <div className="aspect-square overflow-hidden relative bg-gray-100">
        <img
          src={thumbnailSrc}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
          <span className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-800">
            View Print
          </span>
        </div>
      </div>
      <div className="p-3">
        <h2 className="font-medium text-sm leading-snug line-clamp-2 mb-1 text-gray-800">
          {product.title}
        </h2>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary">
            From ${price.toFixed(0)}
          </span>
          <span className="text-xs text-gray-400">
            {product.artist}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { products, collections, selectedCollection } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCollectionChange = (handle: string | null) => {
    if (handle) {
      setSearchParams({ collection: handle });
    } else {
      setSearchParams({});
    }
  };

  const currentCollection = collections.find((c: Collection) => c.handle === selectedCollection);

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Compact Toolbar */}
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900">
                  {currentCollection?.title || "All Prints"}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentCollection?.description || "Museum-quality prints from the Smithsonian"}
                </p>
              </div>
            </div>

            {collections.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Artist:</span>
                <select
                  value={selectedCollection || ""}
                  onChange={(e) => handleCollectionChange(e.target.value || null)}
                  className="px-3 py-2 text-sm font-medium rounded-lg border-2 cursor-pointer transition-colors min-w-[180px] border-gray-200 bg-white text-gray-800 focus:border-primary focus:outline-none"
                >
                  <option value="">All Artists</option>
                  {collections
                    .filter((c: Collection) => c.handle !== "frontpage")
                    .map((collection: Collection) => (
                      <option key={collection.id} value={collection.handle}>
                        {collection.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid - Server-rendered with products! */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product: Product, index: number) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 6}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">
              No artwork found{currentCollection ? ` for ${currentCollection.title}` : ""}.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                  <rect x="6" y="6" width="12" height="12" rx="1" stroke="white" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Gallery Store</span>
                <p className="text-xs text-gray-500">Museum-quality prints from the Smithsonian</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a
                href="https://www.si.edu/openaccess"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-gray-600"
              >
                Smithsonian Open Access
              </a>
              <span>•</span>
              <span>Free shipping on orders $100+</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
