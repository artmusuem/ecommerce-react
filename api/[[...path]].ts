import { createRequestHandler } from "@react-router/node";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// @ts-expect-error - Virtual module from React Router build
import * as build from "../build/server/index.js";

const handler = createRequestHandler(build);

export default async function (req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || "/", `https://${req.headers.host}`);

  const webRequest = new Request(url.toString(), {
    method: req.method,
    headers: new Headers(req.headers as Record<string, string>),
    body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
  });

  try {
    const response = await handler(webRequest);
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error("SSR Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
