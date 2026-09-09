import { NextRequest, NextResponse } from "next/server";
import { getAllStockSnapshots } from "@/lib/market-data/mockFeed";
import { screenStock } from "@/lib/screening/bsjpEngine";
import { fetchIdxCandlestickData } from "@/lib/market-data/yahooFinance";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await context.params;
    const cleanTicker = ticker.toUpperCase().replace(".JK", "");

    const snapshots = getAllStockSnapshots();
    const match = snapshots.find((s) => s.quote.ticker === cleanTicker);

    if (!match) {
      return NextResponse.json(
        { success: false, error: `Ticker ${cleanTicker} not found in active screen` },
        { status: 404 }
      );
    }

    const candidate = screenStock(match.quote, match.brokerSummary, match.bidAskDepth);

    // Fetch daily and 15m bars
    const [dailyBars, intradayBars] = await Promise.all([
      fetchIdxCandlestickData(cleanTicker, "1d", candidate.stock.lastPrice),
      fetchIdxCandlestickData(cleanTicker, "15m", candidate.stock.lastPrice),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        candidate,
        charts: {
          daily: dailyBars,
          intraday15m: intradayBars,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load stock detail" },
      { status: 500 }
    );
  }
}

