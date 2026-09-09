import { NextResponse } from "next/server";
import { getMarketOverview } from "@/lib/market-data/mockFeed";

export async function GET() {
  try {
    const overview = getMarketOverview();
    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load market overview" },
      { status: 500 }
    );
  }
}

