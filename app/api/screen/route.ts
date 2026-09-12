import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllStockSnapshots } from "@/lib/market-data/mockFeed";
import { getRealIdxStockSnapshots, hasRealDataAvailable } from "@/lib/market-data/idxLocalData";
import { screenStock } from "@/lib/screening/bsjpEngine";
import { DEFAULT_BSJP_PARAMS } from "@/lib/screening/defaultParams";
import { BsjpFilterParams, FilterPresetKey } from "@/types/screening";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const preset = (searchParams.get("preset") as FilterPresetKey) || "ALL";
    const requestedSource = searchParams.get("dataSource") || "REAL";

    // Build filter parameters from query or defaults
    const params: BsjpFilterParams = {
      minValueIdr: searchParams.has("minValueIdr")
        ? Number(searchParams.get("minValueIdr"))
        : DEFAULT_BSJP_PARAMS.minValueIdr,
      minVolumeAdvRatio: searchParams.has("minVolumeAdvRatio")
        ? Number(searchParams.get("minVolumeAdvRatio"))
        : DEFAULT_BSJP_PARAMS.minVolumeAdvRatio,
      minChangePct: searchParams.has("minChangePct")
        ? Number(searchParams.get("minChangePct"))
        : DEFAULT_BSJP_PARAMS.minChangePct,
      maxChangePct: searchParams.has("maxChangePct")
        ? Number(searchParams.get("maxChangePct"))
        : DEFAULT_BSJP_PARAMS.maxChangePct,
      maxHighDistancePct: searchParams.has("maxHighDistancePct")
        ? Number(searchParams.get("maxHighDistancePct"))
        : DEFAULT_BSJP_PARAMS.maxHighDistancePct,
      requireTrendAlignment: searchParams.has("requireTrendAlignment")
        ? searchParams.get("requireTrendAlignment") === "true"
        : DEFAULT_BSJP_PARAMS.requireTrendAlignment,
      excludeNotasiKhusus: searchParams.has("excludeNotasiKhusus")
        ? searchParams.get("excludeNotasiKhusus") === "true"
        : DEFAULT_BSJP_PARAMS.excludeNotasiKhusus,
      excludeFCA: searchParams.has("excludeFCA")
        ? searchParams.get("excludeFCA") === "true"
        : DEFAULT_BSJP_PARAMS.excludeFCA,
      minTop3Ratio: searchParams.has("minTop3Ratio")
        ? Number(searchParams.get("minTop3Ratio"))
        : DEFAULT_BSJP_PARAMS.minTop3Ratio,
      minBidAskRatio: searchParams.has("minBidAskRatio")
        ? Number(searchParams.get("minBidAskRatio"))
        : DEFAULT_BSJP_PARAMS.minBidAskRatio,
    };

    // Determine dataset to load: Real IDX (960+ stocks) vs Simulation Mock
    const isReal = requestedSource === "REAL" && hasRealDataAvailable();
    const rawSnapshots = isReal
      ? getRealIdxStockSnapshots()
      : getAllStockSnapshots();

    // Run screening pipeline
    let candidates = rawSnapshots.map((item: any) => {
      return screenStock(
        item.quote,
        item.brokerSummary,
        item.bidAskDepth,
        params,
        item.briefingMeta
      );
    });

    // Load cached TimesFM 3.0 forecasts if present
    const cacheFilePath = path.join(process.cwd(), "data", "timesfm_forecasts.json");
    let forecastMap: Record<string, any> = {};
    if (fs.existsSync(cacheFilePath)) {
      try {
        const raw = fs.readFileSync(cacheFilePath, "utf-8");
        const parsed = JSON.parse(raw);
        forecastMap = parsed.forecasts || {};
      } catch (e) {
        console.warn("Failed to parse timesfm_forecasts.json:", e);
      }
    }

    // Attach TimesFM forecast metadata to candidates
    candidates.forEach((c) => {
      const fc = forecastMap[c.stock.ticker];
      if (fc && fc.tPlus1 && fc.bsjpAlignment) {
        c.timesfmForecast = {
          tPlus1ChangePct: fc.tPlus1.changePct,
          tPlus1Price: fc.tPlus1.price,
          verdict: fc.bsjpAlignment.verdict,
          confidence: fc.confidenceScore || 85,
        };
      }
    });

    // Apply quick filters preset
    if (preset === "STRICT_BSJP") {
      candidates = candidates.filter((c) => c.passedFilters);
    } else if (preset === "TOP_ACCUMULATION") {
      candidates = candidates.filter(
        (c) =>
          c.brokerSummary.top3ConcentrationRatio >= 1.4 ||
          c.brokerSummary.foreignNetFlowIdr > 5_000_000_000 ||
          c.briefingMeta?.stealthAccumulation === true
      );
    } else if (preset === "BREAKOUT_52W") {
      candidates = candidates.filter(
        (c) => c.stock.lastPrice >= c.stock.high52w * 0.94
      );
    } else if (preset === "HIGH_LIQUIDITY") {
      candidates = candidates.filter((c) => c.stock.valueIdr >= 10_000_000_000);
    } else if (preset === "AI_CONFIRMED") {
      candidates = candidates.filter(
        (c) =>
          c.timesfmForecast?.verdict === "CONFIRMED_BY_AI" ||
          (c.timesfmForecast && c.timesfmForecast.tPlus1ChangePct > 0)
      );
    }

    // Sort descending by BSJP composite score (0 - 100)
    candidates.sort((a, b) => b.bsjpScore - a.bsjpScore);

    const stats = {
      totalScreened: rawSnapshots.length,
      matchingPreset: candidates.length,
      passedStrictBsjp: candidates.filter((c) => c.passedFilters).length,
      strongBuyCount: candidates.filter((c) => c.signal === "STRONG_BUY").length,
      aiConfirmedCount: candidates.filter((c) => c.timesfmForecast?.verdict === "CONFIRMED_BY_AI").length,
      dataSource: isReal ? "REAL" : "SIMULATION",
    };

    return NextResponse.json({
      success: true,
      data: {
        candidates,
        stats,
        preset,
        params,
        dataSource: stats.dataSource,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Screening execution failed" },
      { status: 500 }
    );
  }
}
