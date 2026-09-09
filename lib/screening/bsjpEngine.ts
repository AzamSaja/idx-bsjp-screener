import { StockQuote, BrokerSummary, BidAskDepth } from "@/types/stock";
import { 
  BsjpFilterParams, 
  BsjpScoreBreakdown, 
  TradePlan, 
  BsjpCandidate, 
  ActionSignal 
} from "@/types/screening";
import { DEFAULT_BSJP_PARAMS, BSJP_SCORE_WEIGHTS } from "./defaultParams";
import { 
  isNearDayHigh, 
  calculateProximityToHigh, 
  roundToIdxTick,
  getIdxTickSize
} from "./indicators";

/**
 * Evaluates deterministic BSJP pass/fail rules
 */
export function evaluateBsjpFilters(
  quote: StockQuote,
  brokerSummary: BrokerSummary,
  bidAskDepth: BidAskDepth,
  params: BsjpFilterParams = DEFAULT_BSJP_PARAMS
): { passed: boolean; failedRules: string[] } {
  const failedRules: string[] = [];

  // 1. Special Notation (Notasi Khusus) Exclusion
  if (params.excludeNotasiKhusus && quote.notasiKhusus && quote.notasiKhusus.length > 0) {
    failedRules.push(`Special Notation active (${quote.notasiKhusus.join(", ")})`);
  }

  // 2. Watchlist Board (Papan Pemantauan Khusus / FCA) Exclusion
  if (params.excludeFCA && (quote.isFCA || quote.board?.toLowerCase().includes("watchlist"))) {
    failedRules.push("On Watchlist Board / Full Call Auction (FCA)");
  }

  // 3. Minimum Daily Value (IDR 5 Billion default)
  if (quote.valueIdr < params.minValueIdr) {
    const valueInBillion = (quote.valueIdr / 1e9).toFixed(1);
    const minInBillion = (params.minValueIdr / 1e9).toFixed(1);
    failedRules.push(`Turnover Rp ${valueInBillion}B below minimum Rp ${minInBillion}B`);
  }

  // 4. Volume Spike vs 20-ADV (> 1.5x default)
  if (quote.volumeAdvRatio < params.minVolumeAdvRatio) {
    failedRules.push(`Volume ratio ${quote.volumeAdvRatio.toFixed(2)}x below threshold ${params.minVolumeAdvRatio}x ADV`);
  }

  // 5. Daily Price Change (+2% to +15% default)
  if (quote.changePct < params.minChangePct) {
    failedRules.push(`Daily change ${quote.changePct.toFixed(2)}% below minimum +${params.minChangePct}%`);
  } else if (quote.changePct > params.maxChangePct) {
    failedRules.push(`Daily change ${quote.changePct.toFixed(2)}% exceeds max +${params.maxChangePct}% (risk of ARA trap/lock)`);
  }

  // 6. Close Position Near Day High: Close >= High - 0.25 * (High - Low)
  const isUpperQuarter = isNearDayHigh(quote.lastPrice, quote.high, quote.low, params.maxHighDistancePct);
  if (!isUpperQuarter) {
    const prox = calculateProximityToHigh(quote.lastPrice, quote.high, quote.low);
    failedRules.push(`Closing proximity (${prox.toFixed(0)}%) dropped below upper 25% range of the session`);
  }

  // 7. Trend Alignment: Close > EMA20 and Close > EMA50
  if (params.requireTrendAlignment) {
    if (quote.lastPrice <= quote.ema20) {
      failedRules.push(`Price Rp ${quote.lastPrice} is below EMA20 (Rp ${Math.round(quote.ema20)})`);
    }
    if (quote.lastPrice <= quote.ema50) {
      failedRules.push(`Price Rp ${quote.lastPrice} is below EMA50 (Rp ${Math.round(quote.ema50)})`);
    }
  }

  // 8. Accumulation Check: Top 3 Buyer Concentration OR Positive Foreign Flow
  const hasBandarAccumulation = brokerSummary.top3ConcentrationRatio >= params.minTop3Ratio;
  const hasForeignInflow = brokerSummary.foreignNetFlowIdr > 0;
  if (!hasBandarAccumulation && !hasForeignInflow) {
    failedRules.push(`Lack of institutional accumulation (CR3 ratio: ${brokerSummary.top3ConcentrationRatio.toFixed(2)}x, Net Foreign: Rp ${(brokerSummary.foreignNetFlowIdr / 1e9).toFixed(1)}B)`);
  }

  // 9. Orderbook Depth: Bid stack vs Ask wall
  if (bidAskDepth.bidAskRatio < params.minBidAskRatio) {
    failedRules.push(`Bid/Ask orderbook ratio ${bidAskDepth.bidAskRatio.toFixed(2)}x indicates thin buyer absorption`);
  }

  return {
    passed: failedRules.length === 0,
    failedRules,
  };
}

/**
 * Computes composite quantitative BSJP score (0 - 100)
 */
export function calculateBsjpScore(
  quote: StockQuote,
  brokerSummary: BrokerSummary,
  bidAskDepth: BidAskDepth
): BsjpScoreBreakdown {
  // 1. Volume Surge Score (Max 25 pts)
  // Scale: 1.0x -> 0 pts, 1.5x -> 12 pts, 3.5x+ -> 25 pts
  let volumeScore = 0;
  if (quote.volumeAdvRatio >= 1.0) {
    const normRatio = Math.min(quote.volumeAdvRatio, 3.5);
    volumeScore = Math.round(((normRatio - 1.0) / (3.5 - 1.0)) * BSJP_SCORE_WEIGHTS.volumeMax);
  }

  // 2. Price Action & Structure Score (Max 20 pts)
  // High proximity + sweet spot day gain (+3% to +9%)
  const prox = calculateProximityToHigh(quote.lastPrice, quote.high, quote.low);
  let priceActionScore = Math.round((prox / 100) * 14); // up to 14 pts for closing at top
  if (quote.changePct >= 3.0 && quote.changePct <= 9.5) {
    priceActionScore += 6; // +6 pts for optimal sweet spot gain
  } else if (quote.changePct > 9.5 && quote.changePct <= 14.0) {
    priceActionScore += 3;
  } else if (quote.changePct >= 2.0) {
    priceActionScore += 2;
  }
  priceActionScore = Math.min(BSJP_SCORE_WEIGHTS.priceActionMax, priceActionScore);

  // 3. Bandar Accumulation & Foreign Flow (Max 25 pts)
  // CR3 ratio: up to 15 pts, Foreign net flow: up to 10 pts
  let bandarScore = 0;
  if (brokerSummary.top3ConcentrationRatio >= 2.5) {
    bandarScore += 15;
  } else if (brokerSummary.top3ConcentrationRatio >= 1.8) {
    bandarScore += 12;
  } else if (brokerSummary.top3ConcentrationRatio >= 1.4) {
    bandarScore += 9;
  } else if (brokerSummary.top3ConcentrationRatio >= 1.15) {
    bandarScore += 6;
  } else if (brokerSummary.top3ConcentrationRatio >= 1.0) {
    bandarScore += 3;
  }

  if (brokerSummary.foreignNetFlowIdr > 15_000_000_000) {
    bandarScore += 10;
  } else if (brokerSummary.foreignNetFlowIdr > 5_000_000_000) {
    bandarScore += 8;
  } else if (brokerSummary.foreignNetFlowIdr > 1_000_000_000) {
    bandarScore += 5;
  } else if (brokerSummary.foreignNetFlowIdr > 0) {
    bandarScore += 2;
  }
  bandarScore = Math.min(BSJP_SCORE_WEIGHTS.bandarMax, bandarScore);

  // 4. Orderbook Bid-Ask Depth Score (Max 15 pts)
  let orderbookScore = 0;
  if (bidAskDepth.bidAskRatio >= 2.2) {
    orderbookScore = 15;
  } else if (bidAskDepth.bidAskRatio >= 1.6) {
    orderbookScore = 12;
  } else if (bidAskDepth.bidAskRatio >= 1.3) {
    orderbookScore = 9;
  } else if (bidAskDepth.bidAskRatio >= 1.1) {
    orderbookScore = 6;
  } else if (bidAskDepth.bidAskRatio >= 0.9) {
    orderbookScore = 3;
  }
  orderbookScore = Math.min(BSJP_SCORE_WEIGHTS.orderbookMax, orderbookScore);

  // 5. Trend Alignment & Liquidity Size (Max 15 pts)
  let trendLiquidityScore = 0;
  // Turnover scale
  if (quote.valueIdr >= 50_000_000_000) {
    trendLiquidityScore += 8;
  } else if (quote.valueIdr >= 20_000_000_000) {
    trendLiquidityScore += 6;
  } else if (quote.valueIdr >= 10_000_000_000) {
    trendLiquidityScore += 4;
  } else if (quote.valueIdr >= 5_000_000_000) {
    trendLiquidityScore += 2;
  }
  // Clearance above EMA20 and EMA50
  if (quote.lastPrice > quote.ema20 && quote.lastPrice > quote.ema50) {
    const ema20Dist = ((quote.lastPrice - quote.ema20) / quote.ema20) * 100;
    if (ema20Dist >= 1.5 && ema20Dist <= 8.0) {
      trendLiquidityScore += 7; // Strong momentum without overbought stretch
    } else if (ema20Dist > 8.0) {
      trendLiquidityScore += 4; // Moderate stretch
    } else {
      trendLiquidityScore += 3;
    }
  }
  trendLiquidityScore = Math.min(BSJP_SCORE_WEIGHTS.trendLiquidityMax, trendLiquidityScore);

  const totalScore = Math.min(
    100,
    volumeScore + priceActionScore + bandarScore + orderbookScore + trendLiquidityScore
  );

  return {
    volumeScore,
    priceActionScore,
    bandarScore,
    orderbookScore,
    trendLiquidityScore,
    totalScore,
  };
}

/**
 * Builds automated, risk-managed Trade Plan adhering to IDX tick sizes
 */
export function generateTradePlan(quote: StockQuote): TradePlan {
  const entryPrice = quote.lastPrice;
  
  // Default targets:
  // TP1: +1.8% to +2.2% (Morning pre-opening / open surge)
  // TP2: +3.0% to +3.8% (Morning extension)
  // Stop-Loss: -2.2% to -2.6% (Trailing exit next morning)
  const rawTp1 = entryPrice * 1.020;
  const rawTp2 = entryPrice * 1.035;
  const rawSl = entryPrice * 0.975;

  // Round up for TP (trader wants clear price levels) and down for SL to avoid premature triggers
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
    executionWindow: "Beli: 15:50 - 16:15 WIB | Jual: 09:00 - 09:30 WIB (Next Session)",
  };
}

/**
 * Determines action signal based on score and filter status
 */
export function determineActionSignal(
  score: number,
  passedFilters: boolean,
  changePct: number,
  isOverextended: boolean
): ActionSignal {
  if (isOverextended || changePct >= 14.5) {
    return "OVEREXTENDED";
  }
  if (passedFilters && score >= 75) {
    return "STRONG_BUY";
  }
  if (passedFilters && score >= 60) {
    return "BUY";
  }
  if (score >= 50) {
    return "WATCH";
  }
  return "AVOID";
}

/**
 * Main BSJP Screener Pipeline
 */
export function screenStock(
  quote: StockQuote,
  brokerSummary: BrokerSummary,
  bidAskDepth: BidAskDepth,
  params: BsjpFilterParams = DEFAULT_BSJP_PARAMS
): BsjpCandidate {
  const { passed, failedRules } = evaluateBsjpFilters(quote, brokerSummary, bidAskDepth, params);
  const scoreBreakdown = calculateBsjpScore(quote, brokerSummary, bidAskDepth);
  const proximityToHighPct = calculateProximityToHigh(quote.lastPrice, quote.high, quote.low);
  const tradePlan = generateTradePlan(quote);
  const isOverextended = quote.changePct >= 14.0 || (quote.high52w > 0 && quote.lastPrice >= quote.high52w * 1.05);
  
  const signal = determineActionSignal(scoreBreakdown.totalScore, passed, quote.changePct, isOverextended);

  return {
    stock: quote,
    brokerSummary,
    bidAskDepth,
    scoreBreakdown,
    bsjpScore: scoreBreakdown.totalScore,
    signal,
    tradePlan,
    passedFilters: passed,
    failedRules,
    proximityToHighPct,
  };
}

