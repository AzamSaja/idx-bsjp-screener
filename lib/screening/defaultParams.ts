import { BsjpFilterParams } from "@/types/screening";

export const DEFAULT_BSJP_PARAMS: BsjpFilterParams = {
  // 1. Liquidity Thresholds
  minValueIdr: 5_000_000_000,         // > IDR 5 Billion daily turnover
  minVolumeAdvRatio: 1.5,             // Volume > 1.5x of 20-ADV

  // 2. Price Action & Structure
  minChangePct: 2.0,                  // Daily Change +2%
  maxChangePct: 15.0,                 // Up to +15% (avoid already capped ARA stocks)
  maxHighDistancePct: 0.25,           // Close >= High - 0.25 * [High - Low] (Upper 25% of day range)
  requireTrendAlignment: true,        // Close > EMA(20) and Close > EMA(50)

  // 3. Risk & Board Exclusions
  excludeNotasiKhusus: true,          // Exclude stocks with Special Notation
  excludeFCA: true,                   // Exclude Papan Pemantauan Khusus / Full Call Auction

  // 4. Accumulation & Orderbook Depth
  minTop3Ratio: 1.15,                 // Top 3 buyer volume > 1.15x seller volume
  minBidAskRatio: 1.10,               // Total Bid stack depth > Total Ask wall
};

export const BSJP_SCORE_WEIGHTS = {
  volumeMax: 25,          // Volume surge compared to 20-ADV
  priceActionMax: 20,     // Proximity to high, bullish candle body
  bandarMax: 25,          // Top 3 broker accumulation + foreign flow
  orderbookMax: 15,       // Pre-closing bid/ask stack ratio
  trendLiquidityMax: 15,  // Turnover size + EMA20/50 clearance
};

