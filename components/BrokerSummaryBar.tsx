"use client";

import React from "react";
import { BrokerSummary } from "@/types/stock";
import { formatIdr, formatNumber } from "@/lib/utils";
import { Users, Globe, Building2 } from "lucide-react";

interface BrokerSummaryBarProps {
  summary: BrokerSummary;
}

export const BrokerSummaryBar: React.FC<BrokerSummaryBarProps> = ({ summary }) => {
  const totalBuyerLots = summary.topBuyers.reduce((acc, b) => acc + b.volumeLots, 0);
  const totalSellerLots = summary.topSellers.reduce((acc, s) => acc + s.volumeLots, 0);
  const combinedLots = totalBuyerLots + totalSellerLots;

  const buyerPct = combinedLots > 0 ? Math.round((totalBuyerLots / combinedLots) * 100) : 50;
  const sellerPct = 100 - buyerPct;

  const isForeignPositive = summary.foreignNetFlowIdr >= 0;

  return (
    <div className="bg-surface-100 rounded-lg border border-border p-4 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Bandarmology & Broker Flow Distribution
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Top 3 Concentration:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              summary.top3ConcentrationRatio >= 1.3
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : summary.top3ConcentrationRatio <= 0.8
                ? "bg-rose-950 text-rose-300 border border-rose-800"
                : "bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {summary.top3ConcentrationRatio.toFixed(2)}x CR3
          </span>
        </div>
      </div>

      {/* Visual Tug-of-War Bar (Buyers vs Sellers) */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] font-semibold mb-1">
          <span className="text-emerald-400">
            Top Buyers ({buyerPct}%) • {formatNumber(totalBuyerLots)} lots
          </span>
          <span className="text-rose-400">
            Top Sellers ({sellerPct}%) • {formatNumber(totalSellerLots)} lots
          </span>
        </div>
        <div className="w-full h-3 bg-surface-300 rounded-full overflow-hidden flex border border-border">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${buyerPct}%` }}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${sellerPct}%` }}
          />
        </div>
      </div>

      {/* Foreign Net Flow Banner */}
      <div className="flex items-center justify-between p-2 rounded bg-surface-200 border border-border mb-4">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">Institutional Foreign Flow:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Buy: <strong className="text-slate-200">{formatIdr(summary.foreignBuyValueIdr)}</strong>
          </span>
          <span className="text-slate-400">
            Sell: <strong className="text-slate-200">{formatIdr(summary.foreignSellValueIdr)}</strong>
          </span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              isForeignPositive
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                : "bg-rose-950 text-rose-400 border border-rose-800"
            }`}
          >
            {isForeignPositive ? "Net Inflow: +" : "Net Outflow: "}
            {formatIdr(summary.foreignNetFlowIdr)}
          </span>
        </div>
      </div>

      {/* Dual Table: Top Buyers vs Top Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Buyers */}
        <div className="border border-border/80 rounded-md overflow-hidden">
          <div className="bg-emerald-950/40 text-emerald-300 px-3 py-1.5 font-bold text-[11px] border-b border-border flex justify-between">
            <span>TOP BUYERS</span>
            <span>VOL (LOTS)</span>
          </div>
          <div className="divide-y divide-border/60">
            {summary.topBuyers.map((b, i) => (
              <div
                key={i}
                className="px-3 py-1.5 flex items-center justify-between hover:bg-surface-50 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 font-mono w-7">
                    {b.brokerCode}
                  </span>
                  {b.isForeign && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Foreign
                    </span>
                  )}
                  <span className="text-slate-400 truncate max-w-[120px]">
                    {b.brokerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatNumber(b.volumeLots)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    avg {formatNumber(b.avgPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="border border-border/80 rounded-md overflow-hidden">
          <div className="bg-rose-950/40 text-rose-300 px-3 py-1.5 font-bold text-[11px] border-b border-border flex justify-between">
            <span>TOP SELLERS</span>
            <span>VOL (LOTS)</span>
          </div>
          <div className="divide-y divide-border/60">
            {summary.topSellers.map((s, i) => (
              <div
                key={i}
                className="px-3 py-1.5 flex items-center justify-between hover:bg-surface-50 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 font-mono w-7">
                    {s.brokerCode}
                  </span>
                  {s.isForeign && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Foreign
                    </span>
                  )}
                  <span className="text-slate-400 truncate max-w-[120px]">
                    {s.brokerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-400 font-mono">
                    {formatNumber(s.volumeLots)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    avg {formatNumber(s.avgPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

