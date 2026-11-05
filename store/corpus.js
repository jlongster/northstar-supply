"use strict";

// Live-site-shaped request data: random requests (route, query, sort, filters, page, cart,
// theme, signed-in state, flash message, renderer base path) run through the same
// store/page.js builder the server uses. The specializers train on one seed range and the tests
// check another, so the check inputs are never seen in training.
const { mulberry32 } = require("../src/data.js");
const { CATEGORIES, BRANDS, PRODUCTS } = require("./catalog.js");
const { buildPage, SORTS, PRICE_BUCKETS } = require("./page.js");

const BASES = ["/northstar/react", "/northstar/prepack", "/northstar/hybrid"];
const QUERIES = [
  "drill", "caliper", "torque wrench", "knipex", "kestrel", "glasses", "multimeter", "clamp", "saw blade",
  "solder", "meter", "gloves", "vise", "kit", "bits", "level", "safety", "18 v", "hex", "set",
  "", "xyzzy", "<script>alert('x')</script>", '1/4" drive & ratchet', "Tallis & Webb", "O'Neill",
  "hammer drill brushless", "äöü ±0.01 mm", "両刃 saw", "a", "NS-ME-1000", "  spaced   out  ",
];
const FLASHES = ["", "", "", "", "updated", "signin", "signout", "added:", "removed:"];
const NOW_SEC = 1793923200; // Thu Nov 05 2026 00:00 UTC

function liveRequest(seed) {
  const r = mulberry32(seed);
  const int = (min, max) => min + Math.floor(r() * (max - min + 1));
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const sku = () => pick(PRODUCTS).sku;
  const q = new URLSearchParams();
  const roll = r();
  let path;
  if (roll < 0.12) path = "/";
  else if (roll < 0.3) path = "/c/" + pick(CATEGORIES).slug;
  else if (roll < 0.48) path = "/search";
  else if (roll < 0.56) path = "/shop";
  else if (roll < 0.78) path = "/p/" + sku();
  else if (roll < 0.9) path = "/cart";
  else if (roll < 0.95) path = "/signin";
  else path = pick(["/nope", "/p/NS-XX-0000", "/c/unknown", "/checkout"]);

  if (path === "/search") q.set("q", pick(QUERIES));
  if (path.startsWith("/c/") || path === "/search" || path === "/shop") {
    if (r() < 0.4) q.set("sort", pick(SORTS));
    if (r() < 0.25) q.set("in_stock", "1");
    if (r() < 0.3) for (let i = int(1, 2); i > 0; i--) q.append("brand", pick(BRANDS));
    if (r() < 0.25) q.append("price", pick(PRICE_BUCKETS).value);
    if (r() < 0.3) q.set("page", r() < 0.15 ? "all" : String(int(1, 9)));
  }
  if (r() < 0.05) q.set("theme", pick(["dark", "light"]));

  const cartItems = r() < 0.45 ? 0 : int(1, 6);
  const cart = [];
  for (let i = 0; i < cartItems; i++) cart.push(sku() + ":" + (r() < 0.1 ? int(20, 120) : int(1, 4)));
  const flash = pick(FLASHES);
  return {
    base: pick(BASES),
    assets: "/northstar",
    path,
    query: q,
    cookies: {
      cart: cart.join(","),
      theme: r() < 0.3 ? "dark" : "",
      user: r() < 0.35 ? "demo" : "",
      flash: flash.endsWith(":") ? flash + sku() : flash,
    },
    nowSec: NOW_SEC + int(0, 400) * 86400 + int(0, 86399),
  };
}

function liveData(seed) {
  return buildPage(liveRequest(seed)).data;
}

// The "View all" listing of the whole catalog (192 products, ~300 KB of HTML).
function allProductsData(seed) {
  const r = mulberry32(seed);
  const q = new URLSearchParams({ page: "all" });
  if (r() < 0.5) q.set("sort", SORTS[Math.floor(r() * SORTS.length)]);
  return buildPage({
    base: BASES[Math.floor(r() * 3)],
    assets: "/northstar",
    path: "/shop",
    query: q,
    cookies: { cart: "", theme: r() < 0.3 ? "dark" : "", user: r() < 0.3 ? "demo" : "", flash: "" },
    nowSec: NOW_SEC,
  }).data;
}

const TRAIN_BASE = 0x4c545200; // "LTR\0"
const CHECK_BASE = 0x4c434b00; // "LCK\0"

function getLiveTrainingCorpus(count) {
  return Array.from({ length: count }, (_, i) => liveData(TRAIN_BASE + i * 7919));
}

// 600 inputs: 590 live requests + 10 whole-catalog listings.
function getLiveCheckCorpus(count = 590, all = 10) {
  return Array.from({ length: count }, (_, i) => liveData(CHECK_BASE + i * 104729)).concat(
    Array.from({ length: all }, (_, i) => allProductsData(CHECK_BASE + 1 + i * 31))
  );
}

module.exports = { liveRequest, liveData, allProductsData, getLiveTrainingCorpus, getLiveCheckCorpus };
