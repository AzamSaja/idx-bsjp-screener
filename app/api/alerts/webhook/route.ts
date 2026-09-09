import { NextRequest, NextResponse } from "next/server";
import { formatWibTime } from "@/lib/market-data/marketPhase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, candidates, channel = "discord" } = body;

    const targetUrl = webhookUrl || process.env.DISCORD_WEBHOOK_URL;

    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No candidates provided for alert" },
        { status: 400 }
      );
    }

    const timeStr = formatWibTime();
    const topCandidates = candidates.slice(0, 5);

    if (channel === "discord") {
      const fields = topCandidates.map((c: any) => ({
        name: `🎯 ${c.stock.ticker} — Score: ${c.bsjpScore}/100 [${c.signal}]`,
        value: `**Harga**: Rp ${c.stock.lastPrice.toLocaleString("id-ID")} (${c.stock.changePct > 0 ? "+" : ""}${c.stock.changePct}%)\n` +
               `**Vol vs 20-ADV**: ${c.stock.volumeAdvRatio.toFixed(2)}x | **Value**: Rp ${(c.stock.valueIdr / 1e9).toFixed(1)}B\n` +
               `**Plan**: Beli: ${c.tradePlan.entryPrice} | TP1: ${c.tradePlan.targetProfit1} (+${c.tradePlan.targetProfit1Pct}%) | Cut-loss: ${c.tradePlan.stopLoss} (${c.tradePlan.stopLossPct}%)\n` +
               `**Bandar**: ${c.brokerSummary.accumulationStatus.replace("_", " ")} (CR3: ${c.brokerSummary.top3ConcentrationRatio}x)`,
        inline: false,
      }));

      const discordPayload = {
        username: "IDX BSJP Radar Bot",
        avatar_url: "https://assets.stockbit.com/logos/companies/BBCA.png",
        embeds: [
          {
            title: `🚨 BSJP RADAR ALERT — Late Session Pre-Closing (${timeStr})`,
            description: "High-conviction algorithmic candidates detected during 15:50-16:15 WIB closing window for overnight momentum capture.",
            color: 0x10b981, // Emerald green
            fields,
            footer: {
              text: "IDX BSJP Quantitative Screener • Discipline & Strict Stop-Loss Rules Apply",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      if (targetUrl && targetUrl.startsWith("http")) {
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        });

        if (!response.ok) {
          throw new Error(`Discord returned status ${response.status}`);
        }

        return NextResponse.json({
          success: true,
          message: "Alert webhook successfully dispatched to Discord!",
          payload: discordPayload,
        });
      }

      // If no valid webhook provided, return formatted payload preview
      return NextResponse.json({
        success: true,
        mockDispatched: true,
        message: "Webhook payload generated (Set DISCORD_WEBHOOK_URL to send live)",
        payload: discordPayload,
      });
    }

    // Telegram format
    let tgText = `🚨 *IDX BSJP RADAR ALERT* (${timeStr})\n\n`;
    topCandidates.forEach((c: any) => {
      tgText += `*${c.stock.ticker}* — Score: *${c.bsjpScore}/100* (${c.signal})\n`;
      tgText += `• Last: Rp ${c.stock.lastPrice} (${c.stock.changePct}%)\n`;
      tgText += `• Vol Spike: ${c.stock.volumeAdvRatio}x ADV | Value: Rp ${(c.stock.valueIdr / 1e9).toFixed(1)}B\n`;
      tgText += `• Plan: Buy @ ${c.tradePlan.entryPrice} | TP: ${c.tradePlan.targetProfit1} | SL: ${c.tradePlan.stopLoss}\n\n`;
    });

    return NextResponse.json({
      success: true,
      mockDispatched: true,
      message: "Telegram message generated",
      telegramText: tgText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook trigger failed" },
      { status: 500 }
    );
  }
}

