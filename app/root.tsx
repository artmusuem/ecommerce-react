import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { LinksFunction } from "react-router";
import { CartProvider } from "../src/context/CartContext";
import { ShopifyProvider } from "../src/context/ShopifyProvider";
import Header from "../src/components/layout/Header";
import Cart from "../src/components/cart/Cart";

import "./app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://res.cloudinary.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://cdn.shopify.com", crossOrigin: "anonymous" },
  { rel: "dns-prefetch", href: "https://res.cloudinary.com" },
  { rel: "dns-prefetch", href: "https://cdn.shopify.com" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Gallery Store - Museum-quality art prints from the Smithsonian American Art Museum."
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ShopifyProvider>
      <CartProvider>
        <Header />
        <Cart />
        <Outlet />
      </CartProvider>
    </ShopifyProvider>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{message}</h1>
        <p className="text-gray-600 mb-6">{details}</p>
        <a href="/" className="btn-primary">
          Go Home
        </a>
        {stack && (
          <pre className="mt-8 text-left text-xs bg-gray-100 p-4 rounded overflow-auto max-w-xl">
            {stack}
          </pre>
        )}
      </div>
    </main>
  );
}
