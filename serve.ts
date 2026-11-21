// Leonida Platinum — tiny static file server for local previews only.
// Serves app/ at http://localhost:8080. Standard library only.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "app");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = createServer(async (req, res) => {
  const rawPath = new URL(req.url ?? "/", "http://localhost").pathname;
  let decoded = "/";
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(400, { "content-type": "text/plain" });
    res.end("bad path\n");
    return;
  }
  const file = join(APP_ROOT, decoded === "/" ? "index.html" : decoded);
  if (!file.startsWith(APP_ROOT) || !existsSync(file)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found\n");
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end("read error\n");
  }
});

server.listen(8080, () => {
  console.log("Leonida Platinum preview at http://localhost:8080");
});
