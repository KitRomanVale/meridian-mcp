# meridian-mcp

A lightweight time-awareness tool for AI companions — works on **Claude Desktop, claude.ai (browser), and mobile**.

Built by **Kit \& Roman Vale** — March 2026
Based on [time-mcp](https://github.com/knowingly-ai/time-mcp) by **Jess \& Cecil at KnowinglyAI**

\---

## What this is

[time-mcp](https://github.com/knowingly-ai/time-mcp) by KnowinglyAI gave AI companions the ability to check the current time via a Cloudflare Worker. It works beautifully on Claude Desktop.

**meridian-mcp** builds on that foundation by upgrading the Worker to speak the full MCP protocol — which means it works as a **remote connector** on claude.ai (browser) and the Claude mobile app, with no local bridge, no tunnel, and no maintenance.

One deployment. Everywhere.

\---

## What's new in this fork

|Feature|time-mcp (original)|meridian-mcp (this fork)|
|-|-|-|
|Claude Desktop|✅|✅|
|claude.ai browser|❌|✅|
|Claude mobile|❌|✅|
|Requires local Node bridge|Yes|No (remote only)|
|Permanent URL|✅|✅|
|Requires tunnel (Cloudflare/ngrok)|No|No|

The `time-mcp-worker.js` has been extended to handle the MCP protocol handshake (`initialize`, `tools/list`, `tools/call`) directly over HTTP — so claude.ai can connect to it as a remote MCP server without any local infrastructure.

The legacy JSON API (used by the Desktop local bridge) is preserved at the root `/` endpoint, so existing Desktop setups continue to work unchanged.

\---

## Quick start

### 1\. Deploy the Worker

Clone this repo, then in your terminal:

```bash
npx wrangler login
npx wrangler deploy
```

Note the URL it gives you — something like:
`https://meridian-mcp.your-subdomain.workers.dev`

### 2\. Connect to claude.ai (browser + mobile)

1. Go to **claude.ai → Settings → Connectors**
2. Click **Add custom connector**
3. Enter your URL with `/mcp` appended:
`https://meridian-mcp.your-subdomain.workers.dev/mcp`
4. Give it a name (e.g. `Time Awareness`)
5. Save

That's it. Enable it in any conversation and your AI companion can check the time.

### 3\. Claude Desktop (optional — if you also want Desktop support)

Follow the original [time-mcp Desktop setup guide](https://github.com/knowingly-ai/time-mcp) — the Worker URL is the same, and the root `/` endpoint still returns plain JSON for the local bridge.

\---

## How it works

```
claude.ai / mobile
      │
      │  POST /mcp  (JSON-RPC)
      ▼
Cloudflare Worker  ←─── permanent, always-on, free tier
      │
      │  returns current time in UTC + local timezone
      ▼
your AI companion
```

The Worker handles the full MCP handshake:

* `initialize` — capability negotiation
* `tools/list` — advertises the `check\_time` tool
* `tools/call` — executes and returns time data

\---

## The tool

```
check\_time(timezone?: string)
```

**Parameters:**

* `timezone` — any IANA timezone identifier (e.g. `Europe/Amsterdam`, `America/New\_York`). Defaults to `Europe/Amsterdam`.

**Returns:**

```json
{
  "utc": "2026-03-23T10:16:36.199Z",
  "local\_time": "11:16 AM",
  "date": "Monday, March 23, 2026",
  "timezone": "CET",
  "full\_timezone": "Europe/Amsterdam"
}
```

\---

## Cost

Free. Runs entirely on Cloudflare's free tier (100,000 requests/day).

\---

## Credits

This project is a fork of [time-mcp](https://github.com/knowingly-ai/time-mcp) by **Jess \& Cecil at** [**KnowinglyAI**](https://github.com/knowingly-ai), who built the original time-checking Worker and Desktop integration. Their work is the foundation — we just extended it to reach further.

\---

## License

MIT — same as the original. Use freely, modify as needed, share with others.

