"use strict";

// Minimal SSR server: every request renders the storefront with freshly generated data.
// GET /            small page (~50 elements), new random data each request
// GET /?large=1    large page (~200 products, ~3,300 elements)
// GET /?seed=123   deterministic data for a given seed
const http = require("http");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const App = require("./src/app.js");
const { generateRequest } = require("./src/data.js");

const port = Number(process.env.PORT) || 3000;

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/") {
      res.writeHead(404).end("Not found");
      return;
    }
    const seed = url.searchParams.has("seed") ? Number(url.searchParams.get("seed")) : (Math.random() * 2 ** 31) | 0;
    const data = generateRequest(seed, url.searchParams.has("large") ? "large" : "small");
    const html = ReactDOMServer.renderToString(React.createElement(App, { data }));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<!doctype html>" + html);
  })
  .listen(port, () => console.log(`Northstar Supply on http://localhost:${port}`));
