"use client";

import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Clock, 
  Share2, 
  Bell, 
  RefreshCw, 
  Flame, 
  SlidersHorizontal 
} from "lucide-react";
import { MarketOverview } from "@/types/market";

interface HeaderProps {
  overview: MarketOverview | null;
  onRefresh: () => void;
  onOpenExport: () => void;
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  overview,
  onRefresh,
  onOpenExport,
  onOpenAlerts,
  onOpenSettings,
  isRefreshing,
}) => {
  const [timeStr, setTimeStr] = useState<string>("--:--:-- WIB");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wib = new Date(utc + 7 * 3600000);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      setTimeStr(`${pad(wib.getHours())}:${pad(wib.getMinutes())}:${pad(wib.getSeconds())} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isBsjpActive = overview?.isBsjpWindow;

  return (
    <header className="border-b border-border bg-surface-100/90 backdrop-blur sticky top-0 z-30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Brand & Market Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
          <Flame className="w-5 h-5 text-blue-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              IDX BSJP <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">QUANT RADAR</span>
            </h1>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (Beli Sore, Jual Pagi Engine)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            IDX / Bursa Efek Indonesia • Late Session 15:50–16:15 WIB Window
          </p>
        </div>
      </div>

      {/* Center Live Session & Clock */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
          isBsjpActive 
            ? "bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse-subtle" 
            : "bg-slate-800/60 border-slate-700 text-slate-300"
        }`}>
          <Radio className={`w-3.5 h-3.5 ${isBsjpActive ? "text-amber-400 animate-pulse" : "text-slate-400"}`} />
          <span className="font-semibold">{overview?.phaseLabel || "Loading Market Phase..."}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          title="Export watchlist for Stockbit / Broker"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onOpenAlerts}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          title="Setup 15:45 WIB Webhook Alert"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Alerts</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          title="Adjust screening parameters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Params</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center p-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
};

