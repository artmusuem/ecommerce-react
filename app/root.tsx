import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  type LinksFunction,
} from "react-router";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Cart from "@/components/cart/Cart";

import "./app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://res.cloudinary.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://cdn.shopify.com", crossOrigin: "anonymous" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
    <CartProvider>
      <Header />
      <Cart />
      <Outlet />
    </CartProvider>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{message}</h1>
      <p>{details}</p>
      <a href="/">Go Home</a>
    </main>
  );
}
