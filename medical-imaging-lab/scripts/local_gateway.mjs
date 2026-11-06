// Fallback for Docker Desktop environments where the OHIF/Nginx containers fail to start.
// Serve the exact static files extracted from the pinned OHIF image, plus the GPA Worker.
import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { Readable } from "node:stream";
const root = process.env.OHIF_STATIC_DIR || "/tmp/gpa-ohif-html";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    try {
      const path = new URL(req.url || "/", "http://localhost").pathname;
      if (
        path.startsWith("/api/lab/") ||
        path.startsWith("/dicomweb/") ||
        path.startsWith("/lab/")
      ) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers))
          if (value && !["host", "connection", "content-length"].includes(key))
            headers.set(key, Array.isArray(value) ? value.join(",") : value);
        headers.set("x-forwarded-host", req.headers.host || "127.0.0.1:8080");
        headers.set("x-forwarded-proto", "http");
        const upstream = await fetch("http://127.0.0.1:8788" + req.url, {
          method: req.method,
          headers,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
          redirect: "manual",
        });
        const outgoing = Object.fromEntries(upstream.headers.entries());
        delete outgoing["content-encoding"];
        delete outgoing["content-length"];
        delete outgoing["transfer-encoding"];
        res.writeHead(upstream.status, outgoing);
        if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
        else res.end();
        return;
      }
      const route =
        path === "/" || path.startsWith("/viewer")
          ? "index.html"
          : path.slice(1);
      const safe = normalize(route).replace(/^\.\.(?:\/|$)/, "");
      const file =
        path === "/app-config.js"
          ? join(process.cwd(), "viewer/app-config.js")
          : join(root, safe);
      if (!file.startsWith(root) && path !== "/app-config.js") {
        res.writeHead(403);
        res.end();
        return;
      }
      if (!existsSync(file) || !statSync(file).isFile()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const compressed = statSync(file).size === 0 && existsSync(file + ".gz");
      const outgoing = {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      };
      if (compressed) outgoing["Content-Encoding"] = "gzip";
      res.writeHead(200, outgoing);
      createReadStream(compressed ? file + ".gz" : file).pipe(res);
    } catch (error) {
      console.error(error);
      res.writeHead(502);
      res.end("Gateway error");
    }
  })
  .listen(8080, "127.0.0.1", () =>
    console.log("Local OHIF gateway: http://127.0.0.1:8080/lab/"),
  );
