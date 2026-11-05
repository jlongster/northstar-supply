"use strict";

// The live store's product catalog: 8 categories x 24 products, generated once from a fixed seed,
// so every visitor (and every renderer) sees the same products, prices and stock.
const { mulberry32 } = require("../src/data.js");

const CATEGORIES = [
  { id: "cat-1", slug: "measuring", label: "Measuring & Layout", blurb: "Calipers, micrometers, squares and levels." },
  { id: "cat-2", slug: "hand-tools", label: "Hand Tools", blurb: "Pliers, drivers, wrenches and hammers." },
  { id: "cat-3", slug: "power-tools", label: "Power Tools", blurb: "Cordless drills, drivers, saws and grinders." },
  { id: "cat-4", slug: "cutting", label: "Cutting & Abrasives", blurb: "Bits, blades, end mills and discs." },
  { id: "cat-5", slug: "workholding", label: "Clamps & Workholding", blurb: "Clamps, vises and fixtures." },
  { id: "cat-6", slug: "soldering", label: "Soldering & Electronics", blurb: "Stations, irons, crimpers and ESD." },
  { id: "cat-7", slug: "testing", label: "Electrical Testing", blurb: "Multimeters, clamp meters and testers." },
  { id: "cat-8", slug: "safety", label: "Safety & PPE", blurb: "Eye, ear, hand and head protection." },
];

const BRANDS = ["Halvorsen", "Kestrel", "Brightline", "Ironbark", "Meridian", "Tallis & Webb", "Oakhurst", "Corvid"];

// Per category: [name, price range, specs (label -> two variant values)], each in two variants.
const TEMPLATES = {
  measuring: [
    ["Digital Caliper", [28, 140], { Range: ["0–150 mm (6\")", "0–200 mm (8\")"], Resolution: ["0.01 mm", "0.01 mm / 0.0005\""] }],
    ["Outside Micrometer", [60, 210], { Range: ["0–25 mm", "25–50 mm"], Accuracy: ["±2 µm", "±3 µm"] }],
    ["Dial Indicator", [35, 120], { Travel: ["10 mm", "1\""], Graduation: ["0.01 mm", "0.001\""] }],
    ["Engineer's Square", [18, 85], { Blade: ["150 mm", "300 mm"], Grade: ["DIN 875/1", "DIN 875/0"] }],
    ["Laser Cross-Line Level", [79, 260], { Range: ["15 m", "30 m with receiver"], Beam: ["Green, 2 lines", "Green, 3 × 360°"] }],
    ["Steel Rule", [9, 32], { Length: ["300 mm (12\")", "600 mm (24\")"], Finish: ["Satin chrome", "Satin chrome"] }],
    ["Height Gauge", [140, 420], { Range: ["0–300 mm", "0–450 mm"], Resolution: ["0.01 mm", "0.01 mm"] }],
    ["Feeler Gauge Set", [11, 38], { Blades: ["20 leaves", "32 leaves"], Range: ["0.05–1.00 mm", "0.03–1.00 mm"] }],
    ["Digital Protractor", [32, 96], { Range: ["0–360°", "4 × 90°"], Resolution: ["0.1°", "0.05°"] }],
    ["Thread Pitch Gauge", [12, 40], { Pitches: ["Metric 0.4–7 mm", "UNC/UNF 4–80 TPI"], Leaves: ["24", "30"] }],
    ["Granite Surface Plate", [160, 640], { Size: ["300 × 200 mm", "600 × 450 mm"], Grade: ["B (inspection)", "A (lab)"] }],
    ["Tape Measure", [12, 36], { Length: ["5 m (16')", "8 m (26')"], Blade: ["25 mm nylon-coated", "32 mm nylon-coated"] }],
  ],
  "hand-tools": [
    ["Water Pump Pliers", [24, 62], { Length: ["250 mm (10\")", "300 mm (12\")"], Capacity: ["46 mm", "60 mm"] }],
    ["Precision Screwdriver Set", [26, 88], { Pieces: ["8-piece", "25-piece"], Tips: ["Slotted & Phillips", "Torx, hex & PZ"] }],
    ["Combination Wrench Set", [48, 190], { Sizes: ["8–19 mm, 12 pc", "6–32 mm, 26 pc"], Finish: ["Satin chrome", "Satin chrome"] }],
    ["Ratchet, 3/8\" Drive", [34, 120], { Teeth: ["72-tooth", "90-tooth"], Length: ["200 mm", "250 mm, flex head"] }],
    ["Torque Wrench", [95, 340], { Range: ["5–25 N·m (1/4\")", "40–200 N·m (1/2\")"], Accuracy: ["±3% CW", "±2% CW/CCW"] }],
    ["Hex Key Set", [16, 58], { Sizes: ["1.5–10 mm, 9 pc", "1.5–10 mm ball end, 13 pc"], Material: ["S2 steel", "S2 steel"] }],
    ["Diagonal Cutters", [21, 56], { Length: ["160 mm", "200 mm, high leverage"], Hardness: ["HRC 62", "HRC 64"] }],
    ["Dead-Blow Hammer", [28, 74], { Weight: ["450 g", "900 g"], Face: ["Polyurethane", "Polyurethane, steel shot"] }],
    ["Insulated Screwdriver Set", [38, 110], { Rating: ["1000 V AC (VDE)", "1000 V AC (VDE)"], Pieces: ["6-piece", "12-piece"] }],
    ["Socket Set, 1/4\" Drive", [46, 160], { Pieces: ["28-piece", "56-piece"], Sizes: ["4–14 mm", "4–14 mm + bits"] }],
    ["Locking Pliers", [18, 44], { Length: ["180 mm (7\")", "250 mm (10\")"], Jaw: ["Curved", "Long nose"] }],
    ["Utility Knife", [12, 34], { Blade: ["Retractable, 18 mm", "Fixed, 25 mm"], Body: ["Aluminum", "Glass-filled nylon"] }],
  ],
  "power-tools": [
    ["Brushless Hammer Drill", [149, 420], { Voltage: ["18 V", "18 V"], Torque: ["90 N·m", "135 N·m"] }],
    ["Impact Driver", [119, 320], { Voltage: ["12 V compact", "18 V"], Torque: ["135 N·m", "205 N·m"] }],
    ["Circular Saw", [139, 380], { Blade: ["165 mm", "190 mm"], Depth: ["57 mm", "66 mm"] }],
    ["Angle Grinder", [89, 260], { Disc: ["115 mm", "125 mm"], Speed: ["9,000 rpm", "11,000 rpm, variable"] }],
    ["Oscillating Multi-Tool", [99, 240], { Angle: ["3.2°", "3.4°"], Speed: ["20,000 opm", "21,000 opm, variable"] }],
    ["Jigsaw", [109, 290], { Stroke: ["26 mm", "26 mm, 4-stage orbital"], Depth: ["120 mm wood", "135 mm wood"] }],
    ["Random Orbit Sander", [89, 280], { Pad: ["125 mm", "150 mm"], Orbit: ["2.5 mm", "5 mm"] }],
    ["Rotary Hammer, SDS-plus", [199, 520], { Energy: ["2.0 J", "3.0 J"], Modes: ["2 modes", "3 modes, AVT"] }],
    ["Heat Gun", [49, 150], { Temperature: ["50–550 °C", "50–650 °C, LCD"], Airflow: ["250–500 l/min", "150–500 l/min"] }],
    ["Battery Pack", [69, 210], { Capacity: ["18 V 4.0 Ah", "18 V 8.0 Ah"], Cells: ["21700 Li-ion", "21700 Li-ion"] }],
    ["Rapid Charger", [45, 120], { Output: ["6 A", "12 A, dual bay"], Time: ["40 min (4.0 Ah)", "35 min (8.0 Ah)"] }],
    ["Cordless Router", [179, 430], { Collet: ["1/4\" & 6 mm", "1/4\", 8 mm & 1/2\""], Speed: ["10,000–30,000 rpm", "10,000–31,000 rpm"] }],
  ],
  cutting: [
    ["Cobalt Drill Bit Set", [32, 140], { Pieces: ["19-piece, 1–10 mm", "29-piece, 1/16–1/2\""], Coating: ["HSS-Co5", "HSS-Co8"] }],
    ["Carbide End Mill", [24, 96], { Diameter: ["6 mm, 3 flute", "12 mm, 4 flute"], Coating: ["TiAlN", "AlCrN"] }],
    ["Bi-Metal Hole Saw Kit", [44, 160], { Range: ["19–64 mm, 9 pc", "16–152 mm, 15 pc"], Teeth: ["4/6 TPI", "4/6 TPI"] }],
    ["Band Saw Blade", [28, 90], { Length: ["1,735 mm", "2,362 mm"], Pitch: ["10/14 TPI", "6/10 TPI"] }],
    ["Cut-Off Wheels, 25-Pack", [18, 52], { Size: ["115 × 1.0 mm", "125 × 1.0 mm"], Material: ["Inox", "Inox, ceramic grain"] }],
    ["Flap Disc Assortment", [22, 64], { Grits: ["40/60/80", "40/60/80/120"], Size: ["115 mm", "125 mm"] }],
    ["Step Drill Bit Set", [29, 88], { Range: ["4–32 mm, 3 pc", "4–39 mm, 5 pc"], Coating: ["TiN", "HSS-Co5"] }],
    ["Tap & Die Set", [58, 240], { Sizes: ["M3–M12, 40 pc", "M3–M20 + UNC, 76 pc"], Material: ["HSS", "HSS-E"] }],
    ["Countersink Set", [24, 70], { Angle: ["90°", "90°, zero-flute"], Pieces: ["3-piece", "6-piece"] }],
    ["Diamond Sharpening Plate", [38, 120], { Grit: ["400/1000", "1000/6000"], Size: ["200 × 70 mm", "250 × 75 mm"] }],
    ["Annular Cutter", [62, 190], { Diameter: ["18 mm", "26 mm"], Depth: ["50 mm", "50 mm, carbide"] }],
    ["Circular Saw Blade", [32, 110], { Size: ["165 mm, 40T", "190 mm, 60T"], Application: ["Wood", "Aluminum & plastics"] }],
  ],
  workholding: [
    ["Parallel Clamp", [34, 92], { Capacity: ["600 mm", "1,000 mm"], Force: ["5,000 N", "8,000 N"] }],
    ["Bench Vise", [89, 320], { Jaw: ["100 mm", "150 mm, swivel base"], Opening: ["100 mm", "160 mm"] }],
    ["Quick-Release Bar Clamp", [16, 44], { Capacity: ["300 mm", "600 mm"], Force: ["1,100 N", "2,200 N"] }],
    ["Toggle Clamp", [9, 30], { Type: ["Horizontal", "Vertical"], Holding: ["227 kg", "340 kg"] }],
    ["Machine Vise", [120, 420], { Jaw: ["100 mm", "150 mm"], Accuracy: ["0.02 mm", "0.01 mm"] }],
    ["Magnetic V-Block Pair", [48, 160], { Capacity: ["5–50 mm", "5–75 mm"], Pull: ["60 kg", "90 kg"] }],
    ["Spring Clamp Set", [14, 36], { Pieces: ["6-piece", "12-piece"], Opening: ["25–50 mm", "25–75 mm"] }],
    ["Welding Clamp", [22, 58], { Type: ["C-clamp, swivel pads", "Locking, deep throat"], Opening: ["75 mm", "125 mm"] }],
    ["Corner Clamp", [19, 49], { Angle: ["90°", "90°, two-axis"], Capacity: ["70 mm", "95 mm"] }],
    ["Fixture Clamp Kit", [140, 380], { Slot: ["14 mm T-slot", "16 mm T-slot"], Pieces: ["52-piece", "58-piece"] }],
    ["Pipe Clamp Fixture", [24, 60], { Pipe: ["1/2\"", "3/4\""], Jaw: ["Single", "Double, H-style"] }],
    ["Soft Jaw Pads", [12, 34], { Width: ["100 mm", "150 mm"], Material: ["Polyurethane", "Aluminum, magnetic"] }],
  ],
  soldering: [
    ["Soldering Station", [89, 320], { Power: ["70 W", "120 W"], Range: ["200–480 °C", "50–500 °C"] }],
    ["Hot-Air Rework Station", [129, 420], { Airflow: ["120 l/min", "200 l/min"], Range: ["100–480 °C", "100–500 °C"] }],
    ["Ratcheting Crimper", [38, 120], { Range: ["AWG 22–10", "AWG 26–10, interchangeable dies"], Type: ["Insulated terminals", "Open barrel & ferrules"] }],
    ["Wire Stripper", [22, 64], { Range: ["AWG 24–10", "0.2–6 mm², self-adjusting"], Cutter: ["Built-in", "Built-in"] }],
    ["ESD Mat Kit", [32, 90], { Size: ["600 × 500 mm", "1,200 × 600 mm"], Includes: ["Wrist strap", "Wrist strap & ground cord"] }],
    ["Solder Wire", [14, 42], { Alloy: ["Sn60Pb40, 0.8 mm", "SAC305 lead-free, 0.5 mm"], Weight: ["250 g", "500 g"] }],
    ["Fume Extractor", [79, 260], { Airflow: ["130 m³/h", "190 m³/h"], Filter: ["Carbon", "HEPA + carbon"] }],
    ["Helping Hands", [18, 58], { Arms: ["4 flexible arms", "6 arms, magnifier"], Base: ["Cast iron", "Weighted steel"] }],
    ["Precision Tweezers Set", [16, 46], { Pieces: ["6-piece", "9-piece"], Material: ["Anti-magnetic steel", "ESD-safe steel"] }],
    ["Desoldering Pump", [9, 28], { Body: ["Aluminum", "Aluminum, anti-static"], Tip: ["PTFE", "Silicone"] }],
    ["Heat-Shrink Assortment", [12, 38], { Pieces: ["328-piece", "560-piece"], Ratio: ["2:1", "3:1, adhesive-lined"] }],
    ["Bench Power Supply", [79, 260], { Output: ["0–30 V, 5 A", "0–60 V, 5 A, programmable"], Channels: ["1", "2"] }],
  ],
  testing: [
    ["True-RMS Multimeter", [79, 290], { Category: ["CAT III 600 V", "CAT IV 600 V"], Counts: ["6,000", "20,000"] }],
    ["Clamp Meter", [69, 240], { Range: ["400 A AC", "600 A AC/DC"], Jaw: ["30 mm", "34 mm"] }],
    ["Non-Contact Voltage Tester", [19, 48], { Range: ["12–1,000 V AC", "12–1,000 V AC, flashlight"], Rating: ["CAT IV 1,000 V", "CAT IV 1,000 V"] }],
    ["Insulation Tester", [240, 680], { Voltage: ["250/500/1,000 V", "50–1,000 V"], Range: ["0.1 MΩ–4 GΩ", "0.01 MΩ–20 GΩ"] }],
    ["Thermal Imager", [299, 980], { Resolution: ["160 × 120", "320 × 240"], Range: ["-20–400 °C", "-20–650 °C"] }],
    ["Infrared Thermometer", [32, 110], { Range: ["-50–550 °C", "-50–800 °C"], Ratio: ["12:1", "30:1"] }],
    ["Outlet Tester", [12, 36], { Type: ["3-light", "GFCI, LCD"], Voltage: ["120 V", "120 V"] }],
    ["Bench Oscilloscope", [299, 1190], { Bandwidth: ["100 MHz, 2 ch", "200 MHz, 4 ch"], Sample: ["1 GSa/s", "2 GSa/s"] }],
    ["Test Lead Kit", [24, 72], { Rating: ["CAT III 1,000 V", "CAT IV 600 V"], Pieces: ["8-piece", "16-piece"] }],
    ["Phase Rotation Tester", [89, 240], { Voltage: ["40–700 V", "40–1,000 V"], Rating: ["CAT IV 600 V", "CAT IV 600 V"] }],
    ["Cable Tracer", [59, 180], { Range: ["Up to 2 km", "Up to 3 km, live wires"], Type: ["Tone & probe", "Transmitter & receiver"] }],
    ["Earth Ground Tester", [380, 990], { Method: ["3-pole", "3/4-pole + stakeless"], Range: ["0–2,000 Ω", "0–20 kΩ"] }],
  ],
  safety: [
    ["Safety Glasses", [8, 24], { Lens: ["Clear, anti-fog", "Smoke, anti-scratch"], Standard: ["ANSI Z87.1+", "EN 166"] }],
    ["Earmuffs", [19, 58], { Rating: ["NRR 27 dB", "NRR 31 dB"], Band: ["Over-head", "Neckband"] }],
    ["Cut-Resistant Gloves", [12, 30], { Level: ["ANSI A4", "ANSI A6"], Coating: ["Nitrile foam", "Polyurethane"] }],
    ["Hard Hat", [24, 72], { Type: ["Type I, 4-point", "Type II, 6-point"], Class: ["Class E", "Class E, vented"] }],
    ["Half-Mask Respirator", [28, 64], { Size: ["Medium", "Large"], Filters: ["P100", "P100 + OV"] }],
    ["Face Shield", [16, 46], { Window: ["Polycarbonate, 200 mm", "Polycarbonate, 250 mm"], Standard: ["ANSI Z87.1+", "ANSI Z87.1+"] }],
    ["Hi-Vis Safety Vest", [9, 28], { Class: ["Class 2", "Class 3"], Size: ["L/XL", "2XL/3XL"] }],
    ["Knee Pads", [22, 64], { Cap: ["Hard shell", "Gel, articulated"], Strap: ["Hook & loop", "Clip"] }],
    ["Welding Helmet", [79, 260], { Lens: ["Shade 9–13, 1/25,000 s", "Shade 5–13, true color"], View: ["96 × 43 mm", "100 × 62 mm"] }],
    ["First-Aid Kit", [32, 120], { Size: ["25-person", "50-person"], Standard: ["ANSI Class A", "ANSI Class B"] }],
    ["Disposable Nitrile Gloves", [14, 34], { Count: ["100", "100"], Thickness: ["5 mil", "8 mil"] }],
    ["Steel-Toe Overshoes", [24, 60], { Size: ["M (8–10)", "L (11–13)"], Standard: ["ASTM F2413", "ASTM F2413"] }],
  ],
};

const DESCRIPTIONS = {
  measuring: "Built for the inspection bench and the shop floor alike: hardened, lapped measuring faces, a clear readout and a protective case. Each unit ships with a certificate of conformance.",
  "hand-tools": "Forged and heat-treated for daily professional use, with ground working surfaces and handles that stay comfortable through a full shift. Backed by our lifetime hand-tool warranty.",
  "power-tools": "Brushless motor, electronic clutch and an all-metal gearbox for consistent performance under load. Compatible with every battery in the 18 V platform.",
  cutting: "Ground from premium tool steel or micro-grain carbide for long edge life and clean cuts, and packed in an indexed case so the right size is always at hand.",
  workholding: "Rigid, repeatable clamping that stays put: precision-ground faces, hardened spindles and pads that protect finished work.",
  soldering: "Fast heat-up, stable temperature and an ESD-safe design for production and repair work on modern electronics.",
  testing: "Safety-rated for the installations you work on, with clear readings, rugged housings and leads that are rated as high as the meter.",
  safety: "Certified protection that people will actually wear: lightweight, adjustable and comfortable for a full day on site.",
};

const VARIANT_SUFFIX = ["", " Kit"];
const REVIEWERS = ["Dana R., maintenance lead", "Marcus T.", "Priya S., QA inspector", "J. O'Neill", "Sam K., electrician", "Lena W."];
const REVIEW_BODIES = [
  "Exactly what we needed for the line. Solid build and accurate out of the box.",
  "Replaced an older unit we'd used for years & it's a clear step up. Worth the price.",
  "Good value. The case is a little tight but the tool itself is excellent.",
  "Arrived next day, well packed, with the cert included. Ordering two more.",
  "Comfortable to use all day; the finish has held up to coolant and oil.",
  "Does the job. Would like a longer warranty, but no complaints so far.",
];

function buildCatalog() {
  const rng = mulberry32(0x4e535550); // "NSUP"
  const int = (min, max) => min + Math.floor(rng() * (max - min + 1));
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const products = [];
  CATEGORIES.forEach((cat, ci) => {
    TEMPLATES[cat.slug].forEach(([name, [lo, hi], specs], ti) => {
      for (let v = 0; v < 2; v++) {
        const n = ci * 24 + ti * 2 + v;
        const brand = BRANDS[(ti * 3 + v + ci) % BRANDS.length];
        const base = lo + ((hi - lo) * (v === 0 ? int(5, 45) : int(50, 100))) / 100;
        const price = Math.max(5, Math.round(base)) - pick([0.01, 0.05, 0.01, 0.5]);
        const onSale = rng() < 0.22;
        const stockRoll = rng();
        const product = {
          sku: "NS-" + cat.slug.slice(0, 2).toUpperCase() + "-" + (1000 + n * 7),
          title: brand + " " + name + VARIANT_SUFFIX[v === 1 && rng() < 0.3 ? 1 : 0],
          brand,
          category: cat.slug,
          price: Math.round(price * 100) / 100,
          stock: stockRoll < 0.08 ? 0 : stockRoll < 0.2 ? int(1, 5) : int(8, 260),
          rating: int(36, 49) / 10,
          reviewCount: int(3, 1400),
          specs: Object.keys(specs).map((label) => ({ label, value: specs[label][v] })),
          shipsInDays: int(1, 4),
          description: DESCRIPTIONS[cat.slug],
          order: n,
        };
        if (onSale) product.originalPrice = Math.round(product.price * (1 + int(12, 35) / 100)) - 0.01;
        if (rng() < 0.08) product.rebateAmount = -int(1, 4) * 5;
        if (rng() < 0.14) product.featured = true;
        if (onSale && rng() < 0.25) product.clearance = true;
        if (rng() < 0.6) {
          product.topReview = {
            author: pick(REVIEWERS),
            body: pick(REVIEW_BODIES),
            verified: rng() < 0.85,
            daysAgo: int(3, 200),
          };
        }
        products.push(product);
      }
    });
  });
  return products;
}

const PRODUCTS = buildCatalog();
const BY_SKU = new Map(PRODUCTS.map((p) => [p.sku, p]));

module.exports = { CATEGORIES, BRANDS, PRODUCTS, BY_SKU };
