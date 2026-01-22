import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("collections", "routes/collections.tsx"),
  route("collections/:artist", "routes/collections.$artist.tsx"),
  route("about", "routes/about.tsx"),
  route("product/:id", "routes/product.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("checkout/complete", "routes/checkout.complete.tsx"),
  route("test", "routes/test.tsx"),
  // SEO routes
  route("sitemap.xml", "routes/sitemap[.]xml.ts"),
  // API resource routes (no component, just action)
  route("api/create-payment-intent", "routes/api.create-payment-intent.ts"),
  route("api/create-order", "routes/api.create-order.ts"),
  route("api/newsletter", "routes/api.newsletter.ts"),
  route("api/create-checkout-session", "routes/api.create-checkout-session.ts"),
  route("api/checkout-session", "routes/api.checkout-session.ts"),
] satisfies RouteConfig;
