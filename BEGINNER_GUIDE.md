# Beginner Guide — meridian-mcp

No experience needed. This guide walks you through everything step by step.

\---

## What you're building

You're going to deploy a tiny program to the internet (called a Cloudflare Worker) that lets your AI companion check the current time — from anywhere. Claude Desktop, the claude.ai website, your phone. All of it.

It takes about 10 minutes. You don't need to understand code to do it.

\---

## What you need

* A free [Cloudflare account](https://dash.cloudflare.com/sign-up) (you probably already have one if you followed the original time-mcp guide)
* [Node.js](https://nodejs.org/) installed on your computer (the LTS version is fine)
* The files from this repo downloaded to your computer

\---

## Step 1 — Download this project

Click the green **Code** button at the top of this page, then **Download ZIP**. Extract it somewhere you can find it — your Desktop is fine.

\---

## Step 2 — Open a terminal in the folder

**Windows:** Hold `Shift` and right-click inside the folder → "Open PowerShell window here" (or "Open in Terminal")

**Mac:** Right-click the folder → "New Terminal at Folder"

\---

## Step 3 — Log into Cloudflare

In your terminal, type:

```
npx wrangler login
```

A browser window will open asking you to log in to Cloudflare. Do that, then come back to the terminal.

\---

## Step 4 — Deploy

In the same terminal, type:

```
npx wrangler deploy
```

Wait a few seconds. When it's done, you'll see a line like:

```
Published meridian-mcp (0.00 sec)
https://meridian-mcp.your-subdomain.workers.dev
```

**Copy that URL.** You'll need it in the next step.

\---

## Step 5 — Connect to claude.ai (browser + mobile)

This is the new part that the original time-mcp didn't support.

1. Go to [**claude.ai**](https://claude.ai) in your browser
2. Click your profile picture → **Settings**
3. Find **Connectors** (or **Integrations**)
4. Click **Add custom connector**
5. Paste your URL, but add `/mcp` at the end:

```
https://meridian-mcp.your-subdomain.workers.dev/mcp
```

6. Give it a name — something like `Time Awareness`
7. Click Save

\---

## Step 6 — Enable it in a conversation

When you start a new chat on claude.ai or the mobile app:

1. Look for the tools/connectors icon in the chat input area
2. Make sure your Time Awareness connector is toggled on
3. Ask: *"what time is it?"*

Your AI companion should respond with the current time in your timezone.

\---

## Step 7 — (Optional) Claude Desktop

If you also use Claude Desktop and followed the original time-mcp setup, nothing changes. The Worker still works with your existing Desktop config. You don't need to update anything.

If you haven't set up Claude Desktop yet and want to, follow the [original time-mcp Desktop guide](https://github.com/knowingly-ai/time-mcp/blob/main/BEGINNER_GUIDE.md) — just use your new Worker URL where it asks for one.

\---

## Troubleshooting

**"I don't see a Connectors option in Settings"**
Make sure you're on claude.ai in a browser, not the desktop app. Connectors are managed through the website.

**"It connected but the time is wrong"**
The default timezone is `Europe/Amsterdam`. You can ask your AI companion to check the time in your specific timezone — just say something like *"what time is it in Tokyo?"* and it'll adjust.

**"The deploy command failed"**
Make sure Node.js is installed and you're running the command inside the project folder (where the `wrangler.toml` file lives).

**"I already deployed time-mcp before — do I need a new Worker?"**
Yes — you'll need to replace your existing `time-mcp-worker.js` with the one from this repo and redeploy. The new file is backwards compatible, so your Desktop setup won't break.

\---

## That's it

One Worker, three platforms, zero ongoing maintenance. The URL never changes, so you set it once and forget it.

If something isn't working, open an issue on GitHub and we'll help.

\---

*meridian-mcp by Kit \& Roman Vale — built on* [*time-mcp*](https://github.com/knowingly-ai/time-mcp) *by KnowinglyAI*

