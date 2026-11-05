# Northstar Supply

An example React 18 server-rendered storefront: an industrial-tools catalog page with a
deal-of-the-day spotlight, a filter sidebar, a cart/quote summary, header, nav and footer.
It has 30 function components plus `App`, using lists with keys, conditional rendering,
three React contexts (theme, locale, user), `useMemo`/`useId`, fragments, inline styles,
`dangerouslySetInnerHTML`, and HTML-escaping-heavy user text.

It was written as the benchmark app for
[prepack-revived](https://github.com/jlongster/prepack-revived): specializing React SSR for a
known app with unknown request data, using a revived Prepack (symbolic partial evaluation)
and a trace-based "hybrid" specializer. Both produce output byte-identical to
`renderToString` and run 4–6× faster under JIT and ~10× without a JIT.

## Run

```sh
npm install
npm start                 # http://localhost:3000  (random data per request)
                          # /?large=1 for ~200 products, /?seed=42 for deterministic data
npm run render -- 42      # print one rendered page
npm run build             # recompile src/app.jsx -> src/app.js
```

## Files

- `src/app.jsx`: the app source (JSX). `src/app.js` is the compiled version (classic JSX runtime).
  `App` takes a single `data` prop.
- `src/data.js`: a seeded generator for request data (products, user, locale, promotions),
  including edge cases such as empty lists, missing fields, and strings with `<>&"'`. It also
  builds the fixed 500-input corpus the benchmark uses (`getCheckCorpus()`).
- `server.js`: a minimal `http` server rendering with `ReactDOMServer.renderToString`.
