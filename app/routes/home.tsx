import { useLoaderData, Link } from "react-router";
// @ts-expect-error - React Router 7 generates these types at build time
import type { Route } from "./+types/home";
import { fetchShopifyProducts } from "@/data/shopify-api";
import { getResizedImage, IMAGE_SIZES } from "@/utils/images";
import type { Product } from "@/types";
import { getDefaultMetaTags } from "@/components/seo/MetaTags";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";

// Server-side data loading
export async function loader(_args: Route.LoaderArgs) {
  try {
    const products = await fetchShopifyProducts();
    // Get featured products (first 6 for grid)
    const featured = products.slice(0, 6);
    return { featured, totalCount: products.length };
  } catch (error) {
    console.error("Loader error:", error);
    return { featured: [], totalCount: 0 };
  }
}

// Meta tags for SEO
export function meta() {
  return getDefaultMetaTags();
}

// Product card with black frame
function FeaturedProductCard({ product, index }: { product: Product; index: number }) {
  const price = product.priceRange?.minPrice
    ? parseFloat(product.priceRange.minPrice)
    : 45;

  return (
    <Link
      to={`/product/${encodeURIComponent(product.id)}`}
      className="group block"
    >
      {/* Image Container with Black Frame */}
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-100 p-3">
        {/* Black frame border */}
        <div className="relative w-full h-full border-[6px] border-ink-900 shadow-lg overflow-hidden">
          {/* Product image */}
          <img
            src={getResizedImage(product.image, IMAGE_SIZES.thumbnail)}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={index < 2 ? "eager" : "lazy"}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/10 transition-colors duration-300" />
        </div>
      </div>
      <div className="py-3">
        <h3 className="font-medium text-sm leading-snug line-clamp-1 text-ink-900 group-hover:text-ink-700">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-xs text-ink-500">From</span>
          <span className="font-medium text-ink-900">${price.toFixed(0)}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { featured } = useLoaderData<typeof loader>();

  return (
    <main className="bg-paper-50 min-h-screen">
      {/* Hero Section - Full viewport dramatic visual */}
      <section className="relative bg-ink-900 text-paper-50 min-h-[85vh] flex items-center justify-center">
        {/* Background image with overlay - use brighter image (index 3 = Summertime) */}
        {/* Using preview size (800px) - sufficient for 50% opacity background */}
        {featured[3] && (
          <div className="absolute inset-0">
            <img
              src={getResizedImage(featured[3].image, IMAGE_SIZES.preview)}
              alt=""
              className="w-full h-full object-cover opacity-50"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-ink-900/30 to-ink-900/70" />
          </div>
        )}

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Decorative text */}
          <div className="text-5xl sm:text-6xl lg:text-7xl font-display text-paper-100/40 mb-6">
            Smithsonian
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
            <span className="block">American Masters,</span>
            <span className="block">Now Yours</span>
          </h1>
          <p className="text-lg sm:text-xl text-paper-100/80 max-w-2xl mx-auto mb-10">
            Own a piece of American art history. We bring the Smithsonian collection to your walls
            with giclée prints on fine art paper—restored, preserved, and ready for your home.
          </p>
          <Link
            to="/collections"
            className="inline-block px-10 py-4 bg-paper-50 text-ink-900 font-medium hover:bg-paper-100 transition-colors text-lg"
          >
            Browse the collection
          </Link>
        </div>
      </section>


      {/* Timeless American Classics - Benefits + Mockup */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Mockup Image - Framed art display */}
            {/* Using preview size (800px) - matches displayed dimensions */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-paper-100 rounded-xl p-8 sm:p-12 shadow-2xl">
                {featured[0] && (
                  <div
                    className="aspect-[4/3] overflow-hidden bg-paper-50"
                    style={{
                      border: '10px solid #1a1a1a',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.25), inset 0 0 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img
                      src={getResizedImage(featured[0].image, IMAGE_SIZES.preview)}
                      alt={featured[0].title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2">
              <p className="text-sm font-medium text-ink-500 uppercase tracking-wider mb-3">
                From the Archives
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink-900 mb-6 leading-tight">
                History deserves a place on your wall
              </h2>
              <p className="text-ink-600 text-lg mb-8">
                Every piece in our collection comes from the Smithsonian American Art Museum archives.
                We digitally restore each work, then print it on 100% cotton rag paper using
                archival-grade inks—the same standards used by museums worldwide.
              </p>

              {/* Benefits Icons */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-ink-700">100% cotton rag fine art paper</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-ink-700">Giclée printing, 200+ year lifespan</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-ink-700">Free worldwide shipping</span>
                </div>
              </div>

              <Link
                to="/collections"
                className="inline-block px-8 py-3.5 bg-ink-900 text-paper-50 font-medium hover:bg-ink-800 transition-colors"
              >
                Shop prints
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="py-20 sm:py-28 bg-paper-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-ink-900 mb-4">
              Featured Works
            </h2>
            <p className="text-ink-600 max-w-2xl mx-auto">
              From Winslow Homer's coastal scenes to Mary Cassatt's intimate portraits—
              each print captures a defining moment in American art history, restored with
              painstaking attention to the original palette and texture.
            </p>
          </div>

          {/* Featured Grid - 6 products */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {featured.map((product: Product, index: number) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-ink-900 text-ink-900 font-medium hover:bg-ink-900 hover:text-paper-50 transition-colors"
            >
              View all prints
            </Link>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-ink-900 mb-4">
              The Gallery Store Difference
            </h2>
            <p className="text-ink-600 max-w-2xl mx-auto">
              We don't just print copies. We restore, refine, and reproduce each work
              using the same techniques trusted by conservators and curators.
            </p>
          </div>

          {/* Before/After Preview */}
          {/* Using preview size (800px) - matches max displayed width of 672px */}
          {featured[1] && (
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg shadow-xl">
                <img
                  src={getResizedImage(featured[1].image, IMAGE_SIZES.preview)}
                  alt="Restored artwork"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-ink-900">
                  Digitally restored
                </div>
              </div>
            </div>
          )}

          {/* 3 Pillars */}
          <div className="grid sm:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-ink-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-medium text-lg text-ink-900 mb-2">Digital Restoration</h3>
              <p className="text-ink-600">
                Color-accurate scans corrected for age and damage
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-ink-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
              <h3 className="font-medium text-lg text-ink-900 mb-2">True-to-Original</h3>
              <p className="text-ink-600">
                Matched to the artist's original palette and intent
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-ink-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg text-ink-900 mb-2">Built to Last</h3>
              <p className="text-ink-600">
                Archival materials rated for 200+ years
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter Section */}
      <section className="py-20 bg-paper-100">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-ink-900 mb-4">
            Join the Gallery
          </h2>
          <p className="text-ink-600 mb-8">
            Be the first to know when we add new works to the collection.
            No spam—just art, stories, and occasional exclusive offers.
          </p>
          <NewsletterForm />
        </div>
      </section>

    </main>
  );
}
