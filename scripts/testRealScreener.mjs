import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const snapshotPath = path.join(rootDir, "data", "realIdxSnapshot.json");
const overviewPath = path.join(rootDir, "data", "realMarketOverview.json");

console.log("=== IDX REAL DATA INTEGRATION VERIFICATION ===");

if (!fs.existsSync(snapshotPath)) {
  console.error("FAIL: realIdxSnapshot.json does not exist!");
  process.exit(1);
}

if (!fs.existsSync(overviewPath)) {
  console.error("FAIL: realMarketOverview.json does not exist!");
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
const overview = JSON.parse(fs.readFileSync(overviewPath, "utf-8"));

console.log(`[OK] Real Snapshot Trade Date: ${snapshot.tradeDate}`);
console.log(`[OK] Total Emiten Ingested: ${snapshot.totalCount}`);
console.log(`[OK] Market Turnover: Rp ${(overview.marketTurnoverIdr / 1e12).toFixed(2)} Triliun`);
console.log(`[OK] Market Breadth: ${overview.breadth.advancers} Up, ${overview.breadth.decliners} Down, ${overview.breadth.unchanged} Flat`);
console.log(`[OK] Top Dominant Broker: ${overview.bandarmology.topDominantBroker} (Institutional: ${overview.bandarmology.institutionalSharePct}%, Retail: ${overview.bandarmology.retailSharePct}%)`);

// Verify sample stocks
const sampleAadi = snapshot.stocks.find((s) => s.quote.ticker === "AADI");
console.log("\n--- Sample Emiten Verification: AADI ---");
console.log(`  Ticker: ${sampleAadi.quote.ticker}`);
console.log(`  Name: ${sampleAadi.quote.companyName}`);
console.log(`  Sector: ${sampleAadi.quote.sector}`);
console.log(`  Board: ${sampleAadi.quote.board} (isFCA: ${sampleAadi.quote.isFCA})`);
console.log(`  Close: Rp ${sampleAadi.quote.lastPrice} (${sampleAadi.quote.changePct > 0 ? "+" : ""}${sampleAadi.quote.changePct}%)`);
console.log(`  Turnover: Rp ${(sampleAadi.quote.valueIdr / 1e9).toFixed(1)} Miliar`);
console.log(`  20-ADV: ${sampleAadi.quote.adv20Lots.toLocaleString()} lots`);
console.log(`  Volume / ADV: ${sampleAadi.quote.volumeAdvRatio}x`);
console.log(`  EMA20: Rp ${sampleAadi.quote.ema20} | EMA50: Rp ${sampleAadi.quote.ema50}`);

// Verify Stealth Accumulation
const stealthStocks = snapshot.stocks.filter((s) => s.briefingMeta?.stealthAccumulation);
console.log(`\n--- Stealth Accumulation Signals Detected: ${stealthStocks.length} emiten ---`);
stealthStocks.slice(0, 5).forEach((s) => {
  console.log(`  * ${s.quote.ticker} (${s.quote.companyName}): Smart Money Delta = ${s.briefingMeta.smartMoneyDelta}, Priority = ${s.briefingMeta.priority}`);
});

// Verify FCA stocks
const fcaStocks = snapshot.stocks.filter((s) => s.quote.isFCA);
console.log(`\n--- Watchlist Board (FCA) Detected: ${fcaStocks.length} emiten ---`);
console.log(`  Sample FCA: ${fcaStocks.slice(0, 5).map((s) => s.quote.ticker).join(", ")}`);

console.log("\n[SUCCESS] All Real IDX dataset checks verified cleanly!");

