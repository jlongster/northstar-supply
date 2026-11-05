"use strict";

// Render one page to stdout: node scripts/render.js [seed] [small|large]
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const App = require("../src/app.js");
const { generateRequest } = require("../src/data.js");

const seed = Number(process.argv[2] || 1);
const variant = process.argv[3] || "small";
process.stdout.write(ReactDOMServer.renderToString(React.createElement(App, { data: generateRequest(seed, variant) })) + "\n");
