"use strict";

// Smoke test of a running demo server (default: through the site's proxy):
//   node scripts/check-site.js [origin] [base]      e.g. http://127.0.0.1:5180 /northstar
//
// 1. Every route, in all three renderers: expected status, and the app's HTML identical across them.
// 2. Every link and GET form found on those pages resolves (no unexpected 404s).
// 3. Form posts with a cookie jar: add to cart, update, remove, theme toggle, sign in, sign out.
const origin = process.argv[2] || "http://127.0.0.1:5180";
const base = process.argv[3] || "/northstar";
const IMPLS = ["react", "prepack", "hybrid"];
const ROUTES = [
  ["/", 200],
  ["/shop", 200],
  ["/shop?page=2", 200],
  ["/shop?page=all", 200],
  ["/shop?sort=price-desc&in_stock=1&brand=Kestrel&brand=Meridian&price=25-100", 200],
  ["/c/measuring", 200],
  ["/c/power-tools?sort=rating", 200],
  ["/c/safety?price=0-25&page=1", 200],
  ["/search?q=drill", 200],
  ["/search?q=torque+wrench&sort=price-asc", 200],
  ["/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E", 200],
  ["/search?q=xyzzy", 200],
  ["/search?q=", 200],
  ["/p/NS-ME-1000", 200],
  ["/p/NS-PO-1343", 200],
  ["/cart", 200],
  ["/signin", 200],
  ["/no-such-page", 404],
  ["/p/NS-XX-0000", 404],
  ["/c/unknown", 404],
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log("FAIL " + msg);
};

// The app's own HTML (without the renderer bar), with the renderer's base path normalized: links
// legitimately differ (/northstar/react/... vs /northstar/hybrid/...), nothing else may.
function appHtml(html) {
  const start = html.indexOf('<div id="northstar-app"');
  const end = html.lastIndexOf("<script>");
  return start >= 0 && end > start ? html.slice(start, end).replace(new RegExp(base + "/(react|prepack|hybrid)", "g"), base + "/IMPL") : "";
}

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

async function get(path, cookie) {
  const res = await fetch(origin + path, { redirect: "manual", headers: cookie ? { cookie } : {} });
  return { status: res.status, headers: res.headers, text: await res.text() };
}

async function main() {
  const links = new Set();
  // 1. routes x renderers
  for (const [route, want] of ROUTES) {
    const pages = await Promise.all(IMPLS.map((impl) => get(`${base}/${impl}${route}`)));
    pages.forEach((p, i) => {
      if (p.status !== want) fail(`${IMPLS[i]}${route}: status ${p.status}, want ${want}`);
    });
    const apps = pages.map((p) => appHtml(p.text));
    if (!apps[0]) fail(`${route}: no app HTML`);
    if (!apps.every((a) => a === apps[0])) fail(`${route}: app HTML differs between renderers`);
    const timing = pages.map((p) => (p.headers.get("server-timing") || "").replace(/.*dur=([\d.]+).*/, "$1"));
    console.log(`${pages.map((p) => p.status).join("/")}  ${(apps[0].length / 1024).toFixed(1).padStart(6)} KB  identical=${apps.every((a) => a === apps[0])}  render ms ${timing.join(" / ")}  ${route}`);
    for (const m of apps[0].matchAll(/(?:href|action)="([^"]+)"/g)) {
      const url = decode(m[1]);
      if (url.startsWith(base)) for (const impl of IMPLS) links.add(url.replace(base + "/IMPL", `${base}/${impl}`));
    }
  }

  // 2. links and GET form actions found on the pages
  let checked = 0;
  for (const url of links) {
    if (/\/(cart\/add|cart\/update|theme|signin|signout)$/.test(url) && !url.endsWith("/signin")) continue; // POST-only
    const r = await get(url);
    checked++;
    if (r.status >= 400) fail(`link ${url}: ${r.status}`);
  }
  console.log(`checked ${checked} distinct links and form actions`);

  // 3. form posts with a cookie jar
  let jar = {};
  const cookie = () => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
  const post = async (path, form) => {
    const res = await fetch(origin + path, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded", cookie: cookie() },
      body: new URLSearchParams(form).toString(),
    });
    for (const c of res.headers.getSetCookie()) {
      const [kv] = c.split(";");
      const [k, v] = kv.split("=");
      if (/Max-Age=0/.test(c)) delete jar[k];
      else jar[k] = v;
    }
    // The server answers posts with a 200 + Refresh header (the proxy would swallow a 3xx).
    const refresh = res.headers.get("refresh");
    return { status: res.status, location: refresh ? refresh.replace(/^0;url=/, "") : res.headers.get("location") };
  };
  const impl = `${base}/hybrid`;
  let r = await post(`${impl}/cart/add`, { sku: "NS-ME-1000", qty: "2", back: "/c/measuring" });
  if (r.status !== 200 || r.location !== `${impl}/c/measuring`) fail(`add to cart: ${r.status} ${r.location}`);
  let page = await get(`${impl}/c/measuring`, cookie());
  if (!page.text.includes("Added Halvorsen Digital Caliper to your cart.")) fail("add to cart: no confirmation");
  if (!/ns-cart-count">2</.test(page.text)) fail("add to cart: header count is not 2");
  await post(`${impl}/cart/add`, { sku: "NS-PO-1343", back: "/p/NS-PO-1343" });
  page = await get(`${base}/prepack/cart`, cookie());
  if (!page.text.includes('data-sku="NS-PO-1343"') || !page.text.includes('data-sku="NS-ME-1000"')) fail("cart page: items missing");
  r = await post(`${impl}/cart/update`, { sku: "NS-ME-1000", qty: "5" });
  page = await get(`${impl}/cart`, cookie());
  if (!/ns-cart-count">6</.test(page.text)) fail("cart update: count is not 6");
  await post(`${impl}/cart/update`, { sku: "NS-PO-1343", qty: "1", remove: "1" });
  page = await get(`${base}/react/cart`, cookie());
  if (page.text.includes('data-sku="NS-PO-1343"')) fail("cart remove: item still there");
  r = await post(`${impl}/theme`, { theme: "dark", back: "/cart" });
  page = await get(`${impl}/cart`, cookie());
  if (!page.text.includes("ns-theme-dark")) fail("theme toggle: not dark");
  r = await post(`${impl}/signin`, { email: "x@y.z", back: "/" });
  page = await get(`${impl}/cart`, cookie());
  if (!page.text.includes("Member discount")) fail("sign in: no member discount in cart");
  r = await post(`${impl}/signout`, {});
  page = await get(`${impl}/`, cookie());
  if (!page.text.includes("You have been signed out.")) fail("sign out: no confirmation");
  r = await post(`${impl}/cart/add`, { sku: "NS-ME-1000", back: "//evil.example/" });
  if (r.location !== `${impl}/cart`) fail(`open redirect guard: ${r.location}`);
  console.log(`form posts: cart add/update/remove, theme, sign in/out checked (cookies: ${Object.keys(jar).join(", ")})`);
  // (The proxy follows this redirect itself, so through it the React page comes back directly.)
  r = await get(`${base}/search?q=drill`);
  if (!(r.status === 302 && r.headers.get("location") === `${base}/react/search?q=drill`) && !(r.status === 200 && r.text.includes("Results for")))
    fail(`renderer-less store path: ${r.status}`);

  console.log(failures ? `${failures} failure(s)` : "all checks passed");
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
