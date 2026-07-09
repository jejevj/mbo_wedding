/**
 * server.js
 * Node.js server untuk mbo_wedding
 * - Serve semua file statis (HTML, CSS, JS, JSON, images, dll)
 * - Endpoint POST /save-wishes untuk update wishes.json
 * Semua berjalan dalam SATU port (default: 80)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 80;
const STATIC_DIR = path.join(__dirname);
const WISHES_FILE = path.join(__dirname, "wishes.json");

// MIME type map
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".zip": "application/zip",
};

function getMime(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": getMime(filePath),
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

function handleSaveWishes(req, res) {
  // CORS headers (opsional, berguna untuk dev lokal)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));
  req.on("end", () => {
    try {
      // Validasi: harus berupa JSON array
      const parsed = JSON.parse(body);
      if (!Array.isArray(parsed)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Data harus berupa array" }));
        return;
      }

      // Validasi setiap entry
      for (const item of parsed) {
        if (!item.id || !item.name || !item.comment) {
          res.writeHead(422, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Setiap wish harus punya id, name, dan comment" }));
          return;
        }
      }

      // Tulis ke wishes.json
      fs.writeFile(WISHES_FILE, JSON.stringify(parsed, null, 2), "utf8", (err) => {
        if (err) {
          console.error("[server] Gagal menulis wishes.json:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, message: "Gagal menyimpan ke file" }));
          return;
        }
        console.log(`[server] wishes.json diperbarui — ${parsed.length} entri`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, count: parsed.length }));
      });
    } catch (e) {
      console.error("[server] JSON parse error:", e.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "JSON tidak valid" }));
    }
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0]; // buang query string

  // ── Endpoint: POST /save-wishes ────────────────────────────────
  if (urlPath === "/save-wishes" && (req.method === "POST" || req.method === "OPTIONS")) {
    handleSaveWishes(req, res);
    return;
  }

  // ── Static file serving ────────────────────────────────────────
  let filePath = path.join(STATIC_DIR, urlPath === "/" ? "index.html" : urlPath);

  // Cegah path traversal attack (misal: ../../etc/passwd)
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  // Jika path adalah direktori, coba serve index.html di dalamnya
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    serveStatic(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`[server] mbo_wedding berjalan di http://localhost:${PORT}`);
  console.log(`[server] Static files  : ${STATIC_DIR}`);
  console.log(`[server] wishes.json   : ${WISHES_FILE}`);
  console.log(`[server] Endpoint      : POST /save-wishes`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[server] SIGTERM diterima, shutting down...");
  server.close(() => process.exit(0));
});
