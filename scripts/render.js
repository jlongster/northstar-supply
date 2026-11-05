"use strict";

// Print one live-store page rendered with renderToString(dist/app.js):
//   npm run render -- /search "q=drill&sort=price-asc" [cart-cookie] [--stats]
// e.g. npm run render -- /cart "" "NS-ME-1000:2,NS-PO-1343:1"
process.env.NODE_ENV = process.env.NODE_ENV || "production";
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const App = require("../dist/app.js");
const { buildPage } = require("../store/page.js");

const args = process.argv.slice(2).filter((a) => a !== "--stats");
const [path = "/", qs = "", cart = ""] = args;
const page = buildPage({
  base: "/northstar/react",
  assets: "/northstar",
  path,
  query: new URLSearchParams(qs),
  cookies: { cart },
  nowSec: Math.floor(Date.now() / 1000),
});
const html = ReactDOMServer.renderToString(React.createElement(App, { data: page.data }));
if (process.argv.includes("--stats")) console.log(page.status, JSON.stringify(page.title), html.length + " bytes");
else process.stdout.write(html + "\n");
