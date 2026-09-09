const DEFAULT_WEB_ORIGINS = [
  "https://nexron-web-prod.onrender.com",
  "http://localhost:3000",
];

// Configurable via NEXRON_WEB_ORIGIN (comma-separated) so the API can be
// pointed at a new frontend host - e.g. after moving the web app from
// Render to Vercel - without a code change. Falls back to the historical
// Render origin plus localhost for local development.
function allowedOrigins(): string[] {
  const configured = process.env.NEXRON_WEB_ORIGIN;
  if (!configured) return DEFAULT_WEB_ORIGINS;
  return configured.split(",").map(o => o.trim()).filter(Boolean);
}

export function corsHeaders(origin?: string | null): Record<string, string> {
  const origins = allowedOrigins();
  const allowedOrigin = origin && origins.includes(origin) ? origin : origins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function handleCorsPreflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}
