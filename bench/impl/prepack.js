"use strict";

// react-bench adapter for the committed standalone build dist/render-prepack.js, so the shared
// harness (prepack-revived react-bench/check.js and perf.js) can measure it:
//   node <react-bench>/perf.js --impl $PWD/bench/impl/prepack.js
const path = require("path");

module.exports = {
  name: "northstar dist/render-prepack.js",
  prepare() {
    return require(path.join(__dirname, "..", "..", "dist", "render-prepack.js")).render;
  },
};
