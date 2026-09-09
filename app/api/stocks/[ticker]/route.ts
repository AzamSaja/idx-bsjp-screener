import { NextRequest, NextResponse } from "next/server";
import { getAllStockSnapshots } from "@/lib/market-data/mockFeed";
import { getRealIdxStockSnapshots, hasRealDataAvailable } from "@/lib/market-data/idxLocalData";
import { screenStock } from "@/lib/screening/bsjpEngine";
import { fetchIdxCandlestickData } from "@/lib/market-data/yahooFinance";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await context.params;
    const cleanTicker = ticker.toUpperCase().replace(".JK", "");
    const { searchParams } = new URL(request.url);
    const requestedSource = searchParams.get("dataSource");
    const paramLastPrice = searchParams.has("lastPrice")
      ? Number(searchParams.get("lastPrice"))
      : undefined;

    // 1. Search in Real IDX dataset (960+ stocks)
    let match: any = null;
    const isReal = requestedSource !== "SIMULATION" && hasRealDataAvailable();
    if (isReal) {
      const realSnapshots = getRealIdxStockSnapshots();
      match = realSnapshots.find((s) => s.quote.ticker === cleanTicker);
    }

    // 2. Fallback to mock simulation seeds
    if (!match) {
      const mockSnapshots = getAllStockSnapshots();
      match = mockSnapshots.find((s) => s.quote.ticker === cleanTicker);
    }

    let candidate = match
      ? screenStock(
          match.quote,
          match.brokerSummary,
          match.bidAskDepth,
          undefined,
          match.briefingMeta
        )
      : null;

    const referencePrice = candidate?.stock?.lastPrice || paramLastPrice || 1000;

    // 3. Fetch daily and 15m candlestick bars
    const [dailyBars, intradayBars] = await Promise.all([
      fetchIdxCandlestickData(cleanTicker, "1d", referencePrice),
      fetchIdxCandlestickData(cleanTicker, "15m", referencePrice),
    ]);

    // 4. If not found in snapshots, generate a fallback candidate structure so the chart still displays
    if (!candidate) {
      const lastDailyClose =
        dailyBars.length > 0 ? dailyBars[dailyBars.length - 1].close : referencePrice;
      const prevDailyClose =
        dailyBars.length > 1 ? dailyBars[dailyBars.length - 2].close : lastDailyClose;
      const change = lastDailyClose - prevDailyClose;
      const changePct = prevDailyClose > 0 ? (change / prevDailyClose) * 100 : 0;

      const fallbackQuote = {
        ticker: cleanTicker,
        companyName: `${cleanTicker} Equity`,
        sector: "General Equities",
        board: "Main Board",
        isFCA: false,
        notasiKhusus: [],
        lastPrice: lastDailyClose,
        previousClose: prevDailyClose,
        open: lastDailyClose,
        high: lastDailyClose,
        low: lastDailyClose,
        change,
        changePct,
        volume: 100000,
        volumeLots: 1000,
        valueIdr: 100000 * lastDailyClose,
        frequency: 500,
        adv20Lots: 800,
        volumeAdvRatio: 1.25,
        ema20: Math.round(lastDailyClose * 0.98),
        ema50: Math.round(lastDailyClose * 0.95),
        high52w: Math.round(lastDailyClose * 1.15),
        low52w: Math.round(lastDailyClose * 0.75),
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      const fallbackBroker = {
        ticker: cleanTicker,
        date: new Date().toISOString().split("T")[0],
        topBuyers: [],
        topSellers: [],
        top3BuyerVolumeLots: 500,
        top3SellerVolumeLots: 450,
        top3ConcentrationRatio: 1.11,
        foreignBuyValueIdr: 0,
        foreignSellValueIdr: 0,
        foreignNetFlowIdr: 0,
        accumulationStatus: "NEUTRAL" as const,
      };

      const fallbackDepth = {
        ticker: cleanTicker,
        bids: [],
        asks: [],
        totalBidLots: 5000,
        totalAskLots: 4500,
        bidAskRatio: 1.11,
        preClosingPressure: "BALANCED" as const,
      };

      candidate = screenStock(fallbackQuote, fallbackBroker, fallbackDepth);
    }

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

