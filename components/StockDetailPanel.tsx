"use client";

import React, { useState, useEffect } from "react";
import { BsjpCandidate } from "@/types/screening";
import { OHLCVBar } from "@/types/stock";
import { CandlestickChart } from "./CandlestickChart";
import { TradePlanCard } from "./TradePlanCard";
import { BrokerSummaryBar } from "./BrokerSummaryBar";
import { BidAskDepthCard } from "./BidAskDepthCard";
import { formatIdr, formatNumber } from "@/lib/utils";
import { 
  X, 
  CandlestickChart as ChartIcon, 
  Target, 
  Building2, 
  Layers, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface StockDetailPanelProps {
  candidate: BsjpCandidate | null;
  onClose: () => void;
  onSelectNext?: () => void;
  onSelectPrev?: () => void;
}

export const StockDetailPanel: React.FC<StockDetailPanelProps> = ({
  candidate,
  onClose,
  onSelectNext,
  onSelectPrev,
}) => {
  const [activeTab, setActiveTab] = useState<"chart" | "plan" | "broker" | "orderbook">("chart");
  const [timeframe, setTimeframe] = useState<"15m" | "1d">("1d");
  const [chartsData, setChartsData] = useState<{ daily: OHLCVBar[]; intraday15m: OHLCVBar[] } | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  useEffect(() => {
    if (!candidate) return;

    let isMounted = true;
    setIsLoadingChart(true);

    const ticker = candidate.stock.ticker;
    const lastPrice = candidate.stock.lastPrice;

    fetch(`/api/stocks/${ticker}?lastPrice=${lastPrice}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data?.charts) {
          setChartsData(data.data.charts);
        }
      })
      .catch((err) => console.error("Error fetching stock charts:", err))
      .finally(() => {
        if (isMounted) setIsLoadingChart(false);
      });

    return () => {
      isMounted = false;
    };
  }, [candidate?.stock?.ticker, candidate?.stock?.lastPrice]);

  const currentBars =
    timeframe === "15m"
      ? (chartsData?.intraday15m || [])
      : (chartsData?.daily || []);

  if (!candidate) return null;

  const { stock, brokerSummary, bidAskDepth } = candidate;
  const isUp = stock.changePct >= 0;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-surface-100 border-l border-border shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-border bg-surface-200/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-mono text-white tracking-wide">
                {stock.ticker}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-surface-50 text-slate-300 border border-border">
                {stock.sector || "IDX Equity"}
              </span>
              {stock.isFCA && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  FCA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md font-sans">
              {stock.companyName}
            </p>
          </div>
        </div>

        {/* Price & Change */}
        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <div className="text-lg font-bold text-white">
              Rp {formatNumber(stock.lastPrice)}
            </div>
            <div className={`text-xs font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? "+" : ""}{stock.changePct.toFixed(2)}% ({isUp ? "+" : ""}{stock.change})
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-border pl-3">
            {onSelectPrev && (
              <button
                onClick={onSelectPrev}
                className="p-1.5 rounded hover:bg-surface-50 text-slate-400 hover:text-white"
                title="Previous candidate"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {onSelectNext && (
              <button
                onClick={onSelectNext}
                className="p-1.5 rounded hover:bg-surface-50 text-slate-400 hover:text-white"
                title="Next candidate"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2 bg-surface-300 border-b border-border text-[11px] font-mono text-slate-400">
        <div>
          <span>Day Range: </span>
          <strong className="text-slate-200">
            {formatNumber(stock.low)} - {formatNumber(stock.high)}
          </strong>
        </div>
        <div>
          <span>Turnover: </span>
          <strong className="text-slate-200">{formatIdr(stock.valueIdr)}</strong>
        </div>
        <div>
          <span>Volume Ratio: </span>
          <strong className="text-blue-400">{stock.volumeAdvRatio.toFixed(2)}x ADV</strong>
        </div>
        <div>
          <span>52W High: </span>
          <strong className="text-slate-200">Rp {formatNumber(stock.high52w)}</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border bg-surface-100 px-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("chart")}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
            activeTab === "chart"
              ? "border-blue-500 text-blue-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ChartIcon className="w-3.5 h-3.5" />
          Candlestick & EMA Overlay
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
            activeTab === "plan"
              ? "border-blue-500 text-blue-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          BSJP Trade Plan & Score
        </button>

        <button
          onClick={() => setActiveTab("broker")}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
            activeTab === "broker"
              ? "border-blue-500 text-blue-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Bandarmology Flow
        </button>

        <button
          onClick={() => setActiveTab("orderbook")}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition ${
            activeTab === "orderbook"
              ? "border-blue-500 text-blue-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Orderbook Depth
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "chart" && (
          <div className="space-y-4">
            <CandlestickChart
              ticker={stock.ticker}
              bars={currentBars}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              isLoading={isLoadingChart}
            />

            {/* Quick Trade Plan inline below chart for convenience */}
            <TradePlanCard candidate={candidate} />
          </div>
        )}

        {activeTab === "plan" && (
          <div className="space-y-4">
            <TradePlanCard candidate={candidate} />
            <BrokerSummaryBar summary={brokerSummary} />
          </div>
        )}

        {activeTab === "broker" && (
          <div className="space-y-4">
            <BrokerSummaryBar summary={brokerSummary} />
            <TradePlanCard candidate={candidate} />
          </div>
        )}

        {activeTab === "orderbook" && (
          <div className="space-y-4">
            <BidAskDepthCard depth={bidAskDepth} lastPrice={stock.lastPrice} />
            <TradePlanCard candidate={candidate} />
          </div>
        )}
      </div>

      {/* Footer info link */}
      <div className="px-4 py-2.5 bg-surface-200/60 border-t border-border flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>BSJP Strategy • Late Session Entry (15:50) & Morning Open Exit (09:00)</span>
        <a
          href={`https://stockbit.com/symbol/${stock.ticker}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
        >
          View on Stockbit <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

