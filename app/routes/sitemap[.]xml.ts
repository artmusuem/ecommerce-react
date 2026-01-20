/**
 * Dynamic Sitemap Generator
 *
 * Generates an XML sitemap for search engines with:
 * - Homepage
 * - All product pages
 * - Collection pages
 *
 * Cached for 1 hour to reduce API calls
 */

// @ts-expect-error - React Router 7 generates these types at build time
import type { Route } from "./+types/sitemap[.]xml";
import { fetchShopifyProducts, fetchCollections } from "@/data/shopify-api";

const SITE_URL = "https://ecommerce-react-shopify.vercel.app";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

function buildSitemapXml(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

export async function loader(_args: Route.LoaderArgs) {
  try {
    // Fetch products and collections in parallel
    const [products, collections] = await Promise.all([
      fetchShopifyProducts(),
      fetchCollections(),
    ]);

    const today = new Date().toISOString().split("T")[0];

    // Build sitemap URLs
    const urls: SitemapUrl[] = [
      // Homepage - highest priority
      {
        loc: SITE_URL,
        lastmod: today,
        changefreq: "daily",
        priority: 1.0,
      },
    ];

    // Add product pages
    products.forEach((product) => {
      urls.push({
        loc: `${SITE_URL}/product/${encodeURIComponent(product.id)}`,
        lastmod: today,
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    // Add collection filter URLs
    collections
      .filter((c) => c.handle !== "frontpage")
      .forEach((collection) => {
        urls.push({
          loc: `${SITE_URL}?collection=${encodeURIComponent(collection.handle)}`,
          lastmod: today,
          changefreq: "weekly",
          priority: 0.7,
        });
      });

    const sitemap = buildSitemapXml(urls);

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
        "X-Robots-Tag": "noindex", // Don't index the sitemap itself
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);

    // Return a minimal sitemap on error
    const fallbackSitemap = buildSitemapXml([
      {
        loc: SITE_URL,
        changefreq: "daily",
        priority: 1.0,
      },
    ]);

    return new Response(fallbackSitemap, {
      status: 500,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-cache",
      },
    });
  }
}
