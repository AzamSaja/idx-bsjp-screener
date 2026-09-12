import fs from "fs";
import path from "path";

// Verify cached forecasts file
const cachePath = path.join(process.cwd(), "data", "timesfm_forecasts.json");
console.log("Checking data/timesfm_forecasts.json...");
if (!fs.existsSync(cachePath)) {
  console.error("FAIL: data/timesfm_forecasts.json does not exist!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
console.log(`PASS: Found ${data.totalForecasted} forecasts in cache.`);
console.log(`Model: ${data.model}`);

const sample = data.forecasts["BBRI"];
if (sample) {
  console.log("BBRI Forecast Sample:");
  console.log(`  Last Close: Rp ${sample.lastClose}`);
  console.log(`  T+1: Rp ${sample.tPlus1.price} (${sample.tPlus1.changePct}%)`);
  console.log(`  Verdict: ${sample.bsjpAlignment.verdict}`);
  console.log(`  Commentary: ${sample.bsjpAlignment.commentary}`);
  console.log(`  Points: ${sample.points.length} days forecasted`);
} else {
  console.error("FAIL: BBRI not in cache!");
  process.exit(1);
}

console.log("ALL FORECAST VERIFICATION CHECKS PASSED!");

