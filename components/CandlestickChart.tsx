"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import { OHLCVBar } from "@/types/stock";
import { calculateEMA } from "@/lib/screening/indicators";

interface CandlestickChartProps {
  ticker: string;
  bars: OHLCVBar[];
  timeframe: "15m" | "1d";
  onTimeframeChange: (tf: "15m" | "1d") => void;
  isLoading?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  ticker,
  bars,
  timeframe,
  onTimeframeChange,
  isLoading,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || bars.length === 0) return;

    // Clear previous chart instance if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: "#0c0e14" },
        textColor: "#94a3b8",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.4)" },
        horzLines: { color: "rgba(30, 41, 59, 0.4)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Leaves bottom 25% for volume
        },
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: timeframe === "15m",
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    // Format bars for Lightweight Charts
    const formattedCandles = bars.map((b) => ({
      time: b.time as any,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));

    candleSeries.setData(formattedCandles);

    // 2. Volume Histogram Series (on separate bottom scale)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#38bdf8",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    const volumeData = bars.map((b) => ({
      time: b.time as any,
      value: b.volume,
      color: b.close >= b.open ? "rgba(16, 185, 129, 0.45)" : "rgba(239, 68, 68, 0.45)",
    }));

    volumeSeries.setData(volumeData);

    // 3. EMA 20 Overlay (Blue)
    const closePrices = bars.map((b) => b.close);
    const ema20Series = chart.addSeries(LineSeries, {
      color: "#38bdf8",
      lineWidth: 2,
      title: "EMA 20",
    });

    // Compute rolling EMA 20
    const ema20Data: { time: any; value: number }[] = [];
    for (let i = 0; i < bars.length; i++) {
      if (i >= 5) {
        const slice = closePrices.slice(0, i + 1);
        const emaVal = calculateEMA(slice, 20);
        ema20Data.push({ time: bars[i].time as any, value: Math.round(emaVal) });
      }
    }
    ema20Series.setData(ema20Data);

    // 4. EMA 50 Overlay (Amber)
    const ema50Series = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 1,
      title: "EMA 50",
    });

    const ema50Data: { time: any; value: number }[] = [];
    for (let i = 0; i < bars.length; i++) {
      if (i >= 10) {
        const slice = closePrices.slice(0, i + 1);
        const emaVal = calculateEMA(slice, 50);
        ema50Data.push({ time: bars[i].time as any, value: Math.round(emaVal) });
      }
    }
    ema50Series.setData(ema50Data);

    chart.timeScale().fitContent();

    // Resize observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [bars, timeframe]);

  return (
    <div className="w-full bg-[#0c0e14] rounded-lg border border-border overflow-hidden">
      {/* Chart Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100 font-mono">{ticker}</span>
            <span className="text-xs text-slate-400 font-mono">Candlestick & EMA Overlay</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block rounded" />
              EMA(20)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded" />
              EMA(50)
            </span>
          </div>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1 bg-surface-200 p-0.5 rounded border border-border text-xs font-mono">
          <button
            onClick={() => onTimeframeChange("15m")}
            className={`px-2 py-1 rounded transition ${
              timeframe === "15m"
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            15m
          </button>
          <button
            onClick={() => onTimeframeChange("1d")}
            className={`px-2 py-1 rounded transition ${
              timeframe === "1d"
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs text-slate-300 font-mono">
            Loading Chart Bars...
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-[380px]" />
      </div>
    </div>
  );
};

