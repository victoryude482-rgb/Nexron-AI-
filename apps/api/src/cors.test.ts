import test from "node:test";
import assert from "node:assert/strict";
import { corsHeaders, handleCorsPreflight } from "./cors.js";

test("CORS allows the production Nexron web origin", () => {
  const headers = corsHeaders("https://nexron-web-prod.onrender.com");
  assert.equal(headers["Access-Control-Allow-Origin"], "https://nexron-web-prod.onrender.com");
  assert.equal(headers["Access-Control-Allow-Methods"], "GET,POST,DELETE,OPTIONS");
  assert.equal(headers["Access-Control-Allow-Headers"], "Content-Type, Authorization");
});

test("CORS preflight returns 204 for the production web origin", async () => {
  const request = new Request("https://nexron-api-prod.onrender.com/api/chat/stream", {
    method: "OPTIONS",
    headers: { Origin: "https://nexron-web-prod.onrender.com" },
  });
  const response = handleCorsPreflight(request);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://nexron-web-prod.onrender.com");
});
