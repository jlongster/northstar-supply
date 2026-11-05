# Northstar Supply

A small server-rendered React 18 store for industrial tools: home page, category and search
listings with filters, sorting and pagination, product pages, a cookie-based cart, a sign-in stub,
and a light/dark theme. It uses function components, four contexts (theme, locale, user, nav),
`useMemo`/`useId`, fragments, inline styles, `dangerouslySetInnerHTML`, forms, and user text that
needs a lot of HTML escaping.

It is the benchmark app for
[prepack-revived](https://github.com/jlongster/prepack-revived), which specializes React SSR for a
known app with unknown request data. This repo contains the app, two specialized builds of it
(one from the revived Prepack, one from the trace-based "hybrid" specializer), and a server that
runs the store with all three renderers.

## Live demo

**https://jamesbox.exe.xyz/northstar/** (hosted on an exe.dev VM; only users with access to that
VM can see it).

| URL | What it is |
|---|---|
| [/northstar/](https://jamesbox.exe.xyz/northstar/) | About page |
| [/northstar/react/](https://jamesbox.exe.xyz/northstar/react/) | The store, rendered with `ReactDOMServer.renderToString` of `dist/app.js` |
| [/northstar/prepack/](https://jamesbox.exe.xyz/northstar/prepack/) | The same store, rendered with `dist/render-prepack.js` |
| [/northstar/hybrid/](https://jamesbox.exe.xyz/northstar/hybrid/) | The same store, rendered with `dist/render-hybrid.js` |
| [/northstar/compare](https://jamesbox.exe.xyz/northstar/compare) | Renders the same inputs with all three in the server process, checks the HTML is identical, and shows render times and fallback rates |

Store routes. Each one exists under every renderer prefix, e.g. `/northstar/hybrid/search?q=drill`:

| route | page |
|---|---|
| `/` | home: hero, deal of the week, categories, best sellers |
| `/shop` | all products (192) |
| `/c/:slug` | category: `measuring`, `hand-tools`, `power-tools`, `cutting`, `workholding`, `soldering`, `testing`, `safety` |
| `/search?q=…` | search results (title, brand, category and SKU), with a results header and an empty state |
| `/p/:sku` | product page, e.g. `/p/NS-ME-1000` |
| `/cart` | cart: change quantities, remove lines, order summary |
| `/signin` | sign-in stub: any input signs in as a sample trade account (5% tier discount) |
| anything else | a 404 page, rendered by the app |

Listings take `sort=featured|price-asc|price-desc|rating`, `in_stock=1`, `brand=` and `price=`
(both repeatable), and `page=N` or `page=all` (24 per page; `/shop?page=all` is the whole catalog,
about 300 KB of HTML). Form posts: `/cart/add`, `/cart/update`, `/theme`, `/signin`, `/signout`.

The page data is built from a fixed catalog plus the request (`store/page.js`), so the same URL always
renders the same page. Defaults: light theme, en-US / USD, signed out, empty cart. The cart, the
theme choice, the signed-in state and one-time messages are cookies scoped to `/northstar`, so they
carry over when you switch renderer. A store path without a renderer prefix
(`/northstar/search?q=drill`) is served by React.

The bar at the top of each store page switches renderer for the current URL. It shows the time
spent in the render call alone, and whether the specialized build handled the request or fell back
to React. Every store response has a `Server-Timing: render;dur=…` header with the same number
(`performance.now()` before and after the render call).

The store works without JavaScript. The page shell has one small script: it submits the filter form
when a filter or the sort changes, and closes the filter panel on narrow screens.

## Layout

```
src/                         the app (bundled into dist/app.js)
  App.jsx                    root: the four context providers
  pages/                     StorePage (shell + view switch), HomePage, ListingPage, ProductPage,
                             CartPage, SignInPage, NotFoundPage
  components/
    layout/                  SiteHeader, PrimaryNav (+ NavItem), AnnouncementBanner, FlashMessage,
                             Breadcrumbs, SiteFooter
    account/                 UserMenu, LoyaltyBadge, ThemeToggle
    search/                  SearchBox
    home/                    HeroSpotlight, CategoryTiles, ValueProps
    filters/                 FilterSidebar (the listing's GET form), FilterGroup, FilterOption
    catalog/                 CatalogToolbar (summary, sort, active-filter chips), PaginationBar
    product/                 ProductGrid, ProductCard, ProductDetail, ProductArt, AddToCartForm,
                             PriceBlock, StockBadge, StarRating, SpecList, ReviewSnippet,
                             ProductBadges, EmptyCatalogState
    cart/                    CartLink, CartLineItem, CartSummaryAside
    ui/                      ActionButton, AvatarBadge, CountPill, Icon
  context/                   ThemeContext, LocaleContext, UserContext, NavContext
  lib/                       money, numbers, dates, classNames, text (initials), cart (totals),
                             catalog (listing stats)
  data.js                    seeded random request generator: the 500-input benchmark corpus
store/                       the live store (server side, not bundled)
  catalog.js                 fixed catalog: 8 categories x 24 products
  page.js                    request (route, query, cookies) -> the app's data
  corpus.js                  random live requests through page.js: training and check corpora
dist/                        build outputs (committed)
  app.js                     the bundled app: one CommonJS file, module.exports = App
  render-prepack.js          Prepack-specialized renderer: exports render(data) -> html
  render-hybrid.js           Hybrid-specialized renderer: exports render(data) -> html
public/                      styles.css, art/*.svg (product illustrations), fonts/ (Inter, OFL)
scripts/
  build.js                   src/ -> dist/app.js (esbuild + Babel JSX)
  build-prepack.js           dist/app.js -> dist/render-prepack.js
  build-hybrid.js            dist/app.js -> dist/render-hybrid.js
  render.js                  print one store page: npm run render -- /search "q=drill"
  bench.js                   render-time benchmark of the three renderers
  server-timing.js           sample Server-Timing from the running server
  check-site.js              smoke test of a running server: routes, links, form posts
  serve-forever.sh           restart loop used to keep the demo server up
test/compare.js              byte-identical checks of both specialized builds (live + benchmark corpora)
bench/results/               benchmark results (perf.md, jit.json, jitless.json)
docs/design-review.md        design critique of the old storefront and notes on the redesign
docs/screenshots/            before/after screenshots
server.js                    demo server
```

## Data shape

`App` takes one prop, `data`:

```js
{
  theme: "light" | "dark", locale: { code, currency, symbol, decimals, groupSep, decSep },
  user: null | { id, name, tier, points, savedCount, avatarColor? },
  promo: null | { active, urgent, html, code?, minOrder? },
  flash: null | { text, cartLink },
  nav: { base, assets, view, path, current },   // view: home | listing | product | cart | signin | notfound
  search: { query, categorySlug, sortBy, inStockOnly },
  categories: [{ id, slug, label, count, hot? }],
  breadcrumbs: [{ href, label }],                // hrefs relative to nav.base
  cart: { taxRate, freeShippingThreshold, creditAdjustment, items: [{ sku, title, category, art?, qty, unitPrice, backordered? }] },
  products: [card],                              // the page's product grid (listing, best sellers or related)
  filters: [{ id, title, options: [{ value, label, count, selected }] }],
  activeFilters: [{ key, label, href }],
  specs: [{ label, value }],                     // product page
  home: null | { spotlight },
  listing: null | { kind, title, description, clearHref, pagination: { currentPage, totalPages, totalMatching, firstIndex, lastIndex, pageSize, showingAll, hrefPrefix } },
  product: null | { ...card, description, topReview },
}
```

The app only concatenates strings to make URLs: `nav.base` prefixes links and form actions,
`nav.assets` prefixes static files, and the server supplies the URL-encoded query strings for
pagination and filter chips (`hrefPrefix`, `activeFilters[].href`, `clearHref`). Forms send
`nav.current` back so the server can return to the same page.

Lists live at the top level rather than inside the nullable view objects (`home`, `listing`,
`product`) because the revived Prepack cannot specialize a list reached through a nullable object.
See "Specializer limits" below.

## Build and test

```sh
npm install
npm run build             # src/ -> dist/app.js
npm run build:prepack     # dist/app.js -> dist/render-prepack.js (about 30 s; needs PREPACK_DIR)
npm run build:hybrid      # dist/app.js -> dist/render-hybrid.js (about 10 s; needs HYBRID_DIR)
npm test                  # both specialized builds vs renderToString(dist/app.js), live + benchmark corpora
npm start                 # demo server on :3100 under /northstar/ (PORT, HOST, BASE_PATH override)
npm run render -- /search "q=drill&sort=price-asc" "NS-ME-1000:2"   # print one page (path, query, cart cookie)
node scripts/bench.js     # render-time benchmark (also with node --jitless)
node scripts/check-site.js http://127.0.0.1:5180 /northstar        # smoke-test a running server
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

After changing the app, rebuild all three outputs and run `npm test`.

## The specialized builds

Both builders read `dist/app.js` and write a standalone module that exports
`render(data) -> html` and returns exactly `ReactDOMServer.renderToString(<App data={data} />)`.
At runtime the outputs need only `react`/`react-dom` (for fallbacks) and `dist/app.js`. Nothing is
loaded from prepack-revived, and neither output uses `eval` or `new Function`. Rebuilding is
deterministic: the same inputs produce the same files.

Both train on requests whose seeds are disjoint from the test corpora: live-store requests from
`store/corpus.js` (random routes, queries, sorts, filters, pages, carts, themes and sign-in states
run through `store/page.js`), whole-catalog listings, and benchmark-corpus pages from `src/data.js`.

**Prepack**: `PREPACK_DIR=<prepack-revived checkout> npm run build:prepack`. It needs a built
checkout (`yarn build-prepack`) that contains `react-ssr/`; this build used branch `react-prepack`
at `75afdece`.
- `react-ssr/compiler.js` infers a data schema from 840 training requests (500 live, 10 whole
  catalog, 330 benchmark).
- Prepack then evaluates a port of React 18's Fizz `renderToString` path together with the app,
  with `data` abstract. The output is a script that defines a specialized `__ssrRender` (React
  folds away completely) and a schema validator `__ssrConforms`. The specialized code is 217 KB.
- The builder inlines that script in a function instead of `new Function` and adds the guard:
  conforming data goes to the specialized code, anything else to `renderToString` with
  `dist/app.js`, loaded lazily.
- Design: `docs/revive/react.md` in prepack-revived.

**Hybrid**: `HYBRID_DIR=<prepack-revived checkout> npm run build:hybrid`. This build used branch
`react-hybrid` at `b91b347a`.
- `hybrid/react` instruments the app and traces it under the real React on 1,113 training
  requests (500 live, 3 whole catalog, 610 benchmark). From the traces it learns one guarded
  template per component and per list callback: constant HTML chunks plus slots, with React's
  escaping, attribute and `useId` rules checked against React at build time.
- It generates JS that runs in the app module's scope, so templates call the app's own helpers
  such as `formatMoney`.
- It self-checks the templates against React on the training set.
- The builder wraps the runtime source (`dist/app.js` + templates) in a CommonJS module function
  and adds the render loop: run the template, and on a failed guard or an exception, render that
  request with React.
- Design: `hybrid/react/README.md` in prepack-revived.

### Specializer limits found while building the store

Two app patterns made the revived Prepack produce wrong code. The build still succeeds, but the
output contains residual `__bailout` calls and throws at runtime (`_8Bz is not a function`,
`Cannot read properties of null (reading 'tree')`):

1. **A list reached through a nullable object.** `data.listing.products.map(...)` where `listing`
   is `null | {...}` in the schema (a union). Prepack does not treat the array as a shaped array of
   unknown length, so the list renderer falls back to the generic interpreter, and that path is
   broken. Workaround: page collections (`products`, `filters`, `activeFilters`, `specs`) are
   top-level fields that are always arrays.
2. **A loop and a `.map` over the same array inside one conditional branch.** In `ListingPage`, the
   `useMemo` loop over the products (listing stats) followed by `ProductGrid`'s `.map` over the same
   array broke the map in the same way. Workaround: the stats are computed in `StorePage`, outside
   the view branch.

The hybrid specializer handled every pattern; its only cost is training coverage. A branch that
no training request took falls back to React, which is why its training set includes 600
benchmark pages (the benchmark corpus's remaining fallback is a hand-written edge case,
`promo.minOrder === 0`).

## Results

**Correctness** (`npm test`):

| check | Prepack | Hybrid |
|---|---|---|
| live corpus: 600 inputs (590 random store requests over every route, 10 whole-catalog listings) | 600/600 byte-identical, 0 fallbacks | 600/600 byte-identical, 0 fallbacks |
| benchmark corpus: 500 inputs (4 edge cases, 471 small pages, 25 large listings) | 500/500 byte-identical, 0 fallbacks | 500/500 byte-identical, 1 fallback (0.2%) |
| through the proxy (`scripts/check-site.js`): 20 routes × 3 renderers, 668 links and form actions, cart / theme / sign-in posts | identical app HTML on every route, no unexpected 404 | same |

**Render time** (`scripts/bench.js`: in one process, interleaved, after warm-up, on a shared
4-vCPU VM; details in `bench/results/perf.md`):

| engine | group | renderToString p50 | Prepack | Hybrid |
|---|---|---:|---:|---:|
| JIT | store pages (590, ~20 KB) | 161 µs | 31 µs (**5.2×**) | 33 µs (**4.8×**) |
| JIT | whole catalog (192 products, ~300 KB) | 2.87 ms | 0.56 ms (**5.1×**) | 0.55 ms (**5.2×**) |
| JIT | benchmark small (475, ~10 KB) | 110 µs | 24 µs (**4.5×**) | 24 µs (**4.5×**) |
| JIT | benchmark large (25, ~310 KB) | 3.09 ms | 0.73 ms (**4.3×**) | 0.72 ms (**4.3×**) |
| jitless | store pages | 1.15 ms | 135 µs (**8.5×**) | 120 µs (**9.6×**) |
| jitless | whole catalog | 21.4 ms | 1.83 ms (**11.7×**) | 1.84 ms (**11.6×**) |

**Per request on the live server** (`node scripts/server-timing.js http://127.0.0.1:5180/northstar 300 30`,
through the site's proxy: `Server-Timing` of 300 live-corpus store paths and 30 whole-catalog
listings per renderer, after a warm-up pass). Each request renders once between HTTP handling, so
the JIT is less warm and the ratios are lower than in a tight loop:

| page | renderToString median | Prepack | Hybrid |
|---|---:|---:|---:|
| store pages | 0.231 ms | 0.077 ms (3.0×) | 0.055 ms (4.2×) |
| whole catalog | 3.47 ms | 0.96 ms (3.6×) | 0.62 ms (5.6×) |

`/northstar/compare` measures the same way in the server process (defaults: 200 store pages and 5
whole-catalog listings, 5 rounds) and shows the fallback rate of each specialized build.

## Design

`docs/design-review.md` has a critical review of the original design (with screenshots) and the
reasoning behind the redesign: a restrained warm-grey palette with one accent colour, self-hosted
Inter on an 8-step type scale, a sticky header with search, consistent product cards with SVG
illustrations, real empty and error states, and a mobile layout. Screenshots:
`docs/screenshots/before/` and `docs/screenshots/after/`.

## Running the demo server

```sh
setsid nohup scripts/serve-forever.sh >> server.log 2>&1 < /dev/null &
```

The VM has no systemd, so `scripts/serve-forever.sh` restarts `node server.js` whenever it
exits; to deploy a change, kill the `node server.js` child and it restarts with the new code. The
site at jamesbox.exe.xyz (`~/projects/website`) forwards `/northstar` and `/northstar/*` to
`127.0.0.1:3100` with the path preserved. That proxy follows redirects itself and drops their
`Set-Cookie` headers, so form posts answer with a 200 page that sets the cookies and redirects with
a `Refresh` header (plus a meta refresh and `location.replace`). After a VM reboot, run the command
above again.
