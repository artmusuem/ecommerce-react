import { useLoaderData, useSearchParams, Link } from "react-router";
import { useState, useEffect, useMemo } from "react";
// @ts-expect-error - React Router 7 generates these types at build time
import type { Route } from "./+types/home";
import { fetchShopifyProducts } from "@/data/shopify-api";
import { getResizedImage, IMAGE_SIZES } from "@/utils/images";
import type { Product } from "@/types";
import { getDefaultMetaTags, getCollectionMetaTags } from "@/components/seo/MetaTags";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { ArtistCircles } from "@/components/home/ArtistCircles";

/**
 * Artist type derived from products with avatar image
 */
interface Artist {
  name: string;
  handle: string;
  productCount: number;
  image: string;
}

/**
 * Convert artist name to URL-safe handle
 */
function toHandle(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Server-side data loading - this runs on the server BEFORE HTML is sent
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const artistHandle = url.searchParams.get("artist");

    // Fetch all products on server
    const products = await fetchShopifyProducts();

    // Derive unique artists from products with their counts and first image
    const artistData = new Map<string, { count: number; image: string }>();
    products.forEach((product) => {
      if (product.artist) {
        const existing = artistData.get(product.artist);
        if (existing) {
          artistData.set(product.artist, {
            count: existing.count + 1,
            image: existing.image, // Keep the first image found
          });
        } else {
          artistData.set(product.artist, {
            count: 1,
            image: product.image || '',
          });
        }
      }
    });

    // Convert to sorted array (by product count descending)
    // Only include artists with 3+ prints for cleaner navigation
    const artists: Artist[] = Array.from(artistData.entries())
      .filter(([, data]) => data.count >= 3)
      .map(([name, data]) => ({
        name,
        handle: toHandle(name),
        productCount: data.count,
        image: data.image,
      }))
      .sort((a, b) => b.productCount - a.productCount);

    return { products, artists, selectedArtist: artistHandle };
  } catch (error) {
    console.error("Loader error:", error);
    // Return empty data on error so page still renders
    return { products: [], artists: [], selectedArtist: null };
  }
}

// Meta tags for SEO with Open Graph support
export function meta({ data }: Route.MetaArgs) {
  // If an artist is selected, use artist-specific meta
  if (data?.selectedArtist) {
    const artist = data.artists?.find(
      (a: Artist) => a.handle === data.selectedArtist
    );
    if (artist) {
      return getCollectionMetaTags({
        title: artist.name,
        description: `Browse museum-quality prints by ${artist.name}`,
        handle: artist.handle,
      });
    }
  }

  // Default home page meta with OG tags
  return getDefaultMetaTags();
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
      className="group block bg-paper-50 hover:bg-paper-100 transition-colors"
    >
      <div className="aspect-[4/5] overflow-hidden relative bg-paper-100 border border-ink-900/80 shadow-md">
        <img
          src={thumbnailSrc}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-ink-900/50">
          <span className="px-5 py-2.5 text-sm font-medium bg-paper-50 text-ink-900">
            View Print
          </span>
        </div>
      </div>
      <div className="p-4">
        <h2 className="font-display text-base leading-snug line-clamp-2 text-ink-900">
          {product.title}
        </h2>
        <p className="text-sm text-ink-500 mt-1">
          {product.artist}
        </p>
        <p className="text-ink-700 font-medium mt-2">
          From ${price.toFixed(0)}
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const { products, artists, selectedArtist } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  // Local state for immediate UI feedback (no flicker)
  const [localSelection, setLocalSelection] = useState(selectedArtist || "");

  // Sync local state when URL/loader data changes
  useEffect(() => {
    setLocalSelection(selectedArtist || "");
  }, [selectedArtist]);

  const handleArtistChange = (handle: string) => {
    setLocalSelection(handle); // Immediate UI update
    if (handle) {
      setSearchParams({ artist: handle });
    } else {
      setSearchParams({});
    }
  };

  // Filter products by selected artist
  const filteredProducts = useMemo(() => {
    if (!selectedArtist) return products;
    return products.filter((p) => toHandle(p.artist) === selectedArtist);
  }, [products, selectedArtist]);

  const currentArtist = artists.find((a: Artist) => a.handle === selectedArtist);

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Artist Circles Navigation */}
      {artists.length > 0 && (
        <ArtistCircles
          artists={artists}
          selectedArtist={localSelection || null}
          onSelect={handleArtistChange}
          filteredCount={filteredProducts.length}
        />
      )}

      {/* Product Grid - Server-rendered with products! */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6 fade-in-stagger">
            {filteredProducts.map((product: Product, index: number) => (
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
              No artwork found{currentArtist ? ` for ${currentArtist.name}` : ""}.
            </p>
          </div>
        )}
      </div>

      {/* Premium Footer */}
      <footer className="bg-ink-900 text-paper-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-paper-50">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#1a1a1a" strokeWidth="2"/>
                    <rect x="6" y="6" width="12" height="12" rx="1" stroke="#1a1a1a" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" fill="#1a1a1a" opacity="0.9"/>
                  </svg>
                </div>
                <h3 className="font-display text-2xl text-paper-50">
                  Gallery Store
                </h3>
              </div>
              <p className="text-paper-100/70 max-w-sm mb-6">
                Museum-quality prints from the Smithsonian American Art Museum collection.
                Free shipping on all orders.
              </p>
              {/* Newsletter */}
              <div className="max-w-sm">
                <h4 className="font-medium text-paper-50 mb-3">Stay Updated</h4>
                <p className="text-sm text-paper-100/60 mb-4">
                  Subscribe for new artwork and exclusive offers.
                </p>
                <NewsletterForm variant="dark" />
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-medium text-paper-50 mb-4 text-sm uppercase tracking-wider">Shop</h4>
              <ul className="space-y-3 text-paper-100/70">
                <li>
                  <Link to="/" className="hover:text-paper-50 transition-colors">All Prints</Link>
                </li>
                <li>
                  <Link to="/checkout" className="hover:text-paper-50 transition-colors">Cart</Link>
                </li>
              </ul>
            </div>

            {/* Info Links */}
            <div>
              <h4 className="font-medium text-paper-50 mb-4 text-sm uppercase tracking-wider">About</h4>
              <ul className="space-y-3 text-paper-100/70">
                <li>
                  <a
                    href="https://www.si.edu/openaccess"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper-50 transition-colors"
                  >
                    Smithsonian Open Access
                  </a>
                </li>
                <li>
                  <a
                    href="https://americanart.si.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-paper-50 transition-colors"
                  >
                    American Art Museum
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-paper-100/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-sm text-paper-100/50">
                © {new Date().getFullYear()} Gallery Store. Artwork courtesy of Smithsonian Open Access.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-sm text-paper-100/50">
                  Free shipping worldwide
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
