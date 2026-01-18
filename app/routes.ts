import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("product/:id", "routes/product.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("test", "routes/test.tsx"),
  // API resource routes (no component, just action)
  route("api/create-payment-intent", "routes/api.create-payment-intent.ts"),
  route("api/create-order", "routes/api.create-order.ts"),
] satisfies RouteConfig;
