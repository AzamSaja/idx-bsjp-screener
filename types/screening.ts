import { StockQuote, BrokerSummary, BidAskDepth } from "./stock";

export interface BsjpFilterParams {
  minValueIdr: number;          // Default: 5,000,000,000 (5 Billion)
  minVolumeAdvRatio: number;    // Default: 1.5x (Volume > 1.5x 20-ADV)
  minChangePct: number;         // Default: 2.0%
  maxChangePct: number;         // Default: 15.0% (avoid ARA locked stocks)
  maxHighDistancePct: number;   // Default: 0.25 (Close >= High - 0.25 * [High - Low])
  requireTrendAlignment: boolean; // Default: true (Price > EMA20 and Price > EMA50)
  excludeNotasiKhusus: boolean; // Default: true
  excludeFCA: boolean;          // Default: true (Papan Pemantauan Khusus)
  minTop3Ratio: number;         // Default: 1.15 (Top 3 Buyers > Sellers)
  minBidAskRatio: number;       // Default: 1.10 (Bid depth > Ask depth)
}

export interface BsjpScoreBreakdown {
  volumeScore: number;          // max 25 pts: Volume spike relative to 20-ADV
  priceActionScore: number;     // max 20 pts: Proximity to high and candle body
  bandarScore: number;          // max 25 pts: Top 3 broker accumulation + Foreign Flow
  orderbookScore: number;       // max 15 pts: Pre-closing Bid stack depth vs Ask wall
  trendLiquidityScore: number;  // max 15 pts: Turnover size + EMA20/50 clearance
  totalScore: number;           // 0 to 100
}

export interface TradePlan {
  entryPrice: number;           // Recommended Closing Auction price
  targetProfit1: number;        // TP1 (Morning Pre-opening/open)
  targetProfit1Pct: number;     // e.g. +2.0%
  targetProfit2: number;        // TP2 (Morning liquidity spike)
  targetProfit2Pct: number;     // e.g. +3.5%
  stopLoss: number;             // Strict Morning Stop-Loss (09:00 WIB trailing exit)
  stopLossPct: number;          // e.g. -2.5%
  riskRewardRatio: number;      // (TP1 - Entry) / (Entry - SL)
  executionWindow: string;      // "Entry: 15:50 - 16:15 WIB | Exit: 09:00 - 09:30 WIB"
}

export type ActionSignal = "STRONG_BUY" | "BUY" | "WATCH" | "OVEREXTENDED" | "AVOID";

export interface BriefingMetadata {
  stealthAccumulation: boolean;
  smartMoneyDelta?: number | null;
  priority?: string | null;
  alphaScore?: number | null;
  auditOpinion?: string | null;
}

export interface BsjpCandidate {
  stock: StockQuote;
  brokerSummary: BrokerSummary;
  bidAskDepth: BidAskDepth;
  scoreBreakdown: BsjpScoreBreakdown;
  bsjpScore: number;            // 0 - 100
  signal: ActionSignal;
  tradePlan: TradePlan;
  passedFilters: boolean;
  failedRules: string[];
  proximityToHighPct: number;   // 100% means closed at absolute High
  briefingMeta?: BriefingMetadata;
}

export type FilterPresetKey = 
  | "ALL"
  | "STRICT_BSJP"
  | "TOP_ACCUMULATION"
  | "BREAKOUT_52W"
  | "HIGH_LIQUIDITY";

