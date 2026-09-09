import { OHLCVBar } from "@/types/stock";

/**
 * IDX Standard Price Fraction (Fraksi Harga / Tick Size)
 * Price < 200: Rp 1
 * 200 - 500: Rp 2
 * 500 - 2,000: Rp 5
 * 2,000 - 5,000: Rp 10
 * >= 5,000: Rp 25
 */
export function getIdxTickSize(price: number): number {
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
}

/**
 * Rounds a target price to the nearest valid IDX tick size
 */
export function roundToIdxTick(price: number, roundUp = false): number {
  const tick = getIdxTickSize(price);
  if (roundUp) {
    return Math.ceil(price / tick) * tick;
  }
  return Math.round(price / tick) * tick;
}

/**
 * Calculates Exponential Moving Average (EMA) for a series of closes
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) {
    // Simple average fallback if insufficient bars
    const sum = prices.reduce((acc, val) => acc + val, 0);
    return sum / prices.length;
  }

  const multiplier = 2 / (period + 1);
  // Seed with simple moving average of the first 'period' elements
  let ema = prices.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculates 20-Day Average Daily Volume (ADV) in lots
 */
export function calculateADV(volumes: number[], period = 20): number {
  if (volumes.length === 0) return 0;
  const slice = volumes.slice(-period);
  const sum = slice.reduce((acc, v) => acc + v, 0);
  return sum / slice.length;
}

/**
 * Evaluates how close the closing price is to the day's high
 * Formula: (Close - Low) / (High - Low)
 * Returns a percentage from 0 to 100%.
 * If High == Low (no range), returns 100% if Close >= Open else 0%.
 */
export function calculateProximityToHigh(close: number, high: number, low: number): number {
  const range = high - low;
  if (range <= 0) return 100;
  const proximity = ((close - low) / range) * 100;
  return Math.min(100, Math.max(0, proximity));
}

/**
 * Checks if the stock passes the BSJP upper quartile rule:
 * Close >= High - 0.25 * (High - Low)
 */
export function isNearDayHigh(close: number, high: number, low: number, maxDistancePct = 0.25): boolean {
  const range = high - low;
  if (range <= 0) return true;
  const threshold = high - maxDistancePct * range;
  return close >= threshold;
}

/**
 * Computes Orderbook Bid/Ask stack volume ratio
 */
export function calculateBidAskRatio(totalBidLots: number, totalAskLots: number): number {
  if (totalAskLots <= 0) return totalBidLots > 0 ? 99 : 1;
  return totalBidLots / totalAskLots;
}

