"use strict";

// Demo server: the same storefront rendered three ways. Every route lives under BASE_PATH
// (default /northstar, where the public site proxies it with the path preserved):
//
//   <base>/            landing page
//   <base>/react       ReactDOMServer.renderToString of dist/app.js
//   <base>/prepack     dist/render-prepack.js (specialized by the revived Prepack)
//   <base>/hybrid      dist/render-hybrid.js (React-Hybrid: traced templates with guards)
//   <base>/compare     renders the same seeded inputs with all three in-process and compares
//   <base>/styles.css  storefront stylesheet
//
// The storefront pages take ?seed=N (deterministic data; otherwise a random seed per request) and
// ?large=1 (~200 products instead of 0-2). Each response carries a Server-Timing header with the
// time spent in the render call alone.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const fs = require("fs");
const http = require("http");
const path = require("path");
const { performance } = require("perf_hooks");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const App = require("./dist/app.js");
const { generateRequest } = require("./src/data.js");

const port = Number(process.env.PORT) || 3100;
const host = process.env.HOST || "0.0.0.0";
// "" serves at the root; otherwise a prefix like "/northstar" (no trailing slash).
const BASE = (process.env.BASE_PATH === undefined ? "/northstar" : process.env.BASE_PATH).replace(/\/+$/, "");

const VERSIONS = [
  {
    id: "react",
    label: "React",
    title: "Plain React",
    summary: "ReactDOMServer.renderToString on the bundled app (dist/app.js). The reference output.",
    render: (data) => ReactDOMServer.renderToString(React.createElement(App, { data })),
  },
  {
    id: "prepack",
    label: "Prepack",
    title: "Prepack-specialized",
    summary:
      "dist/render-prepack.js: the revived Prepack partially evaluates React's server renderer and the app for a data schema. No React at runtime.",
    render: require("./dist/render-prepack.js").render,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    title: "Hybrid (traced templates)",
    summary:
      "dist/render-hybrid.js: templates learned by tracing the real app under React, with runtime guards that fall back to React.",
    render: require("./dist/render-hybrid.js").render,
  },
];
const byId = Object.fromEntries(VERSIONS.map((v) => [v.id, v]));
const styles = fs.readFileSync(path.join(__dirname, "public", "styles.css"));

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname.replace(/\/+$/, "");
    if (pathname !== BASE && !pathname.startsWith(BASE + "/")) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const route = pathname.slice(BASE.length) || "/";
    if (route === "/styles.css") {
      res.writeHead(200, { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=300" });
      res.end(styles);
      return;
    }
    if (route === "/") return send(res, landingPage());
    if (route === "/compare") return send(res, comparePage(url.searchParams));
    const version = byId[route.slice(1)];
    if (!version) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const seed = url.searchParams.has("seed") ? Number(url.searchParams.get("seed")) | 0 : (Math.random() * 2 ** 31) | 0;
    const large = url.searchParams.get("large") === "1";
    const data = generateRequest(seed, large ? "large" : "small");
    const t0 = performance.now();
    const html = version.render(data);
    const ms = performance.now() - t0;
    send(res, storefrontPage(version, html, ms, seed, large), {
      "server-timing": `render;dur=${ms.toFixed(3)};desc="${version.id} render"`,
    });
  })
  .listen(port, host, () => console.log(`Northstar Supply demo on http://${host}:${port}${BASE}/`));

function send(res, body, headers = {}) {
  res.writeHead(200, Object.assign({ "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }, headers));
  res.end(body);
}

function storefrontPage(version, appHtml, ms, seed, large) {
  const query = (extra) => `?seed=${seed}${large ? "&large=1" : ""}${extra || ""}`;
  const links = VERSIONS.map(
    (v) => `<a href="${BASE}/${v.id}${query()}"${v === version ? ' class="is-current"' : ""}>${v.label}</a>`
  ).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Northstar Supply · ${version.title}</title>
<link rel="stylesheet" href="${BASE}/styles.css">
</head>
<body>
<div class="demo-bar demo-${version.id}">
  <span class="demo-version"><span class="demo-dot"></span>${version.title}</span>
  <span>rendered in <span class="demo-time">${ms.toFixed(3)} ms</span></span>
  <span>seed ${seed} · ${large ? "large" : "small"} page · ${(Buffer.byteLength(appHtml) / 1024).toFixed(1)} KB</span>
  <a href="${BASE}/${version.id}${large ? "?large=1" : ""}">new data</a>
  <a href="${BASE}/${version.id}?seed=${seed}${large ? "" : "&large=1"}">${large ? "small page" : "large page"}</a>
  <nav class="demo-links">${links}<a href="${BASE}/compare">Compare</a><a href="${BASE}/">About</a></nav>
</div>
${appHtml}
<footer class="demo-foot">
  Same request data, three renderers, byte-identical HTML. This page: ${version.summary.replace(/</g, "&lt;")}
  <a href="https://github.com/jlongster/northstar-supply">Source</a>
</footer>
</body>
</html>
`;
}

function landingPage() {
  const cards = VERSIONS.map(
    (v) => `<a class="doc-card demo-${v.id}" href="${BASE}/${v.id}">
  <strong><span class="demo-dot"></span>${v.title}</strong>
  <span>${v.summary}</span>
  <span class="doc-card-links">${BASE}/${v.id} →</span>
</a>`
  ).join("\n");
  return docPage(
    "Northstar Supply: three renderers",
    `<h1>Northstar Supply</h1>
<p class="doc-lede">An industrial-tools storefront written as a normal React 18 app (30 function components,
contexts, hooks, lists, <code>useId</code>, escaping-heavy user text), server-rendered three ways. The app is
known ahead of time and the request data is not. The two specialized versions produce <strong>the same bytes</strong>
as <code>renderToString</code>, in a fraction of the time.</p>
<div class="doc-cards">
${cards}
<a class="doc-card" href="${BASE}/compare">
  <strong>Comparison</strong>
  <span>Renders the same seeded inputs with all three in this process, checks the HTML is identical, and reports median and p90 render times.</span>
  <span class="doc-card-links">${BASE}/compare →</span>
</a>
</div>
<h2>How to read the pages</h2>
<ul>
<li>Each storefront request renders fresh random data. Add <code>?seed=N</code> for deterministic data and
<code>?large=1</code> for a ~200-product page (~285 KB of HTML).</li>
<li>The bar at the top of each page shows the render time. The same number is in the
<code>Server-Timing</code> response header (<code>performance.now()</code> around the render call only).</li>
<li>Links in the bar keep the seed, so you can open the same request in another renderer.</li>
</ul>
<h2>How the specialized versions are made</h2>
<ul>
<li><strong>Prepack</strong>: the revived Prepack runs a small port of React 18's server renderer together
with the app, with the request data abstract (a schema inferred from training requests). React and the
component tree fold away, leaving string concatenation, loops and escaping. A schema check guards each call;
data outside the schema is rendered with React.</li>
<li><strong>Hybrid</strong>: the app runs under the real React on training requests while every operation is traced.
Each component becomes a template of constant HTML chunks and slots, with a guard for every branch and type the
trace relied on. A failed guard renders that request with React.</li>
</ul>
<p>Both are built from the same bundle (<code>dist/app.js</code>) by <code>scripts/build-prepack.js</code> and
<code>scripts/build-hybrid.js</code>, and both are checked byte-for-byte against <code>renderToString</code> on a fixed
500-request corpus. Source: <a href="https://github.com/jlongster/northstar-supply">jlongster/northstar-supply</a>.</p>`
  );
}

function comparePage(params) {
  const clampInt = (name, def, min, max) => {
    const n = params.has(name) ? Number(params.get(name)) | 0 : def;
    return Math.min(max, Math.max(min, n));
  };
  const nSmall = clampInt("small", 100, 0, 500);
  const nLarge = clampInt("large", 10, 0, 50);
  const reps = clampInt("reps", 10, 1, 30);
  const base = clampInt("seed", 1, 0, 2 ** 30);
  const groups = [
    { variant: "small", inputs: seeds(nSmall).map((s) => generateRequest(base + s, "small")) },
    { variant: "large", inputs: seeds(nLarge).map((s) => generateRequest(base + s, "large")) },
  ].filter((g) => g.inputs.length > 0);

  const started = performance.now();
  const rows = [];
  for (const group of groups) {
    // Warm-up, and the byte-identical check: every renderer on every input.
    let identical = 0;
    for (const data of group.inputs) {
      const outputs = VERSIONS.map((v) => v.render(data));
      if (outputs.every((html) => html === outputs[0])) identical++;
    }
    // Let the JIT settle: at least 2 passes and 250 ms per renderer.
    for (const v of VERSIONS) {
      const until = performance.now() + 250;
      for (let pass = 0; pass < 2 || performance.now() < until; pass++) for (const data of group.inputs) v.render(data);
    }
    const fallbacksBefore = VERSIONS.map(fallbackCount);
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
    VERSIONS.forEach((v, j) => {
      rows.push({
        variant: group.variant,
        version: v,
        inputs: group.inputs.length,
        renders: times[j].length,
        median: medians[j],
        p90: quantile(times[j], 0.9),
        mean: times[j].reduce((a, b) => a + b, 0) / times[j].length,
        speedup: medians[0] / medians[j],
        fallbacks: (fallbackCount(v) - fallbacksBefore[j]) / reps,
        identical,
      });
    });
  }
  const elapsed = performance.now() - started;

  const body = groups
    .map((group) => {
      const groupRows = rows.filter((r) => r.variant === group.variant);
      const worst = Math.max(...groupRows.map((r) => r.median));
      const identical = groupRows[0].identical;
      return `<h2>${group.variant === "small" ? "Small pages" : "Large pages"} · ${group.inputs.length} inputs × ${reps} rounds</h2>
<table class="doc-table">
<thead><tr><th>renderer</th><th></th><th>median</th><th>p90</th><th>mean</th><th>speedup (median)</th><th>fallbacks / pass</th></tr></thead>
<tbody>
${groupRows
  .map(
    (r) => `<tr class="demo-${r.version.id}">
<td><a href="${BASE}/${r.version.id}?seed=${base + 1}${group.variant === "large" ? "&large=1" : ""}">${r.version.title}</a></td>
<td><span class="doc-bar" style="width:${Math.max(2, Math.round((r.median / worst) * 160))}px"></span></td>
<td>${fmtMs(r.median)}</td><td>${fmtMs(r.p90)}</td><td>${fmtMs(r.mean)}</td>
<td>${r.speedup.toFixed(2)}×</td><td>${r.version.id === "react" ? "–" : r.fallbacks}</td>
</tr>`
  )
  .join("\n")}
</tbody>
</table>
<p>HTML byte-identical across all three: <span class="${identical === group.inputs.length ? "doc-ok" : "doc-bad"}">${identical}/${group.inputs.length} inputs</span></p>`;
    })
    .join("\n");

  return docPage(
    "Northstar Supply: comparison",
    `<h1>Render time comparison</h1>
<p class="doc-lede">The same seeded requests (seeds ${base + 1} to ${base + Math.max(nSmall, nLarge)}) rendered in this server process by all three renderers, after a warm-up.
Times are for the render call alone (<code>performance.now()</code>), interleaved per input so the three see the same machine load.</p>
<form class="doc-form" method="get" action="${BASE}/compare">
<label>small inputs <input name="small" type="number" min="0" max="500" value="${nSmall}"></label>
<label>large inputs <input name="large" type="number" min="0" max="50" value="${nLarge}"></label>
<label>rounds <input name="reps" type="number" min="1" max="30" value="${reps}"></label>
<label>base seed <input name="seed" type="number" min="0" value="${base}"></label>
<button type="submit">Run again</button>
</form>
${body}
<p>Measured in ${(elapsed / 1000).toFixed(1)} s on ${require("os").cpus().length} vCPUs, Node ${process.version}. Fallbacks are requests a
specialized renderer handed to React because the data was outside what it was specialized for; the output is still identical.
<a href="${BASE}/">← back</a></p>`
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
<body class="doc"><div class="doc-inner">
${inner}
</div></body>
</html>
`;
}

function seeds(n) {
  return Array.from({ length: n }, (_, i) => i + 1);
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
