"use client";

import React, { useState } from "react";
import { TimesFMForecast } from "@/types/forecast";
import { formatNumber } from "@/lib/utils";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  ShieldCheck,
  Brain,
  Layers,
  ArrowRight
} from "lucide-react";

interface TimesFmForecastCardProps {
  forecast: TimesFMForecast | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const TimesFmForecastCard: React.FC<TimesFmForecastCardProps> = ({
  forecast,
  isLoading = false,
  onRefresh,
}) => {
  const [showQuantilesDetail, setShowQuantilesDetail] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-surface-200 border border-border rounded-xl p-6 text-center space-y-3 animate-pulse">
        <div className="flex items-center justify-center gap-2 text-purple-400">
          <Brain className="w-6 h-6 animate-bounce" />
          <span className="font-semibold text-sm font-mono">Running Google TimesFM 3.0 Inference...</span>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Computing iterative CPM RevIN normalization and multi-quantile projections across 330M parameters...
        </p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="bg-surface-200 border border-border rounded-xl p-6 text-center space-y-3">
        <Brain className="w-8 h-8 text-slate-500 mx-auto" />
        <p className="text-sm text-slate-300 font-medium">No TimesFM forecast loaded for this stock.</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-lg shadow-purple-900/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate TimesFM 3.0 Forecast
          </button>
        )}
      </div>
    );
  }

  const {
    ticker,
    asOfDate,
    lastClose,
    tPlus1,
    points,
    bsjpAlignment,
    confidenceScore,
    model,
    source,
  } = forecast;

  const isT1Up = tPlus1.changePct > 0;
  const isT1Down = tPlus1.changePct < 0;

  return (
    <div className="bg-surface-200 border border-border rounded-xl overflow-hidden shadow-lg space-y-0">
      {/* Top Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-purple-950/40 via-surface-200 to-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                TimesFM 3.0 Foundation Forecast
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50 font-mono font-semibold">
                330M PyTorch
              </span>
              {source === "CACHE" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-50 text-slate-400 border border-border">
                  Instant Cached
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Base: Rp {formatNumber(lastClose)} ({asOfDate}) • Zero-Shot Multi-Quantile Prediction
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-border bg-surface-100 hover:bg-surface-50 text-slate-400 hover:text-purple-300 transition text-xs flex items-center gap-1"
            title="Re-run on-demand inference"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-purple-400" : ""}`} />
            <span className="hidden sm:inline text-[11px]">Re-run AI</span>
          </button>
        )}
      </div>

      {/* Main T+1 BSJP Morning Exit Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-150/40">
        {/* T+1 Morning Target */}
        <div className="p-3.5 rounded-lg bg-surface-100 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              T+1 Morning Exit Target
            </span>
            <span className="font-mono text-[10px] text-slate-500">{tPlus1.date}</span>
          </div>

          <div className="my-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                Rp {formatNumber(tPlus1.price)}
              </span>
              <span
                className={`text-sm font-bold font-mono flex items-center gap-0.5 ${
                  isT1Up
                    ? "text-emerald-400"
                    : isT1Down
                    ? "text-rose-400"
                    : "text-slate-400"
                }`}
              >
                {isT1Up ? "+" : ""}
                {tPlus1.changePct.toFixed(2)}%
                {isT1Up ? <TrendingUp className="w-3.5 h-3.5" /> : isT1Down ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              P50 expected exit for 09:00 WIB session
            </p>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Range (P10–P90):</span>
            <strong className="text-slate-200">
              Rp {formatNumber(tPlus1.p10)} – {formatNumber(tPlus1.p90)}
            </strong>
          </div>
        </div>

        {/* BSJP Strategy Alignment Verdict */}
        <div className="p-3.5 rounded-lg bg-surface-100 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">BSJP Strategy Alignment</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>

          <div className="my-1.5">
            {bsjpAlignment.verdict === "CONFIRMED_BY_AI" && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                AI CONFIRMED
              </div>
            )}
            {bsjpAlignment.verdict === "MODERATE_CONVERGENCE" && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/50 text-blue-300 font-bold text-xs tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                MODERATE CONVERGENCE
              </div>
            )}
            {bsjpAlignment.verdict === "DIVERGENCE_WARNING" && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold text-xs tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                DIVERGENCE WARNING
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
              {bsjpAlignment.commentary}
            </p>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Conviction Multiplier:</span>
            <strong className="text-purple-300">{bsjpAlignment.scoreMultiplier}x</strong>
          </div>
        </div>

        {/* Quantile Confidence */}
        <div className="p-3.5 rounded-lg bg-surface-100 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Confidence Score</span>
            <span className="font-mono text-xs font-bold text-purple-400">
              {confidenceScore}%
            </span>
          </div>

          <div className="my-1.5 space-y-2">
            <div className="w-full bg-surface-50 rounded-full h-2 overflow-hidden border border-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Tightly bound quantile envelope indicates high consensus in zero-shot projection.
            </p>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Forecast Horizon:</span>
            <strong className="text-slate-200">5 Trading Days</strong>
          </div>
        </div>
      </div>

      {/* 5-Day Multi-Horizon Step Table */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            5-Day Trajectory & Probabilistic Quantiles
          </h4>
          <button
            onClick={() => setShowQuantilesDetail(!showQuantilesDetail)}
            className="text-[11px] text-purple-400 hover:text-purple-300 underline font-mono"
          >
            {showQuantilesDetail ? "Hide Quantile Grid" : "Show P10/P50/P90 Table"}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {points.map((pt) => {
            const isUp = pt.changePct > 0;
            const isDown = pt.changePct < 0;
            return (
              <div
                key={pt.step}
                className="p-2.5 rounded-lg bg-surface-100 border border-border text-center font-mono hover:border-purple-500/50 transition"
              >
                <div className="text-[10px] text-slate-500 font-semibold mb-0.5">
                  Day {pt.step} ({pt.date.slice(5)})
                </div>
                <div className="text-xs font-bold text-white">
                  Rp {formatNumber(pt.price)}
                </div>
                <div
                  className={`text-[11px] font-bold ${
                    isUp ? "text-emerald-400" : isDown ? "text-rose-400" : "text-slate-400"
                  }`}
                >
                  {isUp ? "+" : ""}
                  {pt.changePct.toFixed(2)}%
                </div>
                {showQuantilesDetail && (
                  <div className="mt-1.5 pt-1.5 border-t border-border/60 text-[9px] text-slate-400 space-y-0.5">
                    <div>P90: {formatNumber(pt.p90)}</div>
                    <div>P10: {formatNumber(pt.p10)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Insight Box */}
      <div className="px-4 py-2.5 bg-surface-150/60 border-t border-border flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Model: {model} • Iterative CPM RevIN + Linear Detrending
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Generated: {new Date(forecast.generatedAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

