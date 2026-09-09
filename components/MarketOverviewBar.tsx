"use client";

import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, Users } from "lucide-react";
import { MarketOverview } from "@/types/market";
import { formatIdr } from "@/lib/utils";

interface MarketOverviewBarProps {
  overview: MarketOverview | null;
}

export const MarketOverviewBar: React.FC<MarketOverviewBarProps> = ({ overview }) => {
  if (!overview) {
    return (
      <div className="bg-surface-200 border-b border-border py-2 px-4 animate-pulse text-xs text-slate-500 font-mono">
        Connecting to IDX Market Feeds...
      </div>
    );
  }

  const isIhsgUp = overview.ihsgChange >= 0;
  const isForeignNetBuy = overview.netForeignFlowIdr >= 0;

  return (
    <div className="bg-surface-200/80 border-b border-border px-4 py-2 font-mono text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 items-center">
        {/* 1. IHSG Index */}
        <div className="flex items-center gap-2.5">
          <div className="text-slate-400 font-sans text-[11px] uppercase tracking-wider">IHSG</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-slate-100 text-sm">
              {overview.ihsgPrice.toFixed(2)}
            </span>
            <span
              className={`flex items-center text-[11px] font-semibold ${
                isIhsgUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isIhsgUp ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
              {isIhsgUp ? "+" : ""}{overview.ihsgChange.toFixed(2)} ({isIhsgUp ? "+" : ""}{overview.ihsgChangePct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* 2. Foreign Flow */}
        <div className="flex items-center gap-2.5">
          <div className="text-slate-400 font-sans text-[11px] uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-cyan-400" />
            Net Foreign
          </div>
          <div className="font-semibold">
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                isForeignNetBuy
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}
            >
              {isForeignNetBuy ? "+" : ""}{formatIdr(overview.netForeignFlowIdr)}
            </span>
          </div>
        </div>

        {/* 3. Market Turnover */}
        <div className="flex items-center gap-2.5">
          <div className="text-slate-400 font-sans text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-400" />
            Turnover
          </div>
          <div className="font-bold text-slate-200">
            {formatIdr(overview.totalMarketTurnoverIdr)}
          </div>
        </div>

        {/* 4. Advancers / Decliners */}
        <div className="flex items-center gap-2.5">
          <div className="text-slate-400 font-sans text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            Market Breadth
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
            <span className="text-emerald-400 bg-emerald-950/50 px-1 py-0.5 rounded border border-emerald-800">
              ▲ {overview.advancersCount}
            </span>
            <span className="text-rose-400 bg-rose-950/50 px-1 py-0.5 rounded border border-rose-800">
              ▼ {overview.declinersCount}
            </span>
            <span className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
              ● {overview.unchangedCount}
            </span>
          </div>
        </div>

        {/* 5. BSJP Opportunity Status */}
        <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
          {overview.isBsjpWindow ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-[11px] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              BSJP PRIME WINDOW ACTIVE
            </div>
          ) : (
            <div className="text-slate-400 text-[11px]">
              Closing in <span className="text-slate-200 font-bold">{overview.minutesToClose} min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

