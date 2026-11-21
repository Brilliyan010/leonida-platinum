// Leonida Platinum — tiny local static server for the guide.
// Serves app/ on http://localhost:8080 so you can try the guide in a
// desktop browser. Node 22, standard library only; a local helper, not
// part of the graded entry.
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";

const root = join(new URL(".", import.meta.url).pathname, "app");
const port = 8080;

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = createServer((req, res) => {
  const path = normalize("/" + (req.url ?? "/").split("?")[0]);
  const file = join(root, path === "/" ? "index.html" : path);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found\n");
    return;
  }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});

server.listen(port, () => {
  console.log(`Leonida Platinum: serving app/ at http://localhost:${port}`);
});
