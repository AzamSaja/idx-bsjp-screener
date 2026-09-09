"use client";

import React from "react";
import { BsjpCandidate } from "@/types/screening";
import { formatNumber } from "@/lib/utils";
import { 
  Target, 
  ShieldX, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Percent,
  Sliders
} from "lucide-react";

interface TradePlanCardProps {
  candidate: BsjpCandidate;
}

export const TradePlanCard: React.FC<TradePlanCardProps> = ({ candidate }) => {
  const { tradePlan, scoreBreakdown, bsjpScore, passedFilters, failedRules } = candidate;

  return (
    <div className="bg-surface-100 rounded-lg border border-border p-4 font-mono">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Algorithmic Trade Plan (BSJP Strategy)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Risk-to-Reward:</span>
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold text-xs">
            1 : {tradePlan.riskRewardRatio}
          </span>
        </div>
      </div>

      {/* Grid of Execution Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Entry Price */}
        <div className="bg-surface-200/90 p-3 rounded-lg border border-border">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1 font-sans">
            <Clock className="w-3 h-3 text-blue-400" />
            Rec. Entry (Auction)
          </div>
          <div className="text-base font-bold text-slate-100">
            Rp {formatNumber(tradePlan.entryPrice)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Pre-Closing 15:50–16:15
          </div>
        </div>

        {/* Take Profit 1 */}
        <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/30">
          <div className="text-[11px] text-emerald-400 mb-1 flex items-center gap-1 font-sans">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            Target Profit 1 (TP1)
          </div>
          <div className="text-base font-bold text-emerald-300">
            Rp {formatNumber(tradePlan.targetProfit1)}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold mt-1">
            +{tradePlan.targetProfit1Pct}% (09:00 WIB Open)
          </div>
        </div>

        {/* Take Profit 2 */}
        <div className="bg-teal-950/20 p-3 rounded-lg border border-teal-500/30">
          <div className="text-[11px] text-teal-400 mb-1 flex items-center gap-1 font-sans">
            <TrendingUp className="w-3 h-3 text-teal-400" />
            Target Profit 2 (TP2)
          </div>
          <div className="text-base font-bold text-teal-300">
            Rp {formatNumber(tradePlan.targetProfit2)}
          </div>
          <div className="text-[10px] text-teal-400 font-bold mt-1">
            +{tradePlan.targetProfit2Pct}% (Morning Surge)
          </div>
        </div>

        {/* Strict Stop-Loss */}
        <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-500/30">
          <div className="text-[11px] text-rose-400 mb-1 flex items-center gap-1 font-sans">
            <ShieldX className="w-3 h-3 text-rose-400" />
            Strict Cut-Loss (SL)
          </div>
          <div className="text-base font-bold text-rose-300">
            Rp {formatNumber(tradePlan.stopLoss)}
          </div>
          <div className="text-[10px] text-rose-400 font-bold mt-1">
            {tradePlan.stopLossPct}% (Trailing Exit)
          </div>
        </div>
      </div>

      {/* Execution Schedule banner */}
      <div className="bg-surface-50 border border-border p-2.5 rounded-md mb-4 flex items-center justify-between text-xs text-slate-300">
        <span className="text-slate-400">Execution Timeline:</span>
        <span className="font-semibold text-amber-300">
          {tradePlan.executionWindow}
        </span>
      </div>

      {/* BSJP Score Breakdown Section */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200 font-sans flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            Composite BSJP Score Breakdown: {bsjpScore}/100
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
            passedFilters 
              ? "bg-emerald-950 text-emerald-300 border border-emerald-800" 
              : "bg-amber-950 text-amber-300 border border-amber-800"
          }`}>
            {passedFilters ? "Passed All Strict Filters" : `${failedRules.length} Filter Criteria Not Met`}
          </span>
        </div>

        <div className="space-y-2">
          {/* 1. Volume Surge */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Volume vs 20-ADV Surge ({candidate.stock.volumeAdvRatio.toFixed(2)}x)</span>
              <span className="text-slate-200 font-bold">{scoreBreakdown.volumeScore}/25 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(scoreBreakdown.volumeScore / 25) * 100}%` }} />
            </div>
          </div>

          {/* 2. Price Action & High Proximity */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Price Structure & Day High Proximity ({candidate.proximityToHighPct.toFixed(0)}%)</span>
              <span className="text-slate-200 font-bold">{scoreBreakdown.priceActionScore}/20 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(scoreBreakdown.priceActionScore / 20) * 100}%` }} />
            </div>
          </div>

          {/* 3. Bandar Accumulation & Foreign Flow */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Bandar Volume & Foreign Inflow (CR3: {candidate.brokerSummary.top3ConcentrationRatio}x)</span>
              <span className="text-slate-200 font-bold">{scoreBreakdown.bandarScore}/25 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(scoreBreakdown.bandarScore / 25) * 100}%` }} />
            </div>
          </div>

          {/* 4. Orderbook Depth */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Orderbook Bid Stack vs Ask Wall ({candidate.bidAskDepth.bidAskRatio.toFixed(2)}x)</span>
              <span className="text-slate-200 font-bold">{scoreBreakdown.orderbookScore}/15 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(scoreBreakdown.orderbookScore / 15) * 100}%` }} />
            </div>
          </div>

          {/* 5. Trend Alignment & Turnover Size */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Trend Alignment (EMA 20/50) & Value Scale</span>
              <span className="text-slate-200 font-bold">{scoreBreakdown.trendLiquidityScore}/15 pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(scoreBreakdown.trendLiquidityScore / 15) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Failed rules list if any */}
        {failedRules.length > 0 && (
          <div className="mt-3 p-2 rounded bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300">
            <div className="font-bold flex items-center gap-1 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Strict BSJP Rule Warnings:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {failedRules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

