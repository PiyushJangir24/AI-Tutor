"use strict";

const http = require("http");

const PORT = Number(process.env.PORT || 8000);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, data) {
  setCors(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function notFound(res) {
  sendJson(res, 404, { status: 404, code: "NOT_FOUND", message: "Not Found" });
}

function badRequest(res, message, details) {
  sendJson(res, 400, { status: 400, code: "BAD_REQUEST", message: message || "Bad Request", details });
}

function serverError(res, message, details) {
  sendJson(res, 500, { status: 500, code: "SERVER_ERROR", message: message || "Server Error", details });
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      // Rudimentary protection against very large bodies for local mock
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const data = raw ? JSON.parse(raw) : {};
        resolve(data);
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function inferToolFromMessage(message) {
  const m = String(message || "").toLowerCase();
  if (/flashcard|cards?\b/.test(m)) return "flashcard_generator";
  if (/summar(y|ize)|notes?\b|note\b/.test(m)) return "note_maker";
  return "chat";
}

function buildExtractResponse(body) {
  const message = body?.message || "";
  const tool = inferToolFromMessage(message);
  const intent = tool === "note_maker"
    ? "Create concise study notes"
    : tool === "flashcard_generator"
      ? "Generate flashcards"
      : "Chat / analyze context";

  const parameters = {};
  if (tool === "note_maker") {
    parameters.topic = message.slice(0, 80) || "General topic";
    parameters.detailLevel = Math.max(1, Math.min(10, Math.round(body?.context?.masteryLevel || 5)));
  } else if (tool === "flashcard_generator") {
    parameters.topic = message.slice(0, 80) || "General topic";
    parameters.numCards = 5;
  }

  const trace = [
    "Parse message and session context",
    `Infer tool: ${tool}`,
    "Map to normalized parameters"
  ];

  return { intent, tool, parameters, trace };
}

function buildOrchestrateResponse(body) {
  const tool = body?.tool || "chat";
  const includeTrace = Boolean(body?.includeTrace);
  const topic = body?.parameters?.topic || "Sample Topic";

  if (tool === "note_maker") {
    const bullets = [
      `${topic}: high-level overview`,
      `Key concepts with brief explanations`,
      `Practical example for quick recall`
    ];
    return {
      result: { title: `${topic} — Notes`, bullets },
      normalized: {
        title: `${topic} Study Notes`,
        text: bullets.map((b, i) => `${i + 1}. ${b}`).join("\n"),
        items: bullets
      },
      trace: includeTrace ? [
        "Select note_maker adapter",
        "Aggregate facts",
        "Normalize to {title,text,items}"
      ] : []
    };
  }

  if (tool === "flashcard_generator") {
    const cards = [
      { q: `What is ${topic}?`, a: `${topic} is the core idea...` },
      { q: `Why use ${topic}?`, a: "It improves understanding and retention." },
      { q: `Give an example of ${topic}.`, a: "Example tailored to the topic." }
    ];
    return {
      result: cards,
      normalized: {
        title: `${topic} Flashcards`,
        items: cards
      },
      trace: includeTrace ? [
        "Select flashcard_generator adapter",
        "Derive Q/A pairs",
        "Normalize array of cards"
      ] : []
    };
  }

  // chat fallback
  const reply = `Analyzing: ${topic}. How can I help further?`;
  return {
    result: { reply },
    normalized: { text: reply },
    trace: includeTrace ? ["Route to chat", "Compose brief assistant reply"] : []
  };
}

const server = http.createServer(async (req, res) => {
  try {
    setCors(res);

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end("<h1>Mock AI Tutor API</h1><p>POST /extract, POST /orchestrate</p>");
      return;
    }

    if (req.method === "POST" && req.url === "/extract") {
      const body = await readJsonBody(req);
      if (!body || typeof body.message !== "string") {
        return badRequest(res, "'message' is required");
      }
      const data = buildExtractResponse(body);
      return sendJson(res, 200, data);
    }

    if (req.method === "POST" && req.url === "/orchestrate") {
      const body = await readJsonBody(req);
      if (!body || typeof body.tool !== "string") {
        return badRequest(res, "'tool' is required");
      }
      const data = buildOrchestrateResponse(body);
      return sendJson(res, 200, data);
    }

    return notFound(res);
  } catch (err) {
    if (err && err.message === "Invalid JSON") {
      return badRequest(res, "Invalid JSON payload");
    }
    if (err && err.message === "Payload too large") {
      return sendJson(res, 413, { status: 413, code: "PAYLOAD_TOO_LARGE", message: err.message });
    }
    return serverError(res, (err && err.message) || "Unexpected error");
  }
});

server.listen(PORT, () => {
  console.log(`Mock AI Tutor API listening on http://localhost:${PORT}`);
});
