"use client";

import React from "react";
import { BidAskDepth } from "@/types/stock";
import { formatNumber } from "@/lib/utils";
import { Layers, ShieldCheck, AlertCircle } from "lucide-react";

interface BidAskDepthCardProps {
  depth: BidAskDepth;
  lastPrice: number;
}

export const BidAskDepthCard: React.FC<BidAskDepthCardProps> = ({ depth, lastPrice }) => {
  const maxBidVol = Math.max(...depth.bids.map((b) => b.volumeLots), 1);
  const maxAskVol = Math.max(...depth.asks.map((a) => a.volumeLots), 1);
  const maxVolume = Math.max(maxBidVol, maxAskVol);

  const isBullishStack = depth.bidAskRatio >= 1.25;

  return (
    <div className="bg-surface-100 rounded-lg border border-border p-4 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Pre-Closing Orderbook Stack (15:50 WIB Depth)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Bid/Ask Ratio:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              isBullishStack
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : depth.bidAskRatio < 0.85
                ? "bg-rose-950 text-rose-300 border border-rose-800"
                : "bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {depth.bidAskRatio.toFixed(2)}x ({depth.preClosingPressure.replace("_", " ")})
          </span>
        </div>
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-center">
        <div className="bg-emerald-950/30 border border-emerald-500/20 p-2 rounded">
          <span className="text-emerald-400 text-[11px]">Total Bid Queue (Support)</span>
          <div className="text-sm font-bold text-emerald-300 mt-0.5">
            {formatNumber(depth.totalBidLots)} lots
          </div>
        </div>
        <div className="bg-rose-950/30 border border-rose-500/20 p-2 rounded">
          <span className="text-rose-400 text-[11px]">Total Ask Wall (Resistance)</span>
          <div className="text-sm font-bold text-rose-300 mt-0.5">
            {formatNumber(depth.totalAskLots)} lots
          </div>
        </div>
      </div>

      {/* 10-Level Bid-Ask Table */}
      <div className="border border-border rounded-md overflow-hidden">
        <div className="grid grid-cols-2 bg-surface-200 text-slate-400 font-semibold text-[10px] uppercase py-1 px-2 border-b border-border">
          <div className="grid grid-cols-3">
            <span>Orders</span>
            <span className="text-right">Bid Vol</span>
            <span className="text-right pr-2">Bid Price</span>
          </div>
          <div className="grid grid-cols-3">
            <span className="pl-2">Ask Price</span>
            <span>Ask Vol</span>
            <span className="text-right">Orders</span>
          </div>
        </div>

        <div className="divide-y divide-border/40">
          {depth.bids.slice(0, 10).map((bid, i) => {
            const ask = depth.asks[i];
            const bidBarWidth = (bid.volumeLots / maxVolume) * 100;
            const askBarWidth = ask ? (ask.volumeLots / maxVolume) * 100 : 0;

            return (
              <div key={i} className="grid grid-cols-2 text-[11px] py-1 px-2 hover:bg-surface-50">
                {/* Bid side */}
                <div className="grid grid-cols-3 relative items-center">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none"
                    style={{ width: `${bidBarWidth}%` }}
                  />
                  <span className="text-slate-400 text-[10px] z-10">{bid.orderCount}</span>
                  <span className="text-right font-bold text-slate-200 z-10">
                    {formatNumber(bid.volumeLots)}
                  </span>
                  <span className="text-right font-bold text-emerald-400 pr-2 z-10">
                    {formatNumber(bid.price)}
                  </span>
                </div>

                {/* Ask side */}
                <div className="grid grid-cols-3 relative items-center">
                  {ask && (
                    <>
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none"
                        style={{ width: `${askBarWidth}%` }}
                      />
                      <span className="pl-2 font-bold text-rose-400 z-10">
                        {formatNumber(ask.price)}
                      </span>
                      <span className="font-bold text-slate-200 z-10">
                        {formatNumber(ask.volumeLots)}
                      </span>
                      <span className="text-right text-slate-400 text-[10px] z-10">
                        {ask.orderCount}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

