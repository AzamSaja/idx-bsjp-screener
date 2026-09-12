"use client";

import React from "react";
import { FilterPresetKey } from "@/types/screening";
import { ShieldCheck, Zap, TrendingUp, Layers, ListFilter, Sparkles } from "lucide-react";

interface FilterPresetsProps {
  currentPreset: FilterPresetKey;
  onSelectPreset: (preset: FilterPresetKey) => void;
  stats?: {
    totalScreened: number;
    matchingPreset: number;
    passedStrictBsjp: number;
    strongBuyCount: number;
    aiConfirmedCount?: number;
  };
}

export const FilterPresets: React.FC<FilterPresetsProps> = ({
  currentPreset,
  onSelectPreset,
  stats,
}) => {
  const presets: {
    key: FilterPresetKey;
    label: string;
    description: string;
    icon: React.ReactNode;
    badgeCount?: number;
  }[] = [
    {
      key: "STRICT_BSJP",
      label: "Strict BSJP Rules",
      description: "Passed all 8 deterministic liquidity, price, and risk criteria",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      badgeCount: stats?.passedStrictBsjp,
    },
    {
      key: "AI_CONFIRMED",
      label: "TimesFM AI Confirmed",
      description: "Google TimesFM 3.0 foundation model projects positive overnight momentum",
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
      badgeCount: stats?.aiConfirmedCount,
    },
    {
      key: "TOP_ACCUMULATION",
      label: "Top Accumulation",
      description: "Heavy Top-3 broker loading (CR3 > 1.4x) or big foreign buy",
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      key: "BREAKOUT_52W",
      label: "Breakout 52W High",
      description: "Testing or breaking 52-week peak with closing momentum",
      icon: <TrendingUp className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      key: "HIGH_LIQUIDITY",
      label: "High Liquidity (>10B)",
      description: "Daily turnover > IDR 10 Billion for institutional size",
      icon: <Layers className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      key: "ALL",
      label: "All Screened",
      description: "Full market candidate list ranked by BSJP score",
      icon: <ListFilter className="w-3.5 h-3.5 text-slate-400" />,
      badgeCount: stats?.totalScreened,
    },
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 bg-surface-100 border-b border-border">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
          Radar Presets:
        </span>
        {presets.map((p) => {
          const isActive = currentPreset === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onSelectPreset(p.key)}
              title={p.description}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-semibold"
                  : "bg-surface-50 text-slate-300 hover:bg-surface-200 hover:text-white border border-border"
              }`}
            >
              {p.icon}
              <span>{p.label}</span>
              {p.badgeCount !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-blue-800 text-blue-100"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {p.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {stats && (
        <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
          <span>
            Showing <strong className="text-slate-200">{stats.matchingPreset}</strong> candidates
          </span>
          {stats.strongBuyCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
              ★ {stats.strongBuyCount} STRONG BUY
            </span>
          )}
        </div>
      )}
    </div>
  );
};

