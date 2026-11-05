# react-bench perf (2026-11-05T18:54:40.726Z)

node v26.7.0, AMD EPYC 9554P 64-Core Processor x4, linux 6.12.115; 1s warm-up + 2s timed per cell, 2 interleaved round(s). Load average before/after: 4.3 3.0 3.2 / 4.8 3.4 3.3.

## Throughput (warm, cycling through corpus)

renders/s and speedup are medians over rounds (speedup = median of per-round impl/baseline ratios); latency columns come from the median round.

| engine | page | impl | renders/s | speedup | mean ms | p50 ms | p90 ms | p99 ms | alloc KB/render | avg HTML KB |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| jit | small | baseline (ReactDOMServer.renderToString) | 13,507 | 1.00x | 0.075 | 0.067 | 0.088 | 0.246 | 136.6 | 5.9 |
| jit | small | northstar dist/render-prepack.js | 70,244 | 5.21x | 0.013 | 0.011 | 0.016 | 0.025 | 15.4 | 5.9 |
| jit | small | northstar dist/render-hybrid.js | 67,321 | 4.99x | 0.015 | 0.012 | 0.018 | 0.037 | 16.1 | 5.9 |
| jit | large | baseline (ReactDOMServer.renderToString) | 309 | 1.00x | 3.233 | 3.011 | 4.144 | 6.057 | 6,409 | 283.7 |
| jit | large | northstar dist/render-prepack.js | 1,400 | 4.52x | 0.714 | 0.667 | 0.781 | 1.628 | 794.7 | 283.7 |
| jit | large | northstar dist/render-hybrid.js | 1,407 | 4.55x | 0.703 | 0.652 | 0.932 | 1.291 | 723.4 | 283.7 |
| jitless | small | baseline (ReactDOMServer.renderToString) | 1,656 | 1.00x | 0.509 | 0.502 | 0.636 | 0.780 | 155.1 | 5.9 |
| jitless | small | northstar dist/render-prepack.js | 17,972 | 11.20x | 0.057 | 0.055 | 0.075 | 0.109 | 16.3 | 5.9 |
| jitless | small | northstar dist/render-hybrid.js | 17,061 | 10.44x | 0.066 | 0.048 | 0.065 | 0.270 | 17.6 | 5.9 |
| jitless | large | baseline (ReactDOMServer.renderToString) | 46 | 1.00x | 21.302 | 21.281 | 23.219 | 25.517 | 7,180 | 283.8 |
| jitless | large | northstar dist/render-prepack.js | 304 | 6.60x | 4.881 | 2.675 | 10.444 | 16.654 | 838.3 | 283.7 |
| jitless | large | northstar dist/render-hybrid.js | 521 | 11.24x | 1.949 | 1.882 | 2.239 | 3.084 | 784.1 | 283.7 |
