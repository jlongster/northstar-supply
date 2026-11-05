# Northstar Supply

An example React 18 server-rendered storefront: an industrial-tools catalog page with a
deal-of-the-day spotlight, a filter sidebar, a cart/quote summary, header, nav and footer.
It has 30 function components plus `App`, using lists with keys, conditional rendering,
three React contexts (theme, locale, user), `useMemo`/`useId`, fragments, inline styles,
`dangerouslySetInnerHTML`, and HTML-escaping-heavy user text.

It is the benchmark app for
[prepack-revived](https://github.com/jlongster/prepack-revived): specializing React SSR for a
known app with unknown request data. This repo contains the app, two specialized builds of it
(one from the revived Prepack, one from the trace-based "hybrid" specializer), and a server that
renders the storefront with all three.

## Live demo

**https://jamesbox.exe.xyz/northstar/** (hosted on an exe.dev VM; only visible to users with
access to that VM).

| URL | What it renders |
|---|---|
| [/northstar/](https://jamesbox.exe.xyz/northstar/) | Landing page with links to everything below |
| [/northstar/react](https://jamesbox.exe.xyz/northstar/react) | `ReactDOMServer.renderToString` of `dist/app.js` |
| [/northstar/prepack](https://jamesbox.exe.xyz/northstar/prepack) | `dist/render-prepack.js` |
| [/northstar/hybrid](https://jamesbox.exe.xyz/northstar/hybrid) | `dist/render-hybrid.js` |
| [/northstar/compare](https://jamesbox.exe.xyz/northstar/compare) | Renders the same seeded inputs with all three in the server process, checks the HTML is identical, and shows median/p90 render times |

Storefront pages render fresh random data on every request. Add `?seed=N` for deterministic
data and `?large=1` for a ~200-product page (~285 KB of HTML). The bar at the top shows the
renderer, the render time and the seed, and links to the same request in the other two
renderers. Every storefront response has a `Server-Timing: render;dur=…` header that times the
render call alone (`performance.now()` before and after).

The storefront's own links (`/c/…`, `/p/…`, `/signin`) point at the site root, not at `/northstar`:
the app's HTML must stay byte-identical to the reference, so the server does not rewrite it.

## Layout

```
src/
  App.jsx                    root: the three context providers + catalog stats (useMemo)
  pages/CatalogPage.jsx      page shell: banner, header, crumbs, filters | products | quote, footer
  components/
    layout/                  SiteHeader, PrimaryNav (+ NavItem), AnnouncementBanner, Breadcrumbs, SiteFooter
    account/                 UserMenu, LoyaltyBadge
    search/                  SearchBox
    filters/                 FilterSidebar, FilterGroup, FilterOption
    product/                 ProductGrid, ProductCard, HeroSpotlight, PriceBlock, StockBadge,
                             StarRating, SpecList, ReviewSnippet, ProductBadges, EmptyCatalogState
    catalog/                 CatalogToolbar, PaginationBar
    cart/                    CartSummaryAside, CartLineItem
    ui/                      ActionButton, AvatarBadge, CountPill
  context/                   ThemeContext, LocaleContext, UserContext
  lib/                       money, numbers, dates, classNames, theme, text (initials),
                             cart (quote totals), catalog (toolbar stats)
  data.js                    seeded request-data generator + the fixed 500-input check corpus
dist/                        build outputs (committed)
  app.js                     the bundled app: one CommonJS file, module.exports = App
  render-prepack.js          Prepack-specialized renderer: exports render(data) -> html
  render-hybrid.js           Hybrid-specialized renderer: exports render(data) -> html
scripts/
  build.js                   src/ -> dist/app.js (esbuild + Babel JSX)
  build-prepack.js           dist/app.js -> dist/render-prepack.js
  build-hybrid.js            dist/app.js -> dist/render-hybrid.js
  render.js                  print one page: npm run render -- <seed> [small|large]
  server-timing.js           sample Server-Timing from the running server
  serve-forever.sh           restart loop used to keep the demo server up
test/
  compare.js                 byte-identical check on the 500-input corpus
  fixtures/app.original.js   the original single-file app, the reference for the restructure
bench/
  impl/{prepack,hybrid}.js   adapters so prepack-revived's react-bench harness can load the dist builds
  results/perf.{md,json}     react-bench perf.js run
public/styles.css            storefront + demo stylesheet
server.js                    demo server
```

The app started as one file. It was split into modules without changing the component tree:
`useId` values depend on the tree's shape, so the output stays byte-identical. The only code
changes are moving the two `useMemo` loops into `lib/cart.js` and `lib/catalog.js`, and renaming
`PageShell` to `CatalogPage`.

## Build and test

```sh
npm install
npm run build             # src/ -> dist/app.js
npm test                  # build, then dist/app.js vs the original app on the 500-input corpus
npm run test:specialized  # dist/render-{prepack,hybrid}.js vs renderToString(dist/app.js), 500 inputs
npm start                 # demo server on :3100 under /northstar/ (PORT, HOST, BASE_PATH override)
npm run render -- 42      # print one rendered page
```

`scripts/build.js` bundles `src/App.jsx` with esbuild into a single CommonJS file that leaves
`require("react")` external. Three choices keep the bundle close to hand-written CommonJS, which
is the form the specializers expect:

- JSX goes through Babel's classic runtime with `useBuiltIns`, so spreads become `Object.assign`
  rather than esbuild helpers.
- `react` resolves to a virtual module whose default export is a `React` variable bound by a
  `require("react")` banner, so components call `react_default.createElement` directly, without
  `__toESM` interop.
- The bundle is emitted as ESM, and its final `export { App as default }` is rewritten to
  `module.exports = App`.

## The specialized builds

Both builders read `dist/app.js` and write a standalone module that exports
`render(data) -> html` and returns exactly `ReactDOMServer.renderToString(<App data={data} />)`.
At runtime the outputs need only `react`/`react-dom` (for fallbacks) and `dist/app.js`. Nothing is
loaded from prepack-revived, and neither output uses `eval` or `new Function`. Rebuilding is
deterministic: the same inputs produce the same files.

**Prepack**: `PREPACK_DIR=<prepack-revived checkout> npm run build:prepack` (about 10 s). It needs
a built checkout (`yarn build-prepack`) that contains `react-ssr/`; this build used branch
`react-prepack` at `75afdece`.
- `react-ssr/compiler.js` infers a data schema from 440 training requests (seeds disjoint from the
  check corpus).
- Prepack then evaluates a port of React 18's Fizz `renderToString` path together with the app,
  with `data` abstract. The output is a script that defines a specialized `__ssrRender` (React
  folds away completely) and a schema validator `__ssrConforms`.
- The builder inlines that script in a function instead of `new Function` and adds the guard:
  conforming data goes to the specialized code, anything else to `renderToString` with
  `dist/app.js`, loaded lazily.
- Design: `docs/revive/react.md` in prepack-revived.

**Hybrid**: `HYBRID_DIR=<prepack-revived checkout> npm run build:hybrid` (about 2 s). This build
used branch `react-hybrid` at `b91b347a`.
- `hybrid/react` instruments the app and traces it under the real React on 70 training requests.
  From the traces it learns one guarded template per component and per list callback: constant
  HTML chunks plus slots, with React's escaping, attribute and `useId` rules checked against React
  at build time.
- It generates JS that runs in the app module's scope, so templates call the app's own helpers
  such as `formatMoney`.
- It self-checks the templates against React on the training set.
- The builder wraps the runtime source (`dist/app.js` + templates) in a CommonJS module function
  and adds the render loop: run the template, and on a failed guard or an exception, render that
  request with React.
- Design: `hybrid/react/README.md` in prepack-revived.

## Results

**Correctness (500-input corpus: 471 small pages, 25 large pages, 4 edge cases)**

| check | result |
|---|---|
| `dist/app.js` vs original single-file app (`npm test`) | 500/500 byte-identical |
| `dist/render-prepack.js` vs `renderToString(dist/app.js)` | 500/500 byte-identical, 0 fallbacks |
| `dist/render-hybrid.js` vs `renderToString(dist/app.js)` | 500/500 byte-identical, 2 fallbacks (`promo.minOrder === 0`, `specs: []`: hand-written edge cases never seen in training) |
| both, through prepack-revived's `react-bench/check.js` (`bench/impl/*.js`) | 500/500 each |
| data outside the schema/templates (e.g. a numeric product title, an unknown field) | both fall back to React and still match |

**Throughput**: prepack-revived `react-bench/perf.js` on the dist builds. Separate process per
cell, cycling through 500 small / 100 large inputs, 2 interleaved rounds, on a shared 4-vCPU box
(load average about 4). Full table: `bench/results/perf.md`.

| engine | page | renderToString | Prepack | Hybrid |
|---|---|---:|---:|---:|
| JIT | small (~6 KB) | 0.067 ms p50 | 0.011 ms (**5.2×**) | 0.012 ms (**5.0×**) |
| JIT | large (~285 KB) | 3.01 ms p50 | 0.67 ms (**4.5×**) | 0.65 ms (**4.6×**) |
| jitless | small | 0.50 ms p50 | 0.055 ms (**11.2×**) | 0.048 ms (**10.4×**) |
| jitless | large | 21.3 ms p50 | 2.68 ms (**6.6×**, noisy run) | 1.88 ms (**11.2×**) |

**In the demo server**: `/northstar/compare` with the defaults (100 small + 10 large inputs, 10
rounds, interleaved in one process). A typical run:

| page | renderToString median | Prepack | Hybrid |
|---|---:|---:|---:|
| small | 72.5 µs | 16.5 µs (4.4×) | 17.2 µs (4.2×) |
| large | 2.87 ms | 0.71 ms (4.0×) | 0.67 ms (4.3×) |

**Per request, from `Server-Timing`**: `node scripts/server-timing.js <base> 200 30`, run through
the site's proxy. Seeds 1–200 small and 1–30 large, the same inputs for each version, one
warm-up pass. Each request renders once between HTTP handling, so the JIT is less warm and the
ratios are lower than in a tight loop:

| page | renderToString median | Prepack | Hybrid |
|---|---:|---:|---:|
| small | 0.128 ms | 0.052 ms (2.5×) | 0.046 ms (2.8×) |
| large | 3.43 ms | 1.21 ms (2.9×) | 0.81 ms (4.2×) |

## Running the demo server

```sh
setsid nohup scripts/serve-forever.sh >> server.log 2>&1 < /dev/null &
```

The VM has no systemd, so `scripts/serve-forever.sh` restarts `node server.js` whenever it
exits. The site at jamesbox.exe.xyz (`~/projects/website`) forwards `/northstar` and
`/northstar/*` to `127.0.0.1:3100` with the path preserved, so every route is served under
`BASE_PATH` (default `/northstar`). After a VM reboot, run the command above again.
