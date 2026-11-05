"use strict";

// Render-time benchmark of the three renderers, in one process, interleaved per input:
//   node scripts/bench.js [--rounds N] [--json out.json]
//   node --jitless scripts/bench.js ...
//
// Groups: live-store requests (store/corpus.js, the same 600-input check corpus the tests use,
// split into normal pages and whole-catalog listings) and the random benchmark corpus
// (src/data.js: 471 small pages, 25 large listings). Each renderer gets a warm-up, then N rounds over
// the group with the renderer order rotated per input. Prints medians, p90 and speedups.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const os = require("os");
const { performance } = require("perf_hooks");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const App = require("../dist/app.js");
const { getLiveCheckCorpus } = require("../store/corpus.js");
const { getCheckCorpus } = require("../src/data.js");

const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const jitless = process.execArgv.includes("--jitless");
const rounds = Number(opt("--rounds", jitless ? 2 : 8));
const renderers = [
  { id: "react", render: (data) => ReactDOMServer.renderToString(React.createElement(App, { data })) },
  { id: "prepack", render: require("../dist/render-prepack.js").render },
  { id: "hybrid", render: require("../dist/render-hybrid.js").render },
];
const live = getLiveCheckCorpus();
const bench = getCheckCorpus();
const isAll = (d) => d.nav.path === "/shop" && d.listing && d.listing.pagination.showingAll;
const groups = [
  { name: "store pages", inputs: live.filter((d) => !isAll(d)) },
  { name: "whole catalog (192 products)", inputs: live.filter(isAll) },
  { name: "benchmark small", inputs: bench.slice(0, 475) },
  { name: "benchmark large (~200 products)", inputs: bench.slice(475) },
];

const quantile = (xs, q) => xs.slice().sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(q * xs.length))];
const results = [];
for (const g of groups) {
  const bytes = g.inputs.reduce((n, d) => n + renderers[0].render(d).length, 0) / g.inputs.length;
  for (const r of renderers) {
    const until = performance.now() + (jitless ? 300 : 1000);
    for (let pass = 0; pass < 2 || performance.now() < until; pass++) for (const d of g.inputs) r.render(d);
  }
  const fallbacksBefore = renderers.map((r) => (r.render.stats ? r.render.stats.fallbacks : 0));
  const times = renderers.map(() => []);
  for (let round = 0; round < rounds; round++) {
    g.inputs.forEach((d, i) => {
      for (let k = 0; k < renderers.length; k++) {
        const j = (k + i + round) % renderers.length;
        const t0 = performance.now();
        renderers[j].render(d);
        times[j].push(performance.now() - t0);
      }
    });
  }
  const med = times.map((t) => quantile(t, 0.5));
  const row = {
    group: g.name,
    inputs: g.inputs.length,
    avgKB: bytes / 1024,
    renderers: renderers.map((r, j) => ({
      id: r.id,
      p50: med[j],
      p90: quantile(times[j], 0.9),
      speedup: med[0] / med[j],
      fallbackRate: r.render.stats ? (r.render.stats.fallbacks - fallbacksBefore[j]) / (rounds * g.inputs.length) : 0,
    })),
  };
  results.push(row);
  const fmt = (ms) => (ms < 1 ? (ms * 1000).toFixed(1) + " µs" : ms.toFixed(2) + " ms");
  console.log(
    `${g.name.padEnd(32)} ${String(g.inputs.length).padStart(4)} inputs ${row.avgKB.toFixed(1).padStart(6)} KB  ` +
      row.renderers
        .map((x) => `${x.id} ${fmt(x.p50)} (p90 ${fmt(x.p90)})${x.id === "react" ? "" : ` ${x.speedup.toFixed(2)}× fb ${(x.fallbackRate * 100).toFixed(1)}%`}`)
        .join("  ")
  );
}
const meta = { node: process.version, jitless, rounds, cpus: os.cpus().length, cpu: os.cpus()[0].model, load: os.loadavg(), date: new Date().toISOString() };
console.log(JSON.stringify(meta));
const out = opt("--json", null);
if (out) require("fs").writeFileSync(out, JSON.stringify({ meta, results }, null, 1) + "\n");
