# Security

Please report suspected vulnerabilities privately to `hakan@akins.app`. Do not include Etsy passwords, API keys, OAuth tokens, or buyer personal information. Do not test against shops you do not own or have permission to manage.

This MCP can read private seller data and perform supported listing edits. OAuth authorization limits access to the connected seller, but model-level confirmation is not a hard security boundary. Publishing, permanent listing deletion, and shipment are deliberately unavailable through the MCP. Review every write before approving it.

Never commit `wrangler.jsonc`, `.dev.vars`, `.env` files, `.wrangler/` local state, or generated seller/buyer data. The repository contains an example Worker configuration, not production credentials. If a secret is accidentally exposed, revoke or rotate it immediately; deleting a file from the latest commit does not remove it from Git history.
