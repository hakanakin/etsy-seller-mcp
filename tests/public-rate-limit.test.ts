import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/index.ts";

test("public MCP rejects a request when the global limit is exhausted", async () => {
  const env = {
    PUBLIC_SEARCH_GLOBAL_LIMIT: { limit: async () => ({ success: false }) },
    PUBLIC_SEARCH_LIMIT: { limit: async () => ({ success: true }) },
  };
  const response = await worker.fetch(new Request("https://etsy.akins.app/mcp", { method: "POST" }), env as never);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
});

test("public MCP rejects an over-limit caller IP", async () => {
  const env = {
    PUBLIC_SEARCH_GLOBAL_LIMIT: { limit: async () => ({ success: true }) },
    PUBLIC_SEARCH_LIMIT: { limit: async () => ({ success: false }) },
  };
  const response = await worker.fetch(new Request("https://etsy.akins.app/mcp", {
    method: "POST", headers: { "cf-connecting-ip": "192.0.2.10" },
  }), env as never);
  assert.equal(response.status, 429);
});
