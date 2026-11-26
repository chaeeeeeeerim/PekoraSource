// Project Kandi - camada de API ÚNICA. Todas as páginas falam com o backend por aqui: KandiAPI.call("modulo.metodo", { params, query, body }).
// Regras: nenhuma rota é inventada (p vazio = "não conectado"), erros do servidor nunca viram sucesso, nenhum dado falso é criado.
// Os módulos em js/api/*.js só DECLARAM os métodos (KandiAPI.define). Conversão do formato do Pekora -> contrato da UI = função `adapt` de cada método.
(function () {
  "use strict";
  var C = window.KANDI_CONFIG, DK = "kandi_demo_user";
  function save(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  // ---------- erros ----------
  // kind: http | network | timeout | format | unconnected | demo | config
  function ApiError(status, message, fields, kind) { this.name = "ApiError"; this.status = status; this.message = message; this.fields = fields || {}; this.kind = kind || "http"; }
  ApiError.prototype = Object.create(Error.prototype); ApiError.prototype.constructor = ApiError;
  function first(v) { return Array.isArray(v) ? first(v[0]) : (typeof v === "string" ? v : (v && typeof v.message === "string" ? v.message : null)); }
  // Lê formatos de erro comuns (nenhum é presumido como o do Pekora): { message }, ProblemDetails { title, detail, errors:{campo:[msg]} }, { errors:[{message}] }, { error:"..." }.
  function parseError(data, status) {
    var msg = null, fields = {};
    if (typeof data === "string") msg = data;
    else if (data && typeof data === "object") {
      msg = first(data.message) || first(data.Message) || first(data.detail) || first(data.error) || first(data.title);
      var er = data.errors || data.Errors;
      if (er && typeof er === "object" && !Array.isArray(er)) Object.keys(er).forEach(function (k) { var m = first(er[k]); if (m) fields[k] = m; });
      else if (Array.isArray(er) && er.length) msg = msg && msg !== data.title ? msg : (first(er) || msg);
    }
    if (!msg) msg = status ? "The server returned an error (HTTP " + status + ")." : "Something went wrong.";
    return { message: msg, fields: fields };
  }

  // ---------- definição de métodos ----------
  var DEFS = {};
  // E(método, opções): { m, p:"", svc:"default", auth:true, csrf:true, adapt:null, raw:false, timeout:0 }
  //   p       caminho (com {id}/{rowId}... vindos de params). Vazio = NÃO CONECTADO (a UI mostra um erro claro, nunca falha em silêncio).
  //   adapt   adapt(resposta, opções) -> formato que a UI espera (ver KandiAPI.adapters e PEKORA_BACKEND_INTEGRATION.md seção 3).
  //   raw     true = a resposta pode não ser JSON (ex.: Razor Page): o adapt recebe { status, ok, redirected, url, text, data } e DECIDE se é sucesso (lance ApiError se não for).
  //   timeout ms, para métodos lentos.
  function E(m, o) { var d = { m: m, p: "", svc: "default", root: false, auth: true, csrf: true, adapt: null, raw: false, timeout: 0 }; for (var k in o || {}) d[k] = o[k]; return d; }
  function define(mod, defs) { Object.keys(defs).forEach(function (k) { DEFS[mod + "." + k] = defs[k]; }); }

  // ---------- adaptadores: converte o formato do backend para os contratos da UI SEM inventar valores ----------
  // Um campo que não existe na resposta fica ausente (nunca recebe valor padrão falso).
  var KEYS = {
    game: ["id", "name", "thumbnail", "playing", "likeRatio", "url"],
    item: ["id", "name", "creator", "thumbnail", "price", "value", "sales", "isNew", "worn", "url"],
    detail: ["title", "subtitle", "thumbnail", "description", "stats", "sections"],
    row: ["id", "title", "subtitle", "meta", "thumbnail", "href"],
    profile: ["id", "username", "thumbnail", "description", "stats", "sections"],
    trade: ["partnerId", "offerItems", "requestItems", "offerRobux", "requestRobux"]
  };
  function get(o, path) { if (o == null || path == null) return undefined; var p = String(path).split("."), v = o; for (var i = 0; i < p.length; i++) { if (v == null) return undefined; v = v[p[i]]; } return v; }
  // shape("game", bruto, { name: "title", playing: "stats.online", thumbnail: function (r) { return ...; }, extras: { creatorId: "creator.id" } })
  function shape(kind, raw, spec) {
    var out = {}; spec = spec || {};
    KEYS[kind].forEach(function (k) {
      var s = spec[k] !== undefined ? spec[k] : k, v = typeof s === "function" ? s(raw) : get(raw, s);
      if (v !== undefined && v !== null) out[k] = v;
    });
    Object.keys(spec.extras || {}).forEach(function (k) { var s = spec.extras[k], v = typeof s === "function" ? s(raw) : get(raw, s); if (v !== undefined && v !== null) out[k] = v; });
    return out;
  }
  // list(itensJáConvertidos, { hasMore, total, totalPages }) -> { items, hasMore, total } (total = null quando o backend não informa)
  function list(items, meta) {
    meta = meta || {};
    var out = { items: Array.isArray(items) ? items : [], hasMore: !!meta.hasMore, total: typeof meta.total === "number" ? meta.total : null };
    if (typeof meta.totalPages === "number") out.totalPages = meta.totalPages;
    return out;
  }
  var adapters = {
    get: get, shape: shape, list: list,
    game: function (r, spec) { return shape("game", r, spec); }, item: function (r, spec) { return shape("item", r, spec); },
    detail: function (r, spec) { return shape("detail", r, spec); }, row: function (r, spec) { return shape("row", r, spec); },
    profile: function (r, spec) { return shape("profile", r, spec); }, trade: function (r, spec) { return shape("trade", r, spec); },
    // Paginação por cursor: a UI manda page/limit; guarde o cursor de cada página. q = cur.query(o); ...; hasMore = cur.after(o, cursorDaProxima)
    cursor: function (key) {
      var s = {}; function k(o) { var q = Object.assign({}, o && o.query); delete q.page; delete q.cursor; return key + "|" + JSON.stringify(q); }
      return {
        query: function (o) { var q = Object.assign({}, o && o.query), pg = +q.page || 1; if (pg > 1 && s[k(o)] && s[k(o)][pg]) q.cursor = s[k(o)][pg]; return q; },
        after: function (o, next) { var pg = +(o && o.query && o.query.page) || 1; (s[k(o)] = s[k(o)] || {})[pg + 1] = next || null; return !!next; }
      };
    }
  };

  // ---------- contratos (validação defensiva: só avisa no console; só falha quando a resposta é impossível de usar) ----------
  var LIST_KEYS = ["items", "rows", "data", "groups", "tiers"];
  var CONTRACTS = {
    "games.search": "list", "games.favorites": "list", "games.recommendations": "list", "catalog.search": "list", "catalog.limiteds": "list", "catalog.recommendations": "list",
    "library.search": "list", "inventory.list": "list", "inventory.collectibles": "list", "users.inventory": "list", "users.collectibles": "list", "users.search": "list",
    "develop.mine": "list", "trades.list": "list", "friends.list": "list", "groups.search": "list", "groups.mine": "list", "economy.transactions": "list",
    "games.get": "detail", "catalog.get": "detail", "library.get": "detail", "groups.get": "detail", "users.get": "profile", "trades.get": "trade", "auth.me": "me"
  };
  function problems(kind, r) {
    var p = [];
    if (kind === "list") {
      if (Array.isArray(r)) return p;
      var has = LIST_KEYS.some(function (k) { return Array.isArray(r[k]); });
      if (!has) p.push("expected { items: [] } (or an array)");
      if (r.hasMore != null && typeof r.hasMore !== "boolean") p.push("hasMore must be boolean");
    } else if (kind === "detail") { if (!(r.title || r.name)) p.push("missing title|name"); }
    else if (kind === "profile") { if (r.id == null) p.push("missing id"); if (!(r.username || r.name || r.title)) p.push("missing username"); }
    else if (kind === "trade") { if (r.partnerId == null) p.push("missing partnerId"); }
    else if (kind === "me") { if (!r.username) p.push("missing username"); }
    return p;
  }
  function check(name, r) {
    var kind = CONTRACTS[name]; if (!kind) return;
    if (r == null || typeof r !== "object") throw new ApiError(0, "The server sent an unexpected response for " + name + ".", null, "format");
    var p = problems(kind, r);
    if (p.length && window.console) console.warn("[KandiAPI] contract mismatch in " + name + " (" + kind + "): " + p.join("; ") + ". Fix the adapt() of this method.");
  }

  // ---------- modo demo: sem rede, dados vazios, escritas desativadas ----------
  var EMPTY = {
    "auth.me": { username: "Guest", currency: 0, tickets: 0, events: 0 },
    "site.home": { continue: [], popular: [], feed: [], blog: [], events: [] },
    "catalog.search": { items: [], total: 0, page: 1, hasMore: false },
    "groups.mine": { groups: [] }, "economy.transactions": { rows: [] }, "avatar.items": { items: [] },
    "membership.tiers": { tiers: [], membership: null }
  };
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  function demoCall(name, m, o) {
    if (name === "auth.login" || name === "auth.signup") { var u = copy((window.KandiTestData || {})["auth.me"] || EMPTY["auth.me"]); u.username = (o.body && o.body.username) || "Teste"; save(DK, JSON.stringify(u)); return Promise.resolve({ user: u }); }
    if (name === "auth.logout") { save(DK, null); return Promise.resolve(null); }
    if (name === "auth.me") { var s = load(DK); return Promise.resolve(s ? JSON.parse(s) : copy(EMPTY[name])); }
    // MODO TESTE: escritas são SIMULADAS (nada é salvo, nada é real); leituras usam js/testdata.js ("Teste ...").
    if (m !== "GET") return Promise.resolve(Object.assign({ ok: true, simulated: true, message: "Test mode: simulated. Nothing was saved." }, (window.KandiTestData || {})["w:" + name] || {}));
    var f = (window.KandiTestData || {})[name]; if (f !== undefined) return Promise.resolve(copy(f));
    return Promise.resolve(EMPTY[name] ? copy(EMPTY[name]) : {});
  }

  // ---------- transporte único ----------
  var csrf = null;
  async function send(method, base, d, o) {
    var url = new URL(base, location.href);
    Object.keys(o.query || {}).forEach(function (k) { var v = o.query[k]; if (v !== "" && v != null) url.searchParams.set(k, v); });
    for (var attempt = 0; attempt < 2; attempt++) {
      var h = { Accept: "application/json" }, init = { method: method, headers: h }, isForm = typeof FormData !== "undefined" && o.body instanceof FormData;
      if (o.body) { if (!isForm) h["Content-Type"] = "application/json"; init.body = isForm ? o.body : JSON.stringify(o.body); }
      if (C.AUTH_MODE === "token") { var t = load(C.TOKEN_KEY); if (t) h.Authorization = "Bearer " + t; }
      if (C.AUTH_MODE === "cookie") init.credentials = "include";
      if (d.csrf !== false && method !== "GET" && csrf && C.CSRF && C.CSRF.header) h[C.CSRF.header] = csrf;
      var ac = new AbortController(), ms = d.timeout || (isForm ? C.UPLOAD_TIMEOUT_MS : C.TIMEOUT_MS) || 10000, to = setTimeout(function () { ac.abort(); }, ms), r;
      init.signal = ac.signal;
      try { r = await fetch(url, init); }
      catch (e) { throw e && e.name === "AbortError" ? new ApiError(0, "The server took too long to respond.", null, "timeout") : new ApiError(0, "Could not reach the server.", null, "network"); }
      finally { clearTimeout(to); }
      var nt = C.CSRF && C.CSRF.header ? r.headers.get(C.CSRF.header) : null; if (nt) csrf = nt;
      if (C.CSRF && r.status === C.CSRF.retryStatus && nt && method !== "GET" && !attempt) continue;
      var ct = r.headers.get("content-type") || "", isJson = /json/i.test(ct), data = null, text = null;
      if (r.status !== 204) {
        if (isJson) { try { data = await r.json(); } catch (e) { if (r.ok && !d.raw) throw new ApiError(r.status, "The server sent a response that is not valid JSON.", null, "format"); } }
        else { try { text = await r.text(); } catch (e) {} if (!d.raw && !r.ok && text && text.length < 300 && !/^\s*</.test(text)) data = text; }
      }
      if (!r.ok) {
        if (r.status === 401 && d.auth !== false) { if (C.AUTH_MODE === "token") save(C.TOKEN_KEY, null); window.dispatchEvent(new CustomEvent("kandi:unauthorized", { detail: { status: 401 } })); }
        var pe = parseError(data, r.status), err = new ApiError(r.status, pe.message, pe.fields, "http"); err.data = data; throw err;
      }
      if (d.raw) return { status: r.status, ok: true, redirected: r.redirected, url: r.url, text: text, data: data };
      // Sucesso só com JSON (ou 204). Uma página HTML com status 200 (ex.: redirecionamento para o login) NÃO é sucesso.
      if (r.status !== 204 && !isJson) throw new ApiError(r.status, "The server sent a web page instead of data" + (r.redirected ? " (it redirected the request)" : "") + ". The endpoint may not be a JSON API.", null, "format");
      return data;
    }
  }
  function baseFor(d) { if (d.root) return ""; var b = C.SERVICES && C.SERVICES[d.svc || "default"]; return (b || C.API_BASE || "").replace(/\/$/, ""); }
  // Para a API de teste local (USE_STUB): mapeia métodos legados para config.ENDPOINTS. Nunca preenche rotas do Pekora.
  var STUB = { "auth.login": "login", "auth.signup": "signup", "auth.logout": "logout", "auth.me": "me", "site.home": "home", "catalog.search": "catalog", "feed.post": "feedPost", "groups.mine": "groups", "economy.transactions": "transactions", "avatar.items": "avatar", "membership.tiers": "buildersClub" };

  // KandiAPI.call("games.search", { params: {id}, query: {}, body: {} }) -> Promise (resolve só com sucesso real; qualquer falha rejeita com ApiError)
  async function call(name, o) {
    o = o || {}; var d = DEFS[name];
    if (!d) throw new ApiError(0, "Unknown API method: " + name, null, "config");
    var m = d.m || "GET";
    if (C.DEMO) return demoCall(name, m, o);
    var p = d.p || (C.USE_STUB && STUB[name] ? C.ENDPOINTS[STUB[name]] : "");
    if (!p) throw new ApiError(501, "Not connected yet: " + name + " (edit js/api/" + name.split(".")[0] + ".js)", null, "unconnected");
    var base = baseFor(d); if (!base && !d.root && !/^https?:/.test(p)) throw new ApiError(0, "API_BASE is not configured (js/config.js).", null, "config");
    var routeParams = typeof d.params === "function" ? d.params(o.params || {}, o) : (o.params || {});
    var path = p.replace(/\{(\w+)\}/g, function (_, k) { if (routeParams[k] == null) throw new ApiError(0, "Missing parameter: " + k, null, "config"); return encodeURIComponent(routeParams[k]); });
    var requestOptions = typeof d.prepare === "function" ? (d.prepare(o) || o) : o;
    var r = await send(m, base + path, d, requestOptions), out;
    try { out = d.adapt ? d.adapt(r, o) : r; }
    catch (e) { if (e instanceof ApiError) throw e; throw new ApiError(0, "The server response for " + name + " does not match the format the page expects.", null, "format"); }
    check(name, out);
    return out;
  }

  // ---------- compatibilidade: funções antigas agora são apenas atalhos para call() (uma única camada) ----------
  function session(res) { if (res && res.token && C.AUTH_MODE === "token") save(C.TOKEN_KEY, res.token); return res && res.user ? res.user : res; }
  function mode() { return C.DEMO ? "demo" : (C.USE_STUB ? "stub" : "live"); }
  // Avisos de integração pendente (mostrados como aviso discreto fora do modo demo). Não mudam o comportamento.
  function configIssues() {
    var i = [], K = C.CONFIRMED || {};
    if (C.DEMO || C.USE_STUB) return i;
    if (!K.api) i.push("API_BASE / SERVICES not confirmed");
    if (!K.auth || C.AUTH_MODE === "unset") i.push("authentication mode not set");
    if (!K.csrf) i.push("CSRF not confirmed");
    return i;
  }
  window.KandiAPI = {
    ApiError: ApiError, E: E, define: define, call: call, defs: DEFS, adapters: adapters, contracts: CONTRACTS, mode: mode, configIssues: configIssues,
    login: function (b) { return call("auth.login", { body: b }).then(session); },
    signup: function (b) { return call("auth.signup", { body: b }).then(session); },
    // O logout só limpa o token local depois de o servidor confirmar; se falhar, o erro chega à interface (a sessão pode continuar ativa no servidor).
    logout: function () { return call("auth.logout").then(function () { save(C.TOKEN_KEY, null); }); },
    // Só considera o usuário autenticado se o backend devolver um usuário. Falha de rede/5xx NÃO é "deslogado": o erro é repassado.
    me: function () {
      return call("auth.me").then(function (u) {
        u = u && u.user ? u.user : u;
        if (!u || typeof u !== "object") throw new ApiError(401, "You are not signed in.", null, "http");
        if (!u.username) throw new ApiError(0, "The account response from the server has no username (see the auth.me contract).", null, "format");
        return u;
      });
    },
    home: function () { return call("site.home"); },
    catalog: function (q) { return call("catalog.search", { query: q }); },
    feedPost: function (b) { return call("feed.post", { body: b }); },
    groups: function () { return call("groups.mine"); },
    transactions: function (q) { return call("economy.transactions", { query: q }); },
    avatar: function (q) { return call("avatar.items", { query: q }); },
    buildersClub: function () { return call("membership.tiers"); }
  };
})();
