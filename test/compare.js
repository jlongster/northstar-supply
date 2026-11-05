"use strict";

// Byte-identical check over the fixed 500-input corpus (src/data.js getCheckCorpus()):
//
//   node test/compare.js                      dist/app.js vs the original single-file app
//                                             (test/fixtures/app.original.js), both with renderToString
//   node test/compare.js dist/render-prepack.js
//   node test/compare.js dist/render-hybrid.js
//                                             a standalone specialized renderer (exports render(data))
//                                             vs renderToString of dist/app.js
//
// Each side gets its own deep copy of every input. Exits non-zero on any difference.
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { getCheckCorpus } = require("../src/data.js");

const ROOT = path.join(__dirname, "..");
const target = process.argv[2];

const renderWith = (App) => (data) => ReactDOMServer.renderToString(React.createElement(App, { data }));
const [refName, reference, actualName, actual] = target
  ? ["renderToString(dist/app.js)", renderWith(require(path.join(ROOT, "dist/app.js"))), target, require(path.resolve(target)).render]
  : ["renderToString(test/fixtures/app.original.js)", renderWith(require("./fixtures/app.original.js")), "renderToString(dist/app.js)", renderWith(require(path.join(ROOT, "dist/app.js")))];

const corpus = getCheckCorpus();
let pass = 0;
const failures = [];
for (let i = 0; i < corpus.length; i++) {
  const expected = reference(structuredClone(corpus[i]));
  let got;
  try {
    got = actual(structuredClone(corpus[i]));
  } catch (err) {
    got = "<<threw " + (err && err.stack) + ">>";
  }
  if (got === expected) {
    pass++;
    continue;
  }
  let at = 0;
  while (at < expected.length && expected[at] === got[at]) at++;
  failures.push({ index: i, requestId: corpus[i].requestId, at, expected: expected.slice(Math.max(0, at - 60), at + 60), got: got.slice(Math.max(0, at - 60), at + 60) });
}

console.log(`${actualName} vs ${refName}: ${pass}/${corpus.length} byte-identical`);
for (const f of failures.slice(0, 3)) {
  console.log(`\nFAIL #${f.index} (${f.requestId}) at offset ${f.at}\n  expected: ${JSON.stringify(f.expected)}\n  got:      ${JSON.stringify(f.got)}`);
}
if (actual.stats) console.log("renderer stats:", JSON.stringify(actual.stats));
process.exitCode = failures.length ? 1 : 0;
