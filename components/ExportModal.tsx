"use client";

import React, { useState } from "react";
import { BsjpCandidate } from "@/types/screening";
import { X, Copy, Check, Download, Share2 } from "lucide-react";

interface ExportModalProps {
  candidates: BsjpCandidate[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  candidates,
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<"stockbit" | "mirae" | "mandiri">("stockbit");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tickers = candidates.map((c) => c.stock.ticker);

  let exportText = "";
  let filename = `BSJP_Candidates_${new Date().toISOString().split("T")[0]}`;

  if (format === "stockbit") {
    exportText = tickers.join(", ");
    filename += "_Stockbit.txt";
  } else if (format === "mirae") {
    exportText = ["Code,Market", ...tickers.map((t) => `${t},RG`)].join("\r\n");
    filename += "_Mirae_HOTS.csv";
  } else if (format === "mandiri") {
    exportText = ["StockCode;Board", ...tickers.map((t) => `${t};RG`)].join("\r\n");
    filename += "_Mandiri_MOST.csv";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-100 border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-border bg-surface-200/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Export Watchlist to Broker Platform
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
        <div className="p-5 space-y-4 font-mono text-xs">
          {/* Format selection */}
          <div>
            <label className="block text-slate-400 mb-2 font-sans text-xs">
              Select Broker Target Format:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat("stockbit")}
                className={`py-2 px-3 rounded border text-center transition ${
                  format === "stockbit"
                    ? "bg-blue-600 text-white border-blue-500 font-bold"
                    : "bg-surface-200 text-slate-300 border-border hover:bg-surface-50"
                }`}
              >
                Stockbit
              </button>
              <button
                onClick={() => setFormat("mirae")}
                className={`py-2 px-3 rounded border text-center transition ${
                  format === "mirae"
                    ? "bg-blue-600 text-white border-blue-500 font-bold"
                    : "bg-surface-200 text-slate-300 border-border hover:bg-surface-50"
                }`}
              >
                Mirae (HOTS)
              </button>
              <button
                onClick={() => setFormat("mandiri")}
                className={`py-2 px-3 rounded border text-center transition ${
                  format === "mandiri"
                    ? "bg-blue-600 text-white border-blue-500 font-bold"
                    : "bg-surface-200 text-slate-300 border-border hover:bg-surface-50"
                }`}
              >
                Mandiri (MOST)
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
              <span>Preview ({tickers.length} tickers):</span>
              <span>{filename}</span>
            </div>
            <textarea
              readOnly
              rows={6}
              value={exportText}
              className="w-full bg-[#0c0e14] border border-border rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-hidden resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-lg shadow-blue-500/20"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Tickers"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-surface-200 hover:bg-surface-50 text-slate-200 border border-border font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

