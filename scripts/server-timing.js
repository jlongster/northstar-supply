"use strict";

// Samples the Server-Timing render time of the running demo server for each version.
//   node scripts/server-timing.js [baseUrl] [smallRequests] [largeRequests]
// e.g. node scripts/server-timing.js https://jamesbox.exe.xyz/northstar 200 30
// Requests use seeds 1..N (the same inputs for every version), interleaved across versions, after
// one warm-up pass. Prints median and p90 of the reported render durations.
const base = (process.argv[2] || "http://127.0.0.1:3100/northstar").replace(/\/+$/, "");
const nSmall = Number(process.argv[3] || 200);
const nLarge = Number(process.argv[4] || 30);
const versions = ["react", "prepack", "hybrid"];

async function timing(url) {
  const res = await fetch(url);
  await res.arrayBuffer();
  const m = /dur=([\d.]+)/.exec(res.headers.get("server-timing") || "");
  if (!m) throw new Error("no Server-Timing from " + url);
  return Number(m[1]);
}

async function sample(n, large) {
  const times = Object.fromEntries(versions.map((v) => [v, []]));
  for (let pass = 0; pass < 2; pass++) {
    for (let seed = 1; seed <= n; seed++) {
      for (const v of versions) {
        const ms = await timing(`${base}/${v}?seed=${seed}${large ? "&large=1" : ""}`);
        if (pass === 1) times[v].push(ms);
      }
    }
  }
  return times;
}

const q = (xs, p) => xs.slice().sort((a, b) => a - b)[Math.min(xs.length - 1, Math.floor(p * xs.length))];

(async () => {
  console.log(`| page | version | median | p90 | speedup (median) |\n|---|---|---:|---:|---:|`);
  for (const [label, n, large] of [["small", nSmall, false], ["large", nLarge, true]]) {
    const times = await sample(n, large);
    const ref = q(times.react, 0.5);
    for (const v of versions) {
      const med = q(times[v], 0.5);
      console.log(`| ${label} | ${v} | ${med.toFixed(3)} ms | ${q(times[v], 0.9).toFixed(3)} ms | ${(ref / med).toFixed(2)}x |`);
    }
  }
})();
