import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickers = [], format = "stockbit" } = body;

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No tickers provided for export" },
        { status: 400 }
      );
    }

    let outputText = "";
    let mimeType = "text/plain";
    let filename = `BSJP_Watchlist_${new Date().toISOString().split("T")[0]}`;

    if (format === "stockbit") {
      // Stockbit watchlist import accepts comma separated or newline separated
      outputText = tickers.join(", ");
      filename += "_Stockbit.txt";
    } else if (format === "mirae") {
      // Mirae HOTS format: CODE, MARKET (RG)
      const rows = ["Code,Market", ...tickers.map((t) => `${t},RG`)];
      outputText = rows.join("\r\n");
      mimeType = "text/csv";
      filename += "_Mirae_HOTS.csv";
    } else if (format === "mandiri") {
      // Mandiri Sekuritas MOST format: StockCode;Board
      const rows = ["StockCode;Board", ...tickers.map((t) => `${t};RG`)];
      outputText = rows.join("\r\n");
      mimeType = "text/csv";
      filename += "_Mandiri_MOST.csv";
    } else {
      outputText = tickers.join("\n");
      filename += ".txt";
    }

    return NextResponse.json({
      success: true,
      data: {
        text: outputText,
        filename,
        mimeType,
        tickerCount: tickers.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Export generation failed" },
      { status: 500 }
    );
  }
}

