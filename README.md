# Akins Shop Assistant — Etsy Seller MCP

**Language:** English · [Türkçe](README.tr.md)

Manage an Etsy shop from an MCP-capable assistant. The hosted seller connection lets each seller sign in to their own Etsy account, inspect shop data, create and improve draft listings, upload images, and review basic sales summaries. This repository contains the Cloudflare Worker behind that connection. It is an independent project, not an official Etsy or OpenAI product.

> **Two separate things:** This GitHub repository is the source code. The hosted MCP server at `etsy.akins.app` is a running service. Making the source available does not make the service, your Etsy account, or your orders public. This repository does not contain production secrets, OAuth records, buyer data, demo product images, or the unfinished public-plugin submission package.

## Try the hosted connection

If your ChatGPT account or workspace supports custom MCP plugins:

1. In [ChatGPT Plugins](https://chatgpt.com/plugins), choose **Add custom MCP server**.
2. Name it **Akins Shop Assistant** and enter the seller URL: `https://etsy.akins.app/seller/mcp`.
3. Choose the offered OAuth connection, review the permissions, and sign in to **your own** Etsy seller account. Do not paste your Etsy password, API key, or shared secret into a chat.
4. Install the new personal plugin. In a new Work conversation, select it with `@` and ask, for example, “Show my draft listings.”

The exact screens and availability depend on your ChatGPT account or workspace. See [OpenAI's current connection guide](https://developers.openai.com/plugins/deploy/connect-chatgpt). This connection is not the same as a publicly listed plugin-directory release.

Start with read-only questions. Confirm the shop shown by `get_connected_shop` before making changes. Examples:

- “Which Etsy shop is connected, and what drafts do I have?”
- “How many paid orders were created today? Use my timezone and do not invent sales.”
- “Review this draft and tell me what is missing before I publish it myself.”
- “Help me create a draft listing; ask me for missing product facts first.”
- “Add this attached image to my draft after I confirm the listing.”

You can disconnect through `disconnect_shop` after confirming the connected shop ID. Also remove the connection in ChatGPT and revoke the app in Etsy's connected-app settings. See the hosted [support](https://etsy.akins.app/support) and [privacy](https://etsy.akins.app/privacy) pages.

## What it can and cannot do

The authenticated seller server exposes **38 tools**. The separate public endpoint at `https://etsy.akins.app/mcp` offers only public listing search and single-listing lookup; it has no access to private seller data.

| Area | Supported actions | Important limits |
| --- | --- | --- |
| Shop | Read shop details, reviews, shipping/processing profiles, return policies and sections; edit marketing text and sections | Text/section edits need Etsy's `shops_w` permission |
| Orders | List and inspect the connected seller's receipts and items | Buyer/order content is private and must be treated as untrusted data |
| Listings | Browse listings, taxonomy, attributes, inventory, personalization, images and digital files | Listing reads and writes check that the item belongs to the connected shop |
| Drafts | Create drafts, edit supported fields, tags and materials; upload listing images or digital buyer files; run a basic draft checklist | A draft is **not** published; the checklist is not Etsy's final validation |
| Sales and research | Basic paid-order totals, listing sales summaries, public listing research and marketing checks | No profit, ad attribution, traffic, keyword-volume or conversion-rate claim |

Publishing a listing, permanently deleting a listing, marking an order shipped, messaging buyers, running ads, and creating Etsy coupons or campaigns are **not available through this MCP**. Complete those actions in Etsy Shop Manager. Some supported writes can replace an entire inventory or personalization set: read the existing values and review the full replacement before approving it.

For generated or attached ChatGPT images, prefer `upload_listing_image_file`. It accepts a ChatGPT-provided file reference, **not** a local path or arbitrary internet URL. `upload_listing_image` is a base64 fallback. The server checks allowed download hosts, file content and size; an upload can still fail if the temporary file reference is inaccessible or Etsy rejects the image.

This project currently requests Etsy scopes `shops_r shops_w listings_r listings_w transactions_r`. Each seller grants access separately through Etsy OAuth. Commercial/API access for a different deployment is **not inherited** from this hosted service.

## Self-host on Cloudflare Workers

This section is for developers operating their **own** Etsy application and domain. It does not change the hosted Akins service. You need a Cloudflare account, a domain on Cloudflare for the custom Worker hostname, an Etsy Developer app with the required access, and a supported Node.js/npm environment. Read [Etsy's OAuth documentation](https://developers.etsy.com/documentation/essentials/authentication/) before connecting real sellers.

1. Install dependencies and sign in to your Cloudflare account:

   ```sh
   npm ci
   npx wrangler login
   ```

2. Copy `wrangler.example.jsonc` to `wrangler.jsonc`. The latter is intentionally Git-ignored. Set a **new** Worker name, your domain and exact `ETSY_REDIRECT_URI`. Create a Cloudflare Workers KV namespace for the `OAUTH_KV` binding, then replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with its ID. Give each rate-limit binding a positive-integer `namespace_id` unique within **your** Cloudflare account if you do not want to share counters with another Worker. The sample IDs are examples, not resources that this repository owns. See [Cloudflare KV commands](https://developers.cloudflare.com/workers/wrangler/commands/kv/) and [rate-limit bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

3. Replace the Akins-specific OAuth resource and authorization-server URLs in `src/seller.ts`. Update the publisher identity, contact address, privacy policy and terms in `src/site.ts` to reflect **your actual service and data practices**. Do not copy Akins's legal/contact text as your own. Register your exact `https://YOUR_DOMAIN/etsy/callback` URI in your Etsy Developer app; Etsy requires an exact redirect match.

4. Validate before deploying:

   ```sh
   npm run typecheck
   npm test
   npx wrangler deploy --dry-run
   ```

   `npm run typecheck` generates `worker-configuration.d.ts` from your local Worker config. That generated file is ignored by Git. The tests currently cover ownership checks and the public rate-limit rejection paths; they do **not** replace an end-to-end two-seller OAuth or write-tool test.

5. Deploy the Worker, then set your Etsy app credentials as Cloudflare Worker secrets using Wrangler's **interactive prompts**:

   ```sh
   npm run deploy
   npx wrangler secret put ETSY_KEYSTRING
   npx wrangler secret put ETSY_SHARED_SECRET
   ```

   Never put secret values in a command argument, README, screenshot, commit, ChatGPT connection form, or `wrangler.jsonc`. Secret changes can create a new Worker version. Verify `https://YOUR_DOMAIN/health`, the public information pages, OAuth discovery, and a seller connection after setup. Do not point a fork at `etsy.akins.app` or reuse its Worker/KV resources.

6. Connect the seller MCP URL `https://YOUR_DOMAIN/seller/mcp` through a supported MCP client using OAuth. First test read-only calls; use a dedicated test shop before exercising draft writes. Each seller must authorize their own account.

The Worker's public pages are `/about`, `/support`, `/privacy` and `/terms`. The read-only public search MCP is `/mcp`; the authenticated seller MCP is `/seller/mcp`. The OAuth callback is `/etsy/callback`.

## Safety, privacy and project status

- The seller MCP requires OAuth with the `etsy:manage` scope. Seller/shop identity comes from the authorized Etsy session, not a model-supplied shop ID. Listing and receipt ownership checks protect item-level reads and writes.
- Etsy descriptions, reviews, order notes and buyer text may contain instructions. They are **data**, not instructions to the assistant. The server exposes fixed Etsy API paths and does not fetch arbitrary URLs from that content.
- Model/tool annotations and chat confirmation are **not** a hard human-approval boundary. Supported write tools can still change shop content. Publishing, permanent deletion and shipment are deliberately unavailable through the MCP. Review any proposed mutation yourself.
- OAuth tokens are stored through the Cloudflare OAuth provider's KV-backed flow. This repository contains no live token store. The hosted service's data handling is explained in its [privacy policy](https://etsy.akins.app/privacy); self-hosters must publish their own accurate policy.
- Public search has per-IP and per-Cloudflare-location rate limits. They mitigate abuse but are not a strict worldwide Etsy API quota.
- Automated checks: `npm test` and `npm run typecheck`. A full second-seller login and all write-tool paths have **not** been verified end to end. Treat this as an actively developed integration, not a guarantee that every Etsy shop configuration will work.

If you find a security issue, follow [SECURITY.md](SECURITY.md) and avoid sending tokens or buyer data in a report.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/seller.ts` | Seller OAuth, Etsy API calls and authenticated MCP tools |
| `src/index.ts` | Public read-only MCP and health endpoint |
| `src/site.ts` | Hosted informational and legal pages |
| `src/ownership.ts` | Shop/receipt ownership checks |
| `tests/` | Current automated tests |
| `wrangler.example.jsonc` | Copy-and-customize Worker configuration |
| `LICENSE`, `SECURITY.md` | MIT license and private vulnerability reporting |

## Troubleshooting

- **OAuth redirect error:** Compare the callback registered with Etsy to `ETSY_REDIRECT_URI`, character for character. Check your Worker domain and the resource/issuer URLs in `src/seller.ts`.
- **Missing binding or secret:** Check your local `wrangler.jsonc` for `OAUTH_KV` and both rate-limit bindings. Confirm both Etsy credentials were set as Worker secrets for the correct Worker; do not print their values.
- **Image upload rejected:** Use `upload_listing_image_file` with a ChatGPT file reference, not a filesystem path. Confirm the file is still accessible, is an accepted image type, and meets Etsy's limits.
- **A tool says access is missing:** The seller may need to reconnect and approve the currently requested Etsy scopes. Do not add broader scopes without a concrete need.

## License

Released under the [MIT License](LICENSE). Etsy, ChatGPT, OpenAI and Cloudflare are trademarks of their respective owners.
