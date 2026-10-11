import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

interface Env {
  ETSY_KEYSTRING: string;
  ETSY_SHARED_SECRET: string;
  PUBLIC_SEARCH_LIMIT: RateLimit;
  PUBLIC_SEARCH_GLOBAL_LIMIT: RateLimit;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

function mcpServer(env: Env) {
  const server = new McpServer({ name: "etsy-mcp", version: "0.1.0" });

  server.tool(
    "search_listings",
    "Search public Etsy listings by keyword. This tool is read-only.",
    { query: z.string().min(1), limit: z.number().int().min(1).max(25).default(10) },
    async ({ query, limit }) => {
      const url = new URL("https://api.etsy.com/v3/application/listings/active");
      url.searchParams.set("keywords", query);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("includes", "Images,Shop");
      const response = await etsyFetch(url, env);
      const body = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(body) }] };
    },
  );

  server.tool(
    "get_listing",
    "Get one Etsy listing by ID. This tool is read-only.",
    { listing_id: z.string().regex(/^\d+$/) },
    async ({ listing_id }) => {
      const url = new URL(`https://api.etsy.com/v3/application/listings/${listing_id}`);
      url.searchParams.set("includes", "Images,Shop,User");
      const response = await etsyFetch(url, env);
      const body = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(body) }] };
    },
  );

  return server;
}

async function etsyFetch(url: URL, env: Env): Promise<Response> {
  const headers = new Headers();
  headers.set("x-api-key", `${env.ETSY_KEYSTRING}:${env.ETSY_SHARED_SECRET}`);
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Etsy API returned ${response.status}`);
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "etsy-mcp" });
    if (url.pathname === "/mcp") {
      if (request.method === "POST") {
        const globalLimit = await env.PUBLIC_SEARCH_GLOBAL_LIMIT.limit({ key: "public-mcp" });
        if (!globalLimit.success) return new Response("Public search is temporarily busy", { status: 429, headers: { "retry-after": "60" } });
        const ip = request.headers.get("cf-connecting-ip");
        if (ip) {
          const callerLimit = await env.PUBLIC_SEARCH_LIMIT.limit({ key: ip });
          if (!callerLimit.success) return new Response("Public search rate limit exceeded", { status: 429, headers: { "retry-after": "60" } });
        }
      }
      const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await mcpServer(env).connect(transport);
      return transport.handleRequest(request);
    }
    return json({ service: "etsy-mcp", endpoints: ["/mcp", "/health"] });
  },
};
