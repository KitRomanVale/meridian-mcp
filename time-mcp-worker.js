/**
 * Time MCP - Cloudflare Worker
 *
 * Supports BOTH:
 *   - Remote MCP (claude.ai browser + mobile) via /mcp endpoint
 *   - Legacy JSON API (Claude Desktop local bridge) via / endpoint
 *
 * Original time logic by Jess & Cecil - March 2026
 * Remote MCP upgrade - March 2026
 */

// ─── Time helper ────────────────────────────────────────────────────────────

function getTime(timezone = 'Europe/Amsterdam') {
  const now = new Date();

  const localTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timezoneFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });

  const timezoneParts = timezoneFormatter.formatToParts(now);
  const timezoneAbbr =
    timezoneParts.find((p) => p.type === 'timeZoneName')?.value || timezone;

  return {
    utc: now.toISOString(),
    local_time: localTimeFormatter.format(now),
    date: dateFormatter.format(now),
    timezone: timezoneAbbr,
    full_timezone: timezone,
  };
}

// ─── MCP protocol helpers ────────────────────────────────────────────────────

const TOOL_DEFINITION = {
  name: 'check_time',
  description:
    'Returns the current date and time in UTC and a specified local timezone.',
  inputSchema: {
    type: 'object',
    properties: {
      timezone: {
        type: 'string',
        description:
          'IANA timezone identifier (e.g. "Europe/Amsterdam", "America/New_York"). Defaults to Europe/Amsterdam.',
      },
    },
    required: [],
  },
};

function mcpResponse(id, result) {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

function mcpError(id, code, message) {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message },
  };
}

function handleMcpMessage(msg) {
  const { id, method, params } = msg;

  // ── Handshake ──────────────────────────────────────────────────────────────
  if (method === 'initialize') {
    return mcpResponse(id, {
      protocolVersion: '2024-11-05',
      serverInfo: { name: 'time-mcp', version: '2.0.0' },
      capabilities: { tools: {} },
    });
  }

  if (method === 'notifications/initialized') {
    return null; // fire-and-forget, no reply needed
  }

  // ── Tool discovery ─────────────────────────────────────────────────────────
  if (method === 'tools/list') {
    return mcpResponse(id, { tools: [TOOL_DEFINITION] });
  }

  // ── Tool execution ─────────────────────────────────────────────────────────
  if (method === 'tools/call') {
    if (params?.name !== 'check_time') {
      return mcpError(id, -32601, `Unknown tool: ${params?.name}`);
    }
    try {
      const timezone = params?.arguments?.timezone || 'Europe/Amsterdam';
      const time = getTime(timezone);
      return mcpResponse(id, {
        content: [
          {
            type: 'text',
            text: JSON.stringify(time, null, 2),
          },
        ],
      });
    } catch (err) {
      return mcpError(id, -32603, `Time error: ${err.message}`);
    }
  }

  // ── Ping ───────────────────────────────────────────────────────────────────
  if (method === 'ping') {
    return mcpResponse(id, {});
  }

  return mcpError(id, -32601, `Method not found: ${method}`);
}

// ─── CORS headers ────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

// ─── Main fetch handler ──────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // ── /mcp  →  Remote MCP endpoint (claude.ai + mobile) ───────────────────
    if (url.pathname === '/mcp') {

      // Claude negotiates via POST with JSON-RPC messages
      if (request.method === 'POST') {
        let body;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify(mcpError(null, -32700, 'Parse error')),
            { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
          );
        }

        // Support both single messages and batches
        const messages = Array.isArray(body) ? body : [body];
        const replies = messages
          .map(handleMcpMessage)
          .filter(Boolean);

        const payload = replies.length === 1 ? replies[0] : replies;

        return new Response(JSON.stringify(payload), {
          headers: { 'Content-Type': 'application/json', ...CORS },
        });
      }

      // SSE handshake — some MCP clients ping GET first
      if (request.method === 'GET') {
        return new Response(
          JSON.stringify({ status: 'ok', server: 'time-mcp', version: '2.0.0' }),
          { headers: { 'Content-Type': 'application/json', ...CORS } }
        );
      }
    }

    // ── / (root)  →  Legacy JSON API (Desktop local bridge) ─────────────────
    try {
      let timezone = 'Europe/Amsterdam';
      if (request.method === 'POST') {
        const body = await request.json();
        if (body.timezone) timezone = body.timezone;
      }
      const time = getTime(timezone);
      return new Response(JSON.stringify(time, null, 2), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to get time', message: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }
  },
};
