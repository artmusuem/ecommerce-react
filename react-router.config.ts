import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  // Enable SSR for server-side rendering
  ssr: true,

  // App directory containing routes and entry files
  appDirectory: "app",

  // Use Vercel preset for deployment
  presets: [vercelPreset()],
} satisfies Config;
