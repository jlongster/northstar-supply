"use strict";

// Byte-identical checks of the specialized renderers against renderToString(dist/app.js):
//
//   node test/compare.js [renderer.js ...] [--corpus live|bench|all]
//
// Defaults: both dist/render-prepack.js and dist/render-hybrid.js, on both corpora:
//   live   600 live-store requests (store/corpus.js getLiveCheckCorpus: 590 random requests over
//          every route, query, sort, filter, page, cart, theme and sign-in state, plus 10
//          whole-catalog listings); seeds disjoint from the specializers' training data
//   bench  the 500-input benchmark corpus (src/data.js getCheckCorpus: random, escaping-heavy data,
//          4 edge cases, 471 small pages, 25 large listings)
//
// Each side gets its own deep copy of every input. Prints the fallback rate (inputs a specialized
// renderer handed to React). Exits non-zero on any difference.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { getCheckCorpus, corpusFingerprint } = require("../src/data.js");
const { getLiveCheckCorpus } = require("../store/corpus.js");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const corpusArg = args.includes("--corpus") ? args[args.indexOf("--corpus") + 1] : "all";
const targets = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--corpus");
const renderers = (targets.length ? targets : ["dist/render-prepack.js", "dist/render-hybrid.js"]).map((t) => ({
  name: t,
  render: require(path.resolve(ROOT, t)).render,
}));
const App = require(path.join(ROOT, "dist/app.js"));
const reference = (data) => ReactDOMServer.renderToString(React.createElement(App, { data }));
const corpora = [
  corpusArg !== "bench" && { name: "live", inputs: getLiveCheckCorpus() },
  corpusArg !== "live" && { name: "bench", inputs: getCheckCorpus() },
].filter(Boolean);

let failed = 0;
for (const corpus of corpora) {
  const expected = corpus.inputs.map((data) => reference(structuredClone(data)));
  console.log(`corpus ${corpus.name}: ${corpus.inputs.length} inputs, fingerprint ${corpusFingerprint(corpus.inputs)}`);
  for (const r of renderers) {
    let pass = 0;
    let fallbacks = 0;
    const reasons = {};
    const failures = [];
    corpus.inputs.forEach((data, i) => {
      const stats = r.render.stats;
      const before = stats ? stats.fallbacks : 0;
      const beforeReasons = stats && stats.fallbackReasons ? Object.assign({}, stats.fallbackReasons) : {};
      let got;
      try {
        got = r.render(structuredClone(data));
      } catch (err) {
        got = "<<threw " + (err && err.stack) + ">>";
      }
      if (stats && stats.fallbacks > before) {
        fallbacks++;
        for (const k of Object.keys(stats.fallbackReasons || {})) {
          const d = stats.fallbackReasons[k] - (beforeReasons[k] || 0);
          if (d > 0) reasons[k] = (reasons[k] || 0) + d;
        }
      }
      if (got === expected[i]) return pass++;
      let at = 0;
      while (at < expected[i].length && expected[i][at] === got[at]) at++;
      failures.push({ i, at, expected: expected[i].slice(Math.max(0, at - 80), at + 80), got: got.slice(Math.max(0, at - 80), at + 80) });
    });
    const n = corpus.inputs.length;
    console.log(
      `  ${r.name}: ${pass}/${n} byte-identical, ${fallbacks} fallbacks (${((fallbacks / n) * 100).toFixed(1)}%)` +
        (Object.keys(reasons).length ? " " + JSON.stringify(reasons) : "")
    );
    for (const f of failures.slice(0, 3)) {
      console.log(`    FAIL #${f.i} at offset ${f.at}\n      expected: ${JSON.stringify(f.expected)}\n      got:      ${JSON.stringify(f.got)}`);
    }
    failed += failures.length;
  }
}
process.exitCode = failed ? 1 : 0;
