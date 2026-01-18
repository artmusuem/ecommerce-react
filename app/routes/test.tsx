// Minimal test route - no imports, no dependencies
export function loader() {
  return { message: "SSR is working", timestamp: new Date().toISOString() };
}

export default function Test() {
  return (
    <html>
      <head>
        <title>SSR Test</title>
      </head>
      <body>
        <h1>If you see this, SSR works</h1>
        <p>This is server-rendered HTML</p>
      </body>
    </html>
  );
}
