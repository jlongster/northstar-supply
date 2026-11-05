"use strict";

// Samples the Server-Timing render time of the running demo server for each renderer.
//   node scripts/server-timing.js [baseUrl] [requests] [wholeCatalogRequests]
// e.g. node scripts/server-timing.js http://127.0.0.1:5180/northstar 300 20
// Store requests are the paths of the live check corpus (store/corpus.js: home, categories,
// searches, sorts, filters, product pages, cart, sign-in, 404s), the same path for every renderer,
// interleaved, after one warm-up pass. Cookies are not sent (anonymous visitor, empty cart).
// Prints median and p90 of the reported render durations.
const { liveRequest } = require("../store/corpus.js");

const base = (process.argv[2] || "http://127.0.0.1:3100/northstar").replace(/\/+$/, "");
const n = Number(process.argv[3] || 300);
const nAll = Number(process.argv[4] || 20);
const renderers = ["react", "prepack", "hybrid"];

async function timing(url) {
  const res = await fetch(url, { redirect: "manual" });
  await res.arrayBuffer();
  const m = /dur=([\d.]+)/.exec(res.headers.get("server-timing") || "");
  if (!m) throw new Error("no Server-Timing from " + url + " (" + res.status + ")");
  return Number(m[1]);
}

async function sample(paths) {
  const times = Object.fromEntries(renderers.map((v) => [v, []]));
  for (let pass = 0; pass < 2; pass++) {
    for (const p of paths) {
      for (const v of renderers) {
        const ms = await timing(`${base}/${v}${p}`);
        if (pass === 1) times[v].push(ms);
      }
    }
  }
  return times;
}

const q = (xs, p) => xs.slice().sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))];

(async () => {
  const storePaths = Array.from({ length: n }, (_, i) => {
    const r = liveRequest(0x4c434b00 + i * 104729);
    const qs = r.query.toString();
    return r.path + (qs ? "?" + qs : "");
  });
  const allPaths = Array.from({ length: nAll }, (_, i) => ["/shop?page=all", "/shop?page=all&sort=price-asc", "/shop?page=all&sort=rating"][i % 3]);
  console.log(`| page | renderer | median | p90 | speedup (median) |\n|---|---|---:|---:|---:|`);
  for (const [label, paths] of [["store pages", storePaths], ["whole catalog", allPaths]]) {
    const times = await sample(paths);
    const ref = q(times.react, 0.5);
    for (const v of renderers) {
      const med = q(times[v], 0.5);
      console.log(`| ${label} | ${v} | ${med.toFixed(3)} ms | ${q(times[v], 0.9).toFixed(3)} ms | ${(ref / med).toFixed(1)}× |`);
    }
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
