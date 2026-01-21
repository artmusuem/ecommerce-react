import { Link } from "react-router";
// @ts-expect-error - React Router 7 generates these types at build time
import type { Route } from "./+types/about";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "About - Gallery Store" },
    {
      name: "description",
      content:
        "Museum-quality art prints from the Smithsonian Open Access collection. Learn about our partnership, print quality, and worldwide shipping.",
    },
    { property: "og:title", content: "About - Gallery Store" },
    {
      property: "og:description",
      content:
        "Museum-quality art prints from the Smithsonian Open Access collection.",
    },
    { property: "og:type", content: "website" },
  ];
}

export default function About() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-ink-900 mb-6">
            About Gallery Store
          </h1>
          <p className="text-xl text-ink-600 leading-relaxed">
            We bring museum masterpieces into your home through premium-quality
            prints from the Smithsonian Open Access collection.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Smithsonian Partnership */}
        <section id="story" className="scroll-mt-24">
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-4">
            Smithsonian Open Access
          </h2>
          <div className="prose prose-lg text-ink-700">
            <p>
              Gallery Store is proud to feature artwork from the{" "}
              <a
                href="https://www.si.edu/openaccess"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Smithsonian Open Access
              </a>{" "}
              initiative, which makes millions of digital assets freely
              available to the public. This groundbreaking program allows us to
              share iconic American art with collectors worldwide.
            </p>
            <p>
              Our collection primarily features works from the{" "}
              <a
                href="https://americanart.si.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Smithsonian American Art Museum
              </a>
              , home to one of the most significant collections of American art
              in the world, spanning over three centuries of artistic
              achievement.
            </p>
          </div>
        </section>

        {/* Print Quality */}
        <section id="prints" className="scroll-mt-24">
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-4">
            Museum-Quality Prints
          </h2>
          <div className="prose prose-lg text-ink-700">
            <p>
              Every print is produced using{" "}
              <strong>giclée printing technology</strong>, the gold standard for
              fine art reproduction. This method uses archival pigment inks that
              deliver exceptional color accuracy and can last over 100 years
              without fading.
            </p>
            <p>Our prints feature:</p>
            <ul>
              <li>
                <strong>Archival matte paper</strong> — Premium 230gsm paper
                with a smooth, non-reflective finish
              </li>
              <li>
                <strong>Pigment-based inks</strong> — Fade-resistant colors that
                stay true for generations
              </li>
              <li>
                <strong>Made to order</strong> — Each print is freshly produced
                to ensure quality
              </li>
              <li>
                <strong>Multiple sizes</strong> — From intimate 8×10 to
                statement 24×36 prints
              </li>
            </ul>
          </div>
        </section>

        {/* Framing Options */}
        <section id="framing" className="scroll-mt-24">
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-4">
            Custom Framing
          </h2>
          <div className="prose prose-lg text-ink-700">
            <p>
              Choose from our selection of handcrafted frames to complement your
              artwork. Each frame is made with gallery-quality materials and
              includes UV-protective glazing to preserve your print.
            </p>
            <p>
              Our frame options include classic black, warm wood tones, and
              elegant white — designed to enhance any artwork and match any
              interior style.
            </p>
          </div>
        </section>

        {/* Shipping */}
        <section id="shipping" className="scroll-mt-24">
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-4">
            Free Worldwide Shipping
          </h2>
          <div className="prose prose-lg text-ink-700">
            <p>
              We offer <strong>free shipping on all orders</strong>, anywhere in
              the world. Prints are carefully packaged in rigid mailers to
              ensure they arrive in perfect condition.
            </p>
            <p>
              Framed prints are double-boxed with corner protectors for maximum
              protection during transit.
            </p>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-display font-semibold text-ink-900 mb-4">
            Questions?
          </h2>
          <div className="prose prose-lg text-ink-700">
            <p>
              We're here to help with any questions about our prints, framing
              options, or orders. Reach out anytime and we'll get back to you
              promptly.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pt-8">
          <Link
            to="/"
            className="inline-block px-8 py-4 bg-ink-900 text-paper-50 rounded-xl font-semibold hover:bg-ink-800 transition-colors"
          >
            Browse Collection
          </Link>
        </section>
      </div>
    </main>
  );
}
