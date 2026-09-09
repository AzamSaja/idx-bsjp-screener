"use client";

import React from "react";
import { BsjpFilterParams } from "@/types/screening";
import { DEFAULT_BSJP_PARAMS } from "@/lib/screening/defaultParams";
import { X, SlidersHorizontal, RotateCcw, Check } from "lucide-react";

interface SettingsModalProps {
  params: BsjpFilterParams;
  onChangeParams: (newParams: BsjpFilterParams) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  params,
  onChangeParams,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onChangeParams(DEFAULT_BSJP_PARAMS);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-100 border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-border bg-surface-200/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">
              BSJP Quantitative Screening Parameters
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-50 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono text-xs max-h-[75vh] overflow-y-auto">
          {/* Min Turnover */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Minimum Turnover (IDR):</span>
              <strong className="text-blue-400">Rp {(params.minValueIdr / 1e9).toFixed(1)} Billion</strong>
            </div>
            <input
              type="range"
              min={1_000_000_000}
              max={25_000_000_000}
              step={1_000_000_000}
              value={params.minValueIdr}
              onChange={(e) =>
                onChangeParams({ ...params, minValueIdr: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Min Volume vs 20-ADV */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Minimum Volume vs 20-ADV:</span>
              <strong className="text-blue-400">{params.minVolumeAdvRatio.toFixed(1)}x ADV</strong>
            </div>
            <input
              type="range"
              min={1.0}
              max={3.5}
              step={0.1}
              value={params.minVolumeAdvRatio}
              onChange={(e) =>
                onChangeParams({ ...params, minVolumeAdvRatio: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Price Range: Min Change */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Min Gain:</span>
                <strong className="text-emerald-400">+{params.minChangePct}%</strong>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={params.minChangePct}
                onChange={(e) =>
                  onChangeParams({ ...params, minChangePct: Number(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Max Gain (Avoid ARA):</span>
                <strong className="text-amber-400">+{params.maxChangePct}%</strong>
              </div>
              <input
                type="range"
                min={10}
                max={25}
                step={1}
                value={params.maxChangePct}
                onChange={(e) =>
                  onChangeParams({ ...params, maxChangePct: Number(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Day High Distance */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Max Distance from High:</span>
              <strong className="text-blue-400">{(params.maxHighDistancePct * 100).toFixed(0)}% Range</strong>
            </div>
            <input
              type="range"
              min={0.10}
              max={0.40}
              step={0.05}
              value={params.maxHighDistancePct}
              onChange={(e) =>
                onChangeParams({ ...params, maxHighDistancePct: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Checkbox filters */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={params.excludeNotasiKhusus}
                onChange={(e) =>
                  onChangeParams({ ...params, excludeNotasiKhusus: e.target.checked })
                }
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span>Exclude Special Notation (Notasi Khusus)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={params.excludeFCA}
                onChange={(e) =>
                  onChangeParams({ ...params, excludeFCA: e.target.checked })
                }
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span>Exclude Watchlist Board / Full Call Auction (FCA)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={params.requireTrendAlignment}
                onChange={(e) =>
                  onChangeParams({ ...params, requireTrendAlignment: e.target.checked })
                }
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span>Require Bullish Trend Alignment (Close &gt; EMA20 &amp; EMA50)</span>
            </label>
          </div>

          {/* Reset & Apply */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-surface-200 hover:bg-surface-50 text-slate-300 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Parameters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

