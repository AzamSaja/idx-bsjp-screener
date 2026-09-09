import { NextRequest, NextResponse } from "next/server";
import { getMarketOverview } from "@/lib/market-data/mockFeed";
import { getRealMarketOverview, hasRealDataAvailable } from "@/lib/market-data/idxLocalData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataSource = searchParams.get("dataSource") || "REAL";

    if (dataSource === "REAL" && hasRealDataAvailable()) {
      const realOverview = getRealMarketOverview();
      if (realOverview) {
        return NextResponse.json({
          success: true,
          data: realOverview,
          dataSource: "REAL",
        });
      }
    }

    const overview = getMarketOverview();
    return NextResponse.json({
      success: true,
      data: overview,
      dataSource: "SIMULATION",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load market overview" },
      { status: 500 }
    );
  }
}
