# Etsy seller MCP

Open-source Cloudflare Worker powering Akins Shop Assistant. Source code is licensed under [MIT](LICENSE). This repository does not include the live service's secrets, OAuth records, private Cloudflare configuration, product images, or public-directory submission draft.

ChatGPT seller connection: `https://etsy.akins.app/seller/mcp`.

The existing public, read-only search remains at `https://etsy.akins.app/mcp`.

## Setup

For a separate deployment, run `npm ci`, copy `wrangler.example.jsonc` to `wrangler.jsonc`, and replace the example domain, Worker name, and KV namespace ID with your own. Register that exact callback URL in your own Etsy Developer application. Change the Akins-specific OAuth resource/issuer URLs in `src/seller.ts` and the publisher, support, privacy, and terms text in `src/site.ts` to match your service before offering it to users. Do not deploy the example configuration unchanged or deploy from this checkout against the Akins production Worker.

Set `ETSY_KEYSTRING` and `ETSY_SHARED_SECRET` as Cloudflare Worker secrets, never in source control. `npm run typecheck` regenerates the ignored `worker-configuration.d.ts` from your local config. Run `npm test` and `npx wrangler deploy --dry-run` before any deployment. The local `.wrangler/` state may contain OAuth test data and is excluded from Git.

1. In Etsy Developer, register the exact OAuth redirect URI `https://etsy.akins.app/etsy/callback` for the approved application. The Worker uses the same URI in `wrangler.jsonc`.
2. Keep `ETSY_KEYSTRING` and `ETSY_SHARED_SECRET` as Cloudflare Worker secrets. Never put them in ChatGPT connection settings, source control, or a screenshot. The app key identifies the integration; individual sellers authenticate through Etsy OAuth.
3. In ChatGPT developer mode, create a custom MCP app using `https://etsy.akins.app/seller/mcp` and OAuth. During setup, each seller grants Etsy access to their own shop. The server derives the seller's user and shop ID from Etsy's token, not from a tool argument.
4. Test with a seller account: connect; call `get_connected_shop`; list orders and drafts; create a throwaway draft; update it; upload an image; confirm all data belongs to that seller. Repeat with a second seller account before publishing beyond private testing. A draft creation was verified on the publisher's shop; a second-seller test remains outstanding.

## Tool coverage

The seller server exposes 38 focused tools:

- Shop: `get_connected_shop`, `get_shop_details`, `update_shop_marketing_text`, `list_shop_reviews`, `list_shipping_profiles`, `list_processing_profiles`, `list_return_policies`, `list_shop_sections`, `create_shop_section`, `rename_shop_section`, `disconnect_shop`.
- Orders: `list_orders` (date, paid/shipped filters), `get_order`, `get_order_items`, `list_shop_transactions`.
- Marketing: `get_marketing_sales_summary`, `get_listing_sales_summary`, `search_public_listings_for_research`, `audit_listing_marketing`. These read-only tools return aggregated seller data or public listings; they do not create promotions. The report tools scan at most five pages and explicitly mark incomplete coverage. Order totals are not profit or ad attribution. Public search is not keyword volume.
- Listings: `list_shop_listings`, `get_shop_listing`, `list_listing_reviews`, `get_listing_inventory`, `set_draft_listing_inventory`, `list_listing_images`, `search_seller_taxonomy`, `get_taxonomy_properties`, `get_listing_properties`, `set_draft_listing_property`, `get_listing_personalization`, `set_draft_listing_personalization`, `list_listing_files`, `audit_listing_draft`, `create_draft_listing`, `update_listing`, `upload_listing_image`, `upload_listing_image_file`, `upload_digital_listing_file`.
Shop text and section writes require Etsy's `shops_w` scope. Existing ChatGPT-connected sellers may need to reconnect to grant it. Publication, permanent deletion and marking an order shipped are not exposed through this MCP; sellers perform those actions in Etsy Shop Manager. The tools reject calls without the granted scopes. Etsy Open API has no documented coupon, sale-campaign, targeted-offer, Etsy Ads management, or Etsy Stats traffic endpoint, so those are not offered as executable tools. Sellers configure those in Etsy's Shop Manager.

The new read tools use the existing Etsy OAuth scopes. Reviews are read-only; Etsy's Open API does not expose a reply-to-review endpoint. The server does not offer an arbitrary Etsy API proxy or arbitrary URL fetching.

`disconnect_shop` requires the connected shop ID as an explicit confirmation and revokes this Etsy user's grants in the service. It does not revoke access from Etsy's own connected-app settings or remove the connection in ChatGPT; users should do both separately. Do not test this tool on a live account unless the owner actually intends to disconnect it.

Public listing pages: `/about`, `/support`, `/privacy`, `/terms`. This source release does not include the unfinished public-directory submission package.

`create_draft_listing` does not publish. `update_listing` rejects `state=active`; review and publish in Etsy Shop Manager. `upload_listing_image` remains the base64 fallback. For ChatGPT, use `upload_listing_image_file`: its `file` parameter is declared with `_meta["openai/fileParams"]` so the host can supply a temporary file URL and opaque file ID for an attached/generated image. A local file path alone is not sufficient. The Worker permits only known ChatGPT file hosts, including the exact Azure Blob hostname observed for generated images; it rejects redirects, checks image bytes and limits downloads to 6 MB. Etsy can impose stricter limits. Live-tested on 2026-10-03: ChatGPT generated an image, uploaded it to a draft, and `list_listing_images` returned one image.

`create_draft_listing` accepts optional tags, materials, styles, section, tax and auto-renew choices; `update_listing` accepts these for full replacement. Read the current listing and merge list fields before adding one item; omitting them leaves them unchanged. Up to 13 unique tags are allowed, each no longer than 20 characters. The Worker sends Etsy's form-encoded comma-separated value. An empty array requests removal of all tags.

Etsy now permits physical drafts before shipping and processing profiles are set. Publication still needs the applicable shipping/profile/policy data. Calculated shipping profiles may also require weight, dimensions and units. The draft tool accepts these fields and returns Etsy's validation message for invalid requests.

For a complete draft: search category IDs, inspect category properties, create the draft using seller-provided product facts, attach images and (for instant digital listings) actual buyer files, configure properties/variations/personalization, then run `audit_listing_draft` and have the seller review Etsy's editor before publishing. Inventory and personalization tools replace whole sets, are draft-only, and require explicit approval. The audit is a basic checklist, not Etsy's final validation or a guarantee of legal compliance. Digital file upload and the complex write tools need a separate live seller-authorized test; no buyer file or variation was changed as part of this audit.

## Security and limitations

- Seller tools require an OAuth bearer token with `etsy:manage`; the public search endpoint has no seller access.
- Shop IDs are derived server-side from the authorized Etsy identity. Listing reads and writes check ownership before acting.
- All Etsy API paths are fixed by the server. Listing descriptions, order notes, and customer messages are data, never instructions or URLs to fetch.
- Token storage, browser-bound consent, PKCE and refresh are handled by the Cloudflare OAuth provider and the Etsy OAuth flow. Do not log bearer or Etsy tokens.
- Tool annotations label mutations, but model-level confirmation is not a hard security boundary. Publication, deletion and shipment are unavailable through this MCP. Other write tools, including inventory replacement and shop text, still rely on model-level confirmation and should be reviewed by the seller; a hard approval gate for those remains future work.
- The public read-only MCP search is limited per caller IP and per Cloudflare location. This is abuse mitigation, not a strict global Etsy quota; Cloudflare's rate-limit counters are eventually consistent.
- `npm test` covers ownership checks and public-rate-limit rejection. A full two-seller login and all write-tool tests remain outstanding.

To verify code locally: `npm run typecheck`. To deploy from this directory: `npm run deploy`.
