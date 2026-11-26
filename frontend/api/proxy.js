const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");

const ALLOWED_PATHS = [
  "/v1/",
  "/admin-api/",
  "/admin",
  "/asset",
  "/apisite/",
  "/auth/",
  "/api/",
  "/users/",
  "/groups/",
  "/games/",
  "/catalog/",
  "/develop/",
  "/game/",
  "/thumbs/",
  "/health"
];

module.exports = async function proxy(req, res) {
  if (!["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(req.method || "GET")) {
    res.setHeader("Allow", "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS");
    res.statusCode = 405;
    return res.end("Method not allowed");
  }

  const configuredBackend = process.env.KANDI_BACKEND_URL;
  if (!configuredBackend) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({
      error: "backend_not_configured",
      message: "Set KANDI_BACKEND_URL in the Vercel project environment."
    }));
  }

  let backend;
  try {
    backend = new URL(configuredBackend);
    if (!["http:", "https:"].includes(backend.protocol) || backend.username || backend.password) {
      throw new Error("Invalid backend URL");
    }
  } catch {
    res.statusCode = 500;
    return res.end("KANDI_BACKEND_URL must be an absolute HTTP(S) URL without credentials.");
  }

  const incoming = new URL(req.url || "/", "http://vercel.internal");
  const path = incoming.searchParams.get("path");
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\") ||
      path.split("/").includes("..") ||
      !ALLOWED_PATHS.some(prefix => prefix === "/admin" ? path === prefix || path.startsWith(prefix + "/") :
        prefix === "/asset" ? path === prefix || path.startsWith(prefix + "/") :
        path.startsWith(prefix))) {
    res.statusCode = 400;
    return res.end("Invalid or unsupported backend path.");
  }

  const target = new URL(path, backend.origin);
  for (const [key, value] of incoming.searchParams.entries()) {
    if (key !== "path") target.searchParams.append(key, value);
  }

  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "authorization", "x-csrf-token", "user-agent", "range", "if-none-match"]) {
    const value = req.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }

  const init = {
    method: req.method,
    headers,
    redirect: "manual"
  };

  if (!["GET", "HEAD"].includes(req.method || "GET")) {
    init.body = req;
    init.duplex = "half";
  }

  try {
    const upstream = await fetch(target, init);
    res.statusCode = upstream.status;

    for (const name of ["content-type", "cache-control", "location", "x-csrf-token", "etag", "last-modified", "content-disposition", "vary"]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }

    const cookies = typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : (upstream.headers.get("set-cookie") ? [upstream.headers.get("set-cookie")] : []);
    if (cookies.length) res.setHeader("set-cookie", cookies);

    if (!upstream.body || req.method === "HEAD") return res.end();
    await pipeline(Readable.fromWeb(upstream.body), res);
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({
        error: "backend_unreachable",
        message: "Kandi could not reach the configured ASP.NET backend."
      }));
    } else {
      res.destroy(error);
    }
  }
};

module.exports.config = { api: { bodyParser: false } };
