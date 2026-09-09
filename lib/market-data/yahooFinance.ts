import { OHLCVBar } from "@/types/stock";
import { generateCandlestickBars } from "./mockFeed";

/**
 * Fetches real historical OHLCV chart bars for an IDX stock (.JK) from Yahoo Finance
 * Falls back gracefully to synthetic bars if network or rate limit fails.
 */
export async function fetchIdxCandlestickData(
  ticker: string,
  timeframe: "15m" | "1d" = "1d",
  lastPrice = 1000
): Promise<OHLCVBar[]> {
  const cleanTicker = ticker.replace(".JK", "").toUpperCase();
  const yahooTicker = `${cleanTicker}.JK`;

  const interval = timeframe === "15m" ? "15m" : "1d";
  const range = timeframe === "15m" ? "5d" : "3mo";

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    yahooTicker
  )}?interval=${interval}&range=${range}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast response

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Yahoo Finance status ${res.status}`);
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      throw new Error("Invalid chart response format from Yahoo Finance");
    }

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators.quote[0];
    const opens: (number | null)[] = quote.open;
    const highs: (number | null)[] = quote.high;
    const lows: (number | null)[] = quote.low;
    const closes: (number | null)[] = quote.close;
    const volumes: (number | null)[] = quote.volume;

    const bars: OHLCVBar[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const open = opens[i];
      const high = highs[i];
      const low = lows[i];
      const close = closes[i];
      const volume = volumes[i] || 0;

      // Filter out null or NaN bars
      if (
        open !== null &&
        high !== null &&
        low !== null &&
        close !== null &&
        !isNaN(open) &&
        !isNaN(close)
      ) {
        const timeVal =
          timeframe === "15m"
            ? timestamps[i] // Unix timestamp for intraday
            : new Date(timestamps[i] * 1000).toISOString().split("T")[0]; // YYYY-MM-DD for daily

        bars.push({
          time: timeVal,
          open: Math.round(open),
          high: Math.round(high),
          low: Math.round(low),
          close: Math.round(close),
          volume: Math.round(volume / 100), // convert shares to lots
        });
      }
    }

    if (bars.length > 0) {
      return bars;
    }
  } catch (err) {
    // Graceful fallback to synthetic high-fidelity candles
    // console.warn(`Notice: Yahoo Finance fallback for ${cleanTicker}:`, err);
  }

  return generateCandlestickBars(cleanTicker, lastPrice, timeframe);
}

