"use strict";

// react-bench adapter for the committed standalone build dist/render-hybrid.js, so the shared
// harness (prepack-revived react-bench/check.js and perf.js) can measure it:
//   node <react-bench>/perf.js --impl $PWD/bench/impl/hybrid.js
const path = require("path");

module.exports = {
  name: "northstar dist/render-hybrid.js",
  prepare() {
    return require(path.join(__dirname, "..", "..", "dist", "render-hybrid.js")).render;
  },
};
