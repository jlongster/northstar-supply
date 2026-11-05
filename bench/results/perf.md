# Render-time benchmark

`node scripts/bench.js` and `node --jitless scripts/bench.js` (raw numbers in `jit.json` and
`jitless.json`). One process per run, renderers interleaved per input with the order rotated, after
a warm-up; 8 rounds (JIT) or 2 rounds (jitless) over each group. Node v26.7.0 on a shared 4-vCPU
AMD EPYC 9554P VM (load average about 2), 2026-11-05.

Groups: the live-store check corpus (`store/corpus.js`, 590 random requests across every route
plus 10 whole-catalog listings) and the random benchmark corpus (`src/data.js`, 475 small pages and
25 listings of about 200 products). "fb" is the share of renders a specialized build handed to
React.

## JIT

| group | inputs | avg HTML | renderToString p50 | Prepack p50 | Hybrid p50 |
|---|---:|---:|---:|---:|---:|
| store pages | 590 | 20.5 KB | 160.9 µs | 31.2 µs (**5.2×**, fb 0%) | 33.2 µs (**4.8×**, fb 0%) |
| whole catalog (192 products) | 10 | 300 KB | 2.87 ms | 0.56 ms (**5.1×**, fb 0%) | 0.55 ms (**5.2×**, fb 0%) |
| benchmark small | 475 | 9.9 KB | 109.5 µs | 24.2 µs (**4.5×**, fb 0%) | 24.3 µs (**4.5×**, fb 0.2%) |
| benchmark large | 25 | 310 KB | 3.09 ms | 0.73 ms (**4.3×**, fb 0%) | 0.72 ms (**4.3×**, fb 0%) |

## jitless

| group | inputs | avg HTML | renderToString p50 | Prepack p50 | Hybrid p50 |
|---|---:|---:|---:|---:|---:|
| store pages | 590 | 20.5 KB | 1.15 ms | 135 µs (**8.5×**) | 120 µs (**9.6×**) |
| whole catalog (192 products) | 10 | 300 KB | 21.4 ms | 1.83 ms (**11.7×**) | 1.84 ms (**11.6×**) |
| benchmark small | 475 | 9.9 KB | 754 µs | 93 µs (**8.1×**) | 81 µs (**9.3×**) |
| benchmark large | 25 | 310 KB | 23.4 ms | 2.26 ms (**10.4×**) | 2.23 ms (**10.5×**) |

## Per request on the live server

`node scripts/server-timing.js http://127.0.0.1:5180/northstar 300 30`, through the site's proxy:
the `Server-Timing` render duration of 300 store paths from the live corpus and 30 whole-catalog
listings, the same paths for each renderer, interleaved, after a warm-up pass. Each request renders
once between HTTP handling, so the JIT is less warm than in the loop above.

| page | renderToString median | Prepack | Hybrid |
|---|---:|---:|---:|
| store pages | 0.231 ms | 0.077 ms (3.0×) | 0.055 ms (4.2×) |
| whole catalog | 3.47 ms | 0.96 ms (3.6×) | 0.62 ms (5.6×) |
