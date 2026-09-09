import assert from "assert";

// 1. Tick size test
function getIdxTickSize(price) {
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
}

function roundToIdxTick(price, roundUp = false) {
  const tick = getIdxTickSize(price);
  if (roundUp) {
    return Math.ceil(price / tick) * tick;
  }
  return Math.round(price / tick) * tick;
}

assert.strictEqual(getIdxTickSize(150), 1);
assert.strictEqual(getIdxTickSize(350), 2);
assert.strictEqual(getIdxTickSize(1250), 5);
assert.strictEqual(getIdxTickSize(3250), 10);
assert.strictEqual(getIdxTickSize(10250), 25);

// 2. High Proximity test
function calculateProximityToHigh(close, high, low) {
  const range = high - low;
  if (range <= 0) return 100;
  const proximity = ((close - low) / range) * 100;
  return Math.min(100, Math.max(0, proximity));
}

function isNearDayHigh(close, high, low, maxDistancePct = 0.25) {
  const range = high - low;
  if (range <= 0) return true;
  const threshold = high - maxDistancePct * range;
  return close >= threshold;
}

// Case: High = 1000, Low = 900. Range = 100. Upper 25% starts at 975.
assert.strictEqual(isNearDayHigh(980, 1000, 900, 0.25), true);
assert.strictEqual(isNearDayHigh(975, 1000, 900, 0.25), true);
assert.strictEqual(isNearDayHigh(950, 1000, 900, 0.25), false);
assert.strictEqual(calculateProximityToHigh(1000, 1000, 900), 100);
assert.strictEqual(calculateProximityToHigh(950, 1000, 900), 50);

// 3. Trade Plan Generator Test
function generateTradePlan(entryPrice) {
  const rawTp1 = entryPrice * 1.020;
  const rawTp2 = entryPrice * 1.035;
  const rawSl = entryPrice * 0.975;

  const targetProfit1 = roundToIdxTick(rawTp1, true);
  const targetProfit2 = roundToIdxTick(rawTp2, true);
  const stopLoss = roundToIdxTick(rawSl, false);

  const tp1Pct = Number((((targetProfit1 - entryPrice) / entryPrice) * 100).toFixed(2));
  const tp2Pct = Number((((targetProfit2 - entryPrice) / entryPrice) * 100).toFixed(2));
  const slPct = Number((((stopLoss - entryPrice) / entryPrice) * 100).toFixed(2));

  const potentialGain = targetProfit1 - entryPrice;
  const potentialLoss = Math.max(1, entryPrice - stopLoss);
  const riskRewardRatio = Number((potentialGain / potentialLoss).toFixed(2));

  return {
    entryPrice,
    targetProfit1,
    targetProfit1Pct: tp1Pct,
    targetProfit2,
    targetProfit2Pct: tp2Pct,
    stopLoss,
    stopLossPct: slPct,
    riskRewardRatio,
  };
}

const plan = generateTradePlan(1380); // MEDC price tier (tick = 5)
assert.strictEqual(plan.targetProfit1 >= 1380, true);
assert.strictEqual(plan.stopLoss <= 1380, true);
assert.strictEqual(plan.riskRewardRatio >= 0.7, true);

console.log("All BSJP math unit assertions passed successfully!");
console.log("Sample Trade Plan for MEDC @ 1380:", plan);

