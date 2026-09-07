const PRODUCTION_WEB_ORIGIN = "https://nexron-web-prod.onrender.com";

export function corsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigin = origin === PRODUCTION_WEB_ORIGIN ? origin : PRODUCTION_WEB_ORIGIN;
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
