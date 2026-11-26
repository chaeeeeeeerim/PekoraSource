// Vercel same-origin proxy for the ASP.NET Core backend.
// Configure KANDI_BACKEND_URL in the Vercel project environment (for example, the VPS HTTPS origin).
module.exports = async function handler(req, res) {
  const backendValue = process.env.KANDI_BACKEND_URL;
  if (!backendValue) {
    res.statusCode = 503;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Backend is not configured. Set KANDI_BACKEND_URL in Vercel." }));
    return;
  }

  let backend;
  try {
    backend = new URL(backendValue);
    if (!["http:", "https:"].includes(backend.protocol) || backend.username || backend.password) {
      throw new Error("Invalid backend URL");
    }
  } catch {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "KANDI_BACKEND_URL must be an HTTP(S) origin without credentials." }));
    return;
  }

  const incoming = new URL(req.url, "https://vercel.invalid");
  const prefix = "/api/backend";
  if (!incoming.pathname.startsWith(prefix + "/")) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  const backendPath = incoming.pathname.slice(prefix.length);
  const target = new URL(backendPath + incoming.search, backend.origin);
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value == null || ["host", "connection", "content-length", "transfer-encoding"].includes(name.toLowerCase())) continue;
    headers.set(name, Array.isArray(value) ? value.join(", ") : String(value));
  }

  const method = (req.method || "GET").toUpperCase();
  const allowed = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);
  if (!allowed.has(method)) {
    res.statusCode = 405;
    res.setHeader("allow", "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS");
    res.end("Method not allowed");
    return;
  }

  try {
    let body;
    if (!["GET", "HEAD"].includes(method)) {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 4 * 1024 * 1024) {
          res.statusCode = 413;
          res.end("Payload too large for the Vercel proxy; upload large assets directly to the backend.");
          return;
        }
        chunks.push(Buffer.from(chunk));
      }
      if (chunks.length) body = Buffer.concat(chunks);
    }

    const upstream = await fetch(target, {
      method,
      headers,
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(120000)
    });

    res.statusCode = upstream.status;
    for (const name of ["content-type", "cache-control", "etag", "last-modified", "www-authenticate"]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    const cookies = upstream.headers.getSetCookie?.();
    if (cookies && cookies.length) res.setHeader("set-cookie", cookies);

    const location = upstream.headers.get("location");
    if (location) {
      try {
        const redirected = new URL(location, backend.origin);
        res.setHeader("location", redirected.origin === backend.origin
          ? redirected.pathname + redirected.search + redirected.hash
          : redirected.toString());
      } catch {
        res.setHeader("location", location);
      }
    }

    const responseBody = method === "HEAD" ? null : Buffer.from(await upstream.arrayBuffer());
    res.end(responseBody);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Backend proxy request failed.", detail: error.message }));
  }
};

module.exports.config = { api: { bodyParser: false } };
