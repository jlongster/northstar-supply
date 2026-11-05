"use strict";

// Builds the app's `data` prop for one live request: the fixed catalog (store/catalog.js) plus the
// request itself (route, query, cookies). Nothing here is random, so the same request always
// renders the same page. The app gets every URL it needs through `data.nav` (the base path of the
// current renderer, the static-asset path and the current path + query), and URL-encoded query
// strings that the server built (pagination and filter-chip links), so it only concatenates.
const { CATEGORIES, PRODUCTS, BY_SKU } = require("./catalog.js");

const LOCALE = { code: "en-US", currency: "USD", symbol: "$", decimals: 2, groupSep: ",", decSep: "." };
const PAGE_SIZE = 24;
const SORTS = ["featured", "price-asc", "price-desc", "rating"];
const PRICE_BUCKETS = [
  { value: "0-25", label: "Under $25", min: 0, max: 25 },
  { value: "25-100", label: "$25 to $100", min: 25, max: 100 },
  { value: "100-250", label: "$100 to $250", min: 100, max: 250 },
  { value: "250-up", label: "$250 and up", min: 250, max: Infinity },
];
const DEMO_USER = { id: "usr-20418", name: "Maya Lin", tier: "pro", points: 12840, savedCount: 0, avatarColor: "#9a3412" };
const PROMO = {
  active: true,
  urgent: false,
  html: "<strong>Free shipping</strong> on orders over $150 · Same-day dispatch on orders placed by 3 pm",
};
const CART_TERMS = { taxRate: 0.0825, freeShippingThreshold: 150, creditAdjustment: 0 };
const DAY = 86400;

// request: { base, assets, path, query (URLSearchParams), cookies: { cart, theme, user, flash }, nowSec }
// returns { status, title, data }
function buildPage(request) {
  const route = matchRoute(request.path);
  const q = request.query;
  const nowSec = request.nowSec;
  const today = nowSec - (nowSec % DAY);
  const user = request.cookies.user === "demo" ? DEMO_USER : null;
  const cart = buildCart(request.cookies.cart);
  const theme = q.get("theme") === "dark" || q.get("theme") === "light" ? q.get("theme") : request.cookies.theme === "dark" ? "dark" : "light";
  const data = {
    theme,
    locale: LOCALE,
    user,
    promo: PROMO,
    flash: buildFlash(request.cookies.flash),
    nav: {
      base: request.base,
      assets: request.assets,
      view: route.view,
      path: route.path,
      current: request.path + (q.toString() ? "?" + q.toString() : ""),
    },
    search: { query: "", categorySlug: "all", sortBy: "featured", inStockOnly: false },
    categories: CATEGORIES.map((c) => ({ id: c.id, slug: c.slug, label: c.label, count: countIn(c.slug) })),
    breadcrumbs: [],
    cart,
    // Page collections live at the top level (never inside the nullable view objects below):
    // the revived Prepack cannot specialize a list reached through a nullable object.
    products: [],
    filters: [],
    activeFilters: [],
    specs: [],
    home: null,
    listing: null,
    product: null,
  };
  let title = "Northstar Supply · Professional tools and shop supplies";
  let status = 200;

  if (route.view === "home") {
    const home = buildHome(today);
    data.home = { spotlight: home.spotlight };
    data.products = home.featured;
  } else if (route.view === "listing") {
    const listing = buildListing(route, q, today);
    if (!listing) return notFound(data);
    data.products = listing.products;
    data.filters = listing.filters;
    data.activeFilters = listing.activeFilters;
    data.listing = listing.listing;
    data.search = listing.search;
    data.breadcrumbs = listing.breadcrumbs;
    title = listing.title + " · Northstar Supply";
  } else if (route.view === "product") {
    const product = BY_SKU.get(route.sku);
    if (!product) return notFound(data);
    data.search.categorySlug = product.category;
    const detail = productDetail(product, today);
    data.products = detail.related;
    data.specs = product.specs;
    data.product = detail.product;
    data.breadcrumbs = [
      { href: "/", label: "Home" },
      { href: "/c/" + product.category, label: categoryLabel(product.category) },
      { href: "/p/" + product.sku, label: product.title },
    ];
    title = product.title + " · Northstar Supply";
  } else if (route.view === "cart") {
    data.breadcrumbs = [{ href: "/", label: "Home" }, { href: "/cart", label: "Cart" }];
    title = "Cart · Northstar Supply";
  } else if (route.view === "signin") {
    data.breadcrumbs = [{ href: "/", label: "Home" }, { href: "/signin", label: user ? "Account" : "Sign in" }];
    title = (user ? "Account" : "Sign in") + " · Northstar Supply";
  } else {
    return notFound(data);
  }
  return { status, title, data };

  function notFound(d) {
    d.nav.view = "notfound";
    d.listing = null;
    d.product = null;
    d.products = [];
    d.filters = [];
    d.activeFilters = [];
    d.specs = [];
    d.breadcrumbs = [];
    d.search = { query: "", categorySlug: "all", sortBy: "featured", inStockOnly: false };
    return { status: 404, title: "Page not found · Northstar Supply", data: d };
  }
}

function matchRoute(path) {
  if (path === "/") return { view: "home", path: "/" };
  if (path === "/shop") return { view: "listing", kind: "all", path };
  if (path === "/search") return { view: "listing", kind: "search", path };
  if (path === "/cart") return { view: "cart", path };
  if (path === "/signin") return { view: "signin", path };
  let m = /^\/c\/([a-z-]+)$/.exec(path);
  if (m) return { view: "listing", kind: "category", slug: m[1], path };
  m = /^\/p\/([A-Z0-9-]+)$/.exec(path);
  if (m) return { view: "product", sku: m[1], path };
  return { view: "notfound", path };
}

function buildHome(today) {
  // Best sellers: the first featured product of each category.
  const featured = CATEGORIES.map((c) => PRODUCTS.find((p) => p.featured && p.category === c.slug) || PRODUCTS.find((p) => p.category === c.slug));
  const deal = PRODUCTS.filter((p) => p.originalPrice && p.stock > 5)
    .map((p) => ({ p, off: (p.originalPrice - p.price) / p.originalPrice }))
    .sort((a, b) => b.off - a.off || a.p.order - b.p.order)[0].p;
  // The deal runs until the end of the current week (Sunday 23:59 UTC).
  const weekday = new Date(today * 1000).getUTCDay();
  return {
    spotlight: {
      sku: deal.sku,
      category: deal.category,
      art: deal.art,
      headline: deal.title,
      blurb: deal.description,
      price: deal.price,
      originalPrice: deal.originalPrice,
      stock: deal.stock,
      endsAtSec: today + ((7 - weekday) % 7) * DAY + DAY - 60,
    },
    featured: featured.map((p) => card(p, today)),
  };
}

function buildListing(route, q, today) {
  const category = route.kind === "category" ? CATEGORIES.find((c) => c.slug === route.slug) : null;
  if (route.kind === "category" && !category) return null;
  const query = route.kind === "search" ? (q.get("q") || "").trim().slice(0, 120) : "";
  const sortBy = SORTS.includes(q.get("sort")) ? q.get("sort") : "featured";
  const inStockOnly = q.get("in_stock") === "1";
  const brands = q.getAll("brand").filter((b) => PRODUCTS.some((p) => p.brand === b));
  const prices = q.getAll("price").filter((v) => PRICE_BUCKETS.some((b) => b.value === v));

  const scope = PRODUCTS.filter((p) => (!category || p.category === category.slug) && matchesQuery(p, query));
  const byStock = (p) => !inStockOnly || p.stock > 0;
  const byBrand = (p) => brands.length === 0 || brands.includes(p.brand);
  const byPrice = (p) => prices.length === 0 || prices.some((v) => inBucket(p.price, v));
  const matching = sortProducts(scope.filter((p) => byStock(p) && byBrand(p) && byPrice(p)), sortBy);

  const showAll = q.get("page") === "all";
  const totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const currentPage = showAll ? 1 : Math.min(totalPages, Math.max(1, parseInt(q.get("page"), 10) || 1));
  const shown = showAll ? matching : matching.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Canonical query for this listing, without the page; every generated link starts from it.
  const params = new URLSearchParams();
  if (route.kind === "search") params.set("q", query);
  if (sortBy !== "featured") params.set("sort", sortBy);
  if (inStockOnly) params.set("in_stock", "1");
  brands.forEach((b) => params.append("brand", b));
  prices.forEach((v) => params.append("price", v));
  const href = (p) => route.path + (p.toString() ? "?" + p.toString() : "");
  const without = (name, value) => {
    const p = new URLSearchParams(params);
    p.delete(name);
    if (value !== undefined) params.getAll(name).filter((v) => v !== value).forEach((v) => p.append(name, v));
    return href(p);
  };
  const pageParams = new URLSearchParams(params);
  pageParams.delete("page");

  const activeFilters = [];
  if (inStockOnly) activeFilters.push({ key: "in_stock", label: "In stock", href: without("in_stock") });
  brands.forEach((b) => activeFilters.push({ key: "brand:" + b, label: b, href: without("brand", b) }));
  prices.forEach((v) =>
    activeFilters.push({ key: "price:" + v, label: PRICE_BUCKETS.find((b) => b.value === v).label, href: without("price", v) })
  );
  const clear = new URLSearchParams();
  if (route.kind === "search") clear.set("q", query);
  if (sortBy !== "featured") clear.set("sort", sortBy);

  const brandScope = scope.filter((p) => byStock(p) && byPrice(p));
  const priceScope = scope.filter((p) => byStock(p) && byBrand(p));
  const brandNames = Array.from(new Set(scope.map((p) => p.brand))).sort();
  const filters = [
    {
      id: "brand",
      title: "Brand",
      options: brandNames.map((b) => ({
        value: b,
        label: b,
        count: brandScope.filter((p) => p.brand === b).length,
        selected: brands.includes(b),
      })),
    },
    {
      id: "price",
      title: "Price",
      options: PRICE_BUCKETS.map((b) => ({
        value: b.value,
        label: b.label,
        count: priceScope.filter((p) => inBucket(p.price, b.value)).length,
        selected: prices.includes(b.value),
      })),
    },
  ];

  const title = category ? category.label : route.kind === "search" ? (query ? "Results for “" + query + "”" : "Search") : "All products";
  const breadcrumbs = [{ href: "/", label: "Home" }];
  if (category) breadcrumbs.push({ href: "/c/" + category.slug, label: category.label });
  else if (route.kind === "search") breadcrumbs.push({ href: "/search", label: "Search" });
  else breadcrumbs.push({ href: "/shop", label: "All products" });

  return {
    title: route.kind === "search" && query ? "Search: " + query : title,
    breadcrumbs,
    search: { query, categorySlug: category ? category.slug : "all", sortBy, inStockOnly },
    products: shown.map((p) => card(p, today)),
    filters,
    activeFilters,
    listing: {
      kind: route.kind,
      title,
      description: category ? category.blurb : route.kind === "all" ? "Every tool and supply we stock, from calipers to clamp meters." : "",
      clearHref: href(clear),
      pagination: {
        currentPage,
        totalPages,
        totalMatching: matching.length,
        firstIndex: matching.length === 0 ? 0 : showAll ? 1 : (currentPage - 1) * PAGE_SIZE + 1,
        lastIndex: showAll ? matching.length : Math.min(matching.length, currentPage * PAGE_SIZE),
        pageSize: PAGE_SIZE,
        showingAll: showAll,
        hrefPrefix: route.path + "?" + (pageParams.toString() ? pageParams.toString() + "&" : "") + "page=",
      },
    },
  };
}

function matchesQuery(p, query) {
  if (!query) return true;
  const hay = (p.title + " " + p.brand + " " + categoryLabel(p.category) + " " + p.category + " " + p.sku).toLowerCase();
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean)
    .every((t) => hay.includes(t) || (t.length > 3 && t.endsWith("s") && hay.includes(t.slice(0, -1))));
}

function sortProducts(list, sortBy) {
  const out = list.slice();
  if (sortBy === "price-asc") out.sort((a, b) => a.price - b.price || a.order - b.order);
  else if (sortBy === "price-desc") out.sort((a, b) => b.price - a.price || a.order - b.order);
  else if (sortBy === "rating") out.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount || a.order - b.order);
  else out.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.order - b.order);
  return out;
}

function inBucket(price, value) {
  const b = PRICE_BUCKETS.find((x) => x.value === value);
  return price >= b.min && price < b.max;
}

// The fields a product card needs (ProductCard), in a stable key order.
function card(p, today) {
  const c = {
    sku: p.sku,
    title: p.title,
    brand: p.brand,
    category: p.category,
    art: p.art,
    price: p.price,
    stock: p.stock,
    rating: p.rating,
    reviewCount: p.reviewCount,
  };
  if (p.originalPrice !== undefined) c.originalPrice = p.originalPrice;
  if (p.rebateAmount !== undefined) c.rebateAmount = p.rebateAmount;
  if (p.featured) c.featured = true;
  if (p.clearance) c.clearance = true;
  if (p.stock > 0) c.shipsAtSec = today + p.shipsInDays * DAY;
  return c;
}

function productDetail(p, today) {
  const d = card(p, today);
  d.description = p.description;
  d.topReview = p.topReview
    ? { author: p.topReview.author, body: p.topReview.body, verified: p.topReview.verified, createdAtSec: today - p.topReview.daysAgo * DAY }
    : null;
  const related = PRODUCTS.filter((x) => x.category === p.category && x.sku !== p.sku)
    .sort((a, b) => Math.abs(a.order - p.order) - Math.abs(b.order - p.order) || a.order - b.order)
    .slice(0, 4)
    .map((x) => card(x, today));
  return { product: d, related };
}

// Cart cookie: "SKU:qty,SKU:qty" (unknown SKUs are dropped, quantities clamped to 1-99).
function parseCart(value) {
  const items = [];
  for (const part of String(value || "").split(",")) {
    const [sku, qty] = part.split(":");
    const n = parseInt(qty, 10);
    if (BY_SKU.has(sku) && n > 0 && !items.some((i) => i.sku === sku)) items.push({ sku, qty: Math.min(99, n) });
  }
  return items;
}

function serializeCart(items) {
  return items.map((i) => i.sku + ":" + i.qty).join(",");
}

function buildCart(cookie) {
  return Object.assign({}, CART_TERMS, {
    items: parseCart(cookie).map((i) => {
      const p = BY_SKU.get(i.sku);
      const item = { sku: p.sku, title: p.title, category: p.category, art: p.art, qty: i.qty, unitPrice: p.price };
      if (i.qty > p.stock) item.backordered = true;
      return item;
    }),
  });
}

function buildFlash(cookie) {
  if (!cookie) return null;
  const [kind, sku] = String(cookie).split(":");
  const p = sku ? BY_SKU.get(sku) : null;
  if (kind === "added" && p) return { text: "Added " + p.title + " to your cart.", cartLink: true };
  if (kind === "removed" && p) return { text: "Removed " + p.title + " from your cart.", cartLink: false };
  if (kind === "updated") return { text: "Cart updated.", cartLink: false };
  if (kind === "signin") return { text: "Signed in as " + DEMO_USER.name + ". Pro pricing (5% off) applies to your cart.", cartLink: false };
  if (kind === "signout") return { text: "You have been signed out.", cartLink: false };
  return null;
}

function countIn(slug) {
  return PRODUCTS.filter((p) => p.category === slug).length;
}

function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug).label;
}

module.exports = { buildPage, parseCart, serializeCart, SORTS, PRICE_BUCKETS, PAGE_SIZE };
