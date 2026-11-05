"use strict";

// Demo server: one storefront, rendered by three server renderers. Everything lives under
// BASE_PATH (default /northstar, where the public site proxies it with the path preserved):
//
//   <base>/                          about page
//   <base>/{react,prepack,hybrid}/…  the store, rendered by that renderer:
//        /                 home              /shop             all products
//        /c/:slug          category          /search?q=…       search results
//        /p/:sku           product detail    /cart             cart
//        /signin           sign-in stub      (anything else)   404 page, rendered by the app
//      listings take sort=, in_stock=1, brand= (repeatable), price= (repeatable) and page= (or page=all)
//      POST /cart/add, /cart/update, /theme, /signin, /signout: update a cookie, then go back
//      (a 200 with a Refresh header; see redirectWithCookies)
//   <base>/compare                   renders the same inputs with all three in-process, checks the
//                                    HTML is identical and shows render times and fallback rates
//   <base>/styles.css, /art/*.svg, /fonts/*.woff2   static files from public/
//
// The page data comes from the fixed catalog plus the request (store/page.js): nothing is random.
// Cart, theme, signed-in state and one-time messages live in cookies scoped to <base>, so they
// carry over between renderers. Each store response has a Server-Timing header with the time spent
// in the render call alone.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { performance } = require("perf_hooks");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const App = require("./dist/app.js");
const { buildPage, parseCart, serializeCart } = require("./store/page.js");
const { BY_SKU } = require("./store/catalog.js");
const { getLiveCheckCorpus, allProductsData } = require("./store/corpus.js");
const { getCheckCorpus } = require("./src/data.js");

const port = Number(process.env.PORT) || 3100;
const host = process.env.HOST || "0.0.0.0";
// "" serves at the root; otherwise a prefix like "/northstar" (no trailing slash).
const BASE = (process.env.BASE_PATH === undefined ? "/northstar" : process.env.BASE_PATH).replace(/\/+$/, "");
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const VERSIONS = [
  {
    id: "react",
    label: "React",
    title: "renderToString",
    summary: "ReactDOMServer.renderToString on the bundled app (dist/app.js). The reference output.",
    render: (data) => ReactDOMServer.renderToString(React.createElement(App, { data })),
  },
  {
    id: "prepack",
    label: "Prepack",
    title: "Prepack-specialized",
    summary:
      "dist/render-prepack.js: the revived Prepack partially evaluates React's server renderer together with the app for a data schema. No React at runtime; data outside the schema falls back to React.",
    render: require("./dist/render-prepack.js").render,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    title: "Hybrid (traced templates)",
    summary:
      "dist/render-hybrid.js: templates learned by tracing the real app under React, with runtime guards; a failed guard renders that request with React.",
    render: require("./dist/render-hybrid.js").render,
  },
];
const byId = Object.fromEntries(VERSIONS.map((v) => [v.id, v]));
const STATIC_TYPES = { ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

http
  .createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Internal error");
    });
  })
  .listen(port, host, () => console.log(`Northstar Supply demo on http://${host}:${port}${BASE}/`));

async function handle(req, res) {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;
  if (pathname !== BASE && !pathname.startsWith(BASE + "/")) return plain(res, 404, "Not found");
  const route = pathname.slice(BASE.length) || "/";

  if (route === "/") return send(res, 200, landingPage());
  if (route === "/compare") return send(res, 200, comparePage(url.searchParams));
  if (/^\/(styles\.css|art\/[a-z-]+\.svg|fonts\/[\w.-]+\.woff2)$/.test(route)) return serveStatic(res, route);

  const m = /^\/(react|prepack|hybrid)(\/.*)?$/.exec(route);
  if (!m) {
    // A store path without a renderer (e.g. an old /northstar/search?q=… link): use React.
    return redirect(res, `${BASE}/react${route}${url.search}`, 302);
  }
  const version = byId[m[1]];
  const storePath = (m[2] || "/").replace(/(.)\/+$/, "$1");
  if (req.method === "POST") return handleAction(req, res, version, storePath);
  if (req.method !== "GET" && req.method !== "HEAD") return plain(res, 405, "Method not allowed");

  const cookies = parseCookies(req.headers.cookie);
  const page = buildPage({
    base: `${BASE}/${version.id}`,
    assets: BASE,
    path: storePath,
    query: url.searchParams,
    cookies: { cart: cookies.ns_cart, theme: cookies.ns_theme, user: cookies.ns_user, flash: cookies.ns_flash },
    nowSec: Math.floor(Date.now() / 1000),
  });
  const fallbacksBefore = fallbackCount(version);
  const t0 = performance.now();
  const html = version.render(page.data);
  const ms = performance.now() - t0;
  const fellBack = fallbackCount(version) > fallbacksBefore;
  const headers = { "server-timing": `render;dur=${ms.toFixed(3)};desc="${version.id} render"` };
  if (cookies.ns_flash) headers["set-cookie"] = cookie("ns_flash", "", 0);
  send(res, page.status, storefrontPage(version, page, html, ms, fellBack, storePath + url.search), headers);
}

// Form posts: update a cookie, then redirect back to a page of the same renderer.
async function handleAction(req, res, version, storePath) {
  const form = new URLSearchParams(await readBody(req));
  const cookies = parseCookies(req.headers.cookie);
  const back = safeBack(form.get("back"));
  const to = (p) => `${BASE}/${version.id}${p}`;
  const set = [];
  let dest;
  if (storePath === "/cart/add" || storePath === "/cart/update") {
    const sku = form.get("sku");
    const items = parseCart(cookies.ns_cart);
    const qty = Math.max(0, Math.min(99, parseInt(form.get("qty") || "1", 10) || 0));
    if (BY_SKU.has(sku)) {
      const existing = items.find((i) => i.sku === sku);
      if (storePath === "/cart/add") {
        if (existing) existing.qty = Math.min(99, existing.qty + Math.max(1, qty));
        else items.push({ sku, qty: Math.max(1, qty) });
        set.push(cookie("ns_flash", "added:" + sku, 60));
      } else if (form.get("remove") === "1" || qty === 0) {
        if (existing) items.splice(items.indexOf(existing), 1);
        set.push(cookie("ns_flash", "removed:" + sku, 60));
      } else if (existing) {
        existing.qty = qty;
        set.push(cookie("ns_flash", "updated", 60));
      }
    }
    set.push(cookie("ns_cart", serializeCart(items), COOKIE_MAX_AGE));
    dest = storePath === "/cart/update" ? to("/cart") : to(back || "/cart");
  } else if (storePath === "/theme") {
    set.push(cookie("ns_theme", form.get("theme") === "dark" ? "dark" : "light", COOKIE_MAX_AGE));
    dest = to(back || "/");
  } else if (storePath === "/signin") {
    set.push(cookie("ns_user", "demo", COOKIE_MAX_AGE), cookie("ns_flash", "signin", 60));
    dest = to(back || "/");
  } else if (storePath === "/signout") {
    set.push(cookie("ns_user", "", 0), cookie("ns_flash", "signout", 60));
    dest = to("/");
  } else {
    return plain(res, 404, "Not found");
  }
  redirectWithCookies(res, dest, set);
}

// Post/redirect/get, but without a 3xx: the site's proxy follows redirects itself (dropping the
// Set-Cookie headers on the way), so the browser gets a 200 that sets the cookies and moves on with
// a Refresh header, a meta refresh and location.replace (which keeps the post out of history).
function redirectWithCookies(res, dest, cookies) {
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    refresh: `0;url=${dest}`,
    "set-cookie": cookies,
  });
  res.end(`<!doctype html>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${escapeHtml(dest)}">
<title>Redirecting…</title>
<script>location.replace(${JSON.stringify(dest).replace(/</g, "\\u003c")})</script>
<p><a href="${escapeHtml(dest)}">Continue</a></p>
`);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16384) req.destroy(new Error("body too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

// Only same-site store paths ("/…", not "//host").
function safeBack(value) {
  return typeof value === "string" && /^\/(?!\/)[^\s\\]*$/.test(value) ? value : null;
}

function parseCookies(header) {
  const out = {};
  for (const part of String(header || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) {
      try {
        out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        // Ignore malformed cookie values.
      }
    }
  }
  return out;
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=${BASE || "/"}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

function serveStatic(res, route) {
  const file = path.join(__dirname, "public", route);
  fs.readFile(file, (err, body) => {
    if (err) return plain(res, 404, "Not found");
    res.writeHead(200, { "content-type": STATIC_TYPES[path.extname(file)], "cache-control": "public, max-age=300" });
    res.end(body);
  });
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, Object.assign({ "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, headers));
  res.end(body);
}

function plain(res, status, text) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(text);
}

function redirect(res, location, status) {
  res.writeHead(status, { location });
  res.end();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// The store page: a slim renderer switcher (links to the same URL in the other renderers), then
// the app's HTML, untouched.
function storefrontPage(version, page, appHtml, ms, fellBack, current) {
  const links = VERSIONS.map(
    (v) =>
      `<a href="${escapeHtml(`${BASE}/${v.id}${current}`)}"${v === version ? ' aria-current="true"' : ""}>${v.label}</a>`
  ).join("");
  const status =
    version.id === "react"
      ? "reference"
      : fellBack
      ? `<span class="demo-fallback" title="This request's data was outside what the ${version.label} build was specialized for, so it was rendered with React (same HTML).">fell back to React</span>`
      : "specialized";
  const theme = page.data.theme;
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="${theme}">
<title>${escapeHtml(page.title)}</title>
<link rel="preload" href="${BASE}/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${BASE}/styles.css">
<script>document.documentElement.classList.add("js")</script>
</head>
<body class="store-body">
<div class="demo-bar" data-renderer="${version.id}">
  <div class="demo-inner">
    <span class="demo-title">Same app, three renderers</span>
    <nav class="demo-switch" aria-label="Renderer">${links}</nav>
    <span class="demo-stat" title="${escapeHtml(version.summary)}"><span class="demo-impl">${version.title} · </span><span class="demo-time">${ms.toFixed(3)} ms</span><span class="demo-status"> · ${status}</span></span>
    <span class="demo-links"><a href="${BASE}/compare">Compare</a><a href="${BASE}/">About</a></span>
  </div>
</div>
${appHtml}
<script>
document.addEventListener("change", function (e) {
  var f = e.target.form;
  if (f && f.getAttribute("data-autosubmit")) f.requestSubmit ? f.requestSubmit() : f.submit();
});
if (window.matchMedia("(max-width: 900px)").matches) {
  var d = document.querySelector(".ns-filters");
  if (d) d.removeAttribute("open");
}
</script>
</body>
</html>
`;
}

function landingPage() {
  const cards = VERSIONS.map(
    (v) => `<a class="doc-card" href="${BASE}/${v.id}/">
  <span class="doc-card-kicker">${v.label}</span>
  <strong>${v.title}</strong>
  <span>${escapeHtml(v.summary)}</span>
  <span class="doc-card-link">Open the store →</span>
</a>`
  ).join("\n");
  return docPage(
    "Northstar Supply: one React app, three server renderers",
    `<p class="doc-eyebrow">Demo</p>
<h1>Northstar Supply</h1>
<p class="doc-lede">A small industrial-tools store written as an ordinary React 18 app (function components,
four contexts, hooks, lists, <code>useId</code>, forms), server-rendered three ways. The app is known ahead of
time and the request data is not. The two specialized renderers produce <strong>the same bytes</strong> as
<code>renderToString</code>, in a fraction of the time.</p>
<div class="doc-cards">
${cards}
</div>
<p class="doc-cta"><a class="doc-button" href="${BASE}/react/">Open the store</a> <a class="doc-button doc-button-secondary" href="${BASE}/compare">Compare render times</a></p>
<h2>Using the demo</h2>
<ul>
<li>Every store page exists in all three renderers: <code>${BASE}/react/search?q=drill</code>,
<code>${BASE}/prepack/search?q=drill</code> and <code>${BASE}/hybrid/search?q=drill</code> return the same HTML.
The bar at the top switches renderer for the current page.</li>
<li>The store is fully server-rendered and works without JavaScript: search, category pages, sorting and filters,
pagination (or <em>View all</em> for the whole catalog, ~300 KB of HTML), product pages, a cookie-based cart and a
sign-in stub. A light/dark theme switch is in the header.</li>
<li>The bar shows the time spent in the render call alone (<code>performance.now()</code> around it), and whether a
specialized renderer handled the request itself or fell back to React. The same number is in the
<code>Server-Timing</code> response header.</li>
</ul>
<h2>How the specialized renderers are made</h2>
<ul>
<li><strong>Prepack</strong>: the revived Prepack runs a small port of React 18's server renderer together with the
app, with the request data abstract (a schema inferred from training requests). React and the component tree fold
away, leaving string concatenation, loops and escaping. A schema check guards each call; data outside the schema
is rendered with React.</li>
<li><strong>Hybrid</strong>: the app runs under the real React on training requests while every operation is traced.
Each component becomes a template of constant HTML chunks and slots, with a guard for every branch and type the
trace relied on. A failed guard renders that request with React.</li>
</ul>
<p>Both are built from the same bundle (<code>dist/app.js</code>) and checked byte-for-byte against
<code>renderToString</code> on 600 live-store requests and a 500-input random benchmark corpus. Source:
<a href="https://github.com/jlongster/northstar-supply">jlongster/northstar-supply</a>.</p>`
  );
}

// Corpora are built once, lazily: live-store requests, whole-catalog listings, and the random
// benchmark corpus from src/data.js.
let corpora = null;
function getCorpora() {
  if (!corpora) {
    const live = getLiveCheckCorpus(500, 0);
    corpora = {
      live,
      all: Array.from({ length: 20 }, (_, i) => allProductsData(9000 + i)),
      bench: getCheckCorpus().slice(0, 475),
    };
  }
  return corpora;
}

function comparePage(params) {
  const clampInt = (name, def, min, max) => {
    const n = params.has(name) ? Number(params.get(name)) | 0 : def;
    return Math.min(max, Math.max(min, n));
  };
  const nLive = clampInt("live", 200, 0, 500);
  const nAll = clampInt("all", 5, 0, 20);
  const nBench = clampInt("bench", 0, 0, 475);
  const reps = clampInt("reps", 5, 1, 30);
  const c = getCorpora();
  const groups = [
    { id: "live", title: "Store pages", note: "random live requests: home, categories, search, product pages, cart, sign-in, 404", inputs: c.live.slice(0, nLive) },
    { id: "all", title: "Whole catalog", note: "the “View all” listing: 192 products, ~300 KB of HTML", inputs: c.all.slice(0, nAll) },
    { id: "bench", title: "Benchmark corpus", note: "src/data.js: random data (locales, themes, escaping-heavy text)", inputs: c.bench.slice(0, nBench) },
  ].filter((g) => g.inputs.length > 0);

  const started = performance.now();
  const results = groups.map((group) => {
    // Warm-up, the byte-identical check and the fallback rate: every renderer on every input once.
    let identical = 0;
    const fellBack = VERSIONS.map(() => 0);
    for (const data of group.inputs) {
      const outputs = VERSIONS.map((v, j) => {
        const before = fallbackCount(v);
        const html = v.render(data);
        if (fallbackCount(v) > before) fellBack[j]++;
        return html;
      });
      if (outputs.every((html) => html === outputs[0])) identical++;
    }
    for (const v of VERSIONS) {
      const until = performance.now() + 200;
      for (let pass = 0; pass < 2 || performance.now() < until; pass++) for (const data of group.inputs) v.render(data);
    }
    const times = VERSIONS.map(() => []);
    for (let r = 0; r < reps; r++) {
      group.inputs.forEach((data, i) => {
        // Rotate the order so no renderer always runs first (or last) on an input.
        for (let k = 0; k < VERSIONS.length; k++) {
          const j = (k + i + r) % VERSIONS.length;
          const t0 = performance.now();
          VERSIONS[j].render(data);
          times[j].push(performance.now() - t0);
        }
      });
    }
    const medians = times.map((t) => quantile(t, 0.5));
    return {
      group,
      identical,
      rows: VERSIONS.map((v, j) => ({
        version: v,
        median: medians[j],
        p90: quantile(times[j], 0.9),
        mean: times[j].reduce((a, b) => a + b, 0) / times[j].length,
        speedup: medians[0] / medians[j],
        fallbackRate: fellBack[j] / group.inputs.length,
        fallbacks: fellBack[j],
      })),
    };
  });
  const elapsed = performance.now() - started;

  const body = results
    .map(({ group, identical, rows }) => {
      const worst = Math.max(...rows.map((r) => r.median));
      const n = group.inputs.length;
      return `<section class="doc-result">
<h2>${group.title} <span class="doc-muted">· ${n} inputs × ${reps} rounds</span></h2>
<p class="doc-muted">${group.note}</p>
<div class="doc-table-wrap"><table class="doc-table">
<thead><tr><th>renderer</th><th class="doc-bar-col"></th><th>median</th><th>p90</th><th>mean</th><th>speedup</th><th>fell back to React</th></tr></thead>
<tbody>
${rows
  .map(
    (r) => `<tr>
<td><strong>${r.version.label}</strong></td>
<td class="doc-bar-col"><span class="doc-bar doc-bar-${r.version.id}" style="width:${Math.max(2, Math.round((r.median / worst) * 100))}%"></span></td>
<td>${fmtMs(r.median)}</td><td>${fmtMs(r.p90)}</td><td>${fmtMs(r.mean)}</td>
<td><strong>${r.speedup.toFixed(2)}×</strong></td>
<td>${r.version.id === "react" ? "–" : `${(r.fallbackRate * 100).toFixed(1)}% <span class="doc-muted">(${r.fallbacks}/${n})</span>`}</td>
</tr>`
  )
  .join("\n")}
</tbody>
</table></div>
<p>HTML byte-identical across all three: <span class="${identical === n ? "doc-ok" : "doc-bad"}">${identical}/${n} inputs</span></p>
</section>`;
    })
    .join("\n");

  return docPage(
    "Northstar Supply: render time comparison",
    `<p class="doc-eyebrow"><a href="${BASE}/">Northstar Supply</a></p>
<h1>Render time comparison</h1>
<p class="doc-lede">The same request data rendered in this server process by all three renderers, after a warm-up.
Times are for the render call alone (<code>performance.now()</code>), interleaved per input so the three see the same
machine load. A specialized renderer that meets data it was not specialized for hands that request to React; the
“fell back” column is the share of inputs where that happened (the HTML is identical either way).</p>
<form class="doc-form" method="get" action="${BASE}/compare">
<label>store pages <input name="live" type="number" min="0" max="500" value="${nLive}"></label>
<label>whole catalog <input name="all" type="number" min="0" max="20" value="${nAll}"></label>
<label>benchmark inputs <input name="bench" type="number" min="0" max="475" value="${nBench}"></label>
<label>rounds <input name="reps" type="number" min="1" max="30" value="${reps}"></label>
<button type="submit" class="doc-button">Run again</button>
</form>
${body}
<p class="doc-muted">Measured in ${(elapsed / 1000).toFixed(1)} s on ${os.cpus().length} vCPUs, Node ${process.version}.
<a href="${BASE}/">About this demo</a> · <a href="${BASE}/react/">Open the store</a></p>`
  );
}

function docPage(title, inner) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="${BASE}/styles.css">
</head>
<body class="doc"><main class="doc-inner">
${inner}
</main></body>
</html>
`;
}

function fallbackCount(version) {
  return version.render.stats ? version.render.stats.fallbacks : 0;
}

function quantile(values, q) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

function fmtMs(ms) {
  return ms < 1 ? `${(ms * 1000).toFixed(1)} µs` : `${ms.toFixed(2)} ms`;
}
