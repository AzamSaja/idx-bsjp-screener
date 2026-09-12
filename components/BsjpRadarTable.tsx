"use client";

import React, { useState } from "react";
import { BsjpCandidate } from "@/types/screening";
import { formatIdr, formatNumber } from "@/lib/utils";
import { 
  ArrowUpDown, 
  ChevronRight, 
  ShieldAlert, 
  Zap, 
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Sparkles
} from "lucide-react";

interface BsjpRadarTableProps {
  candidates: BsjpCandidate[];
  selectedTicker: string | null;
  onSelectCandidate: (candidate: BsjpCandidate) => void;
  isLoading: boolean;
}

type SortField = "score" | "ticker" | "lastPrice" | "changePct" | "volumeRatio" | "valueIdr" | "proximity";

export const BsjpRadarTable: React.FC<BsjpRadarTableProps> = ({
  candidates,
  selectedTicker,
  onSelectCandidate,
  isLoading,
}) => {
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc for financial rankings
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    switch (sortField) {
      case "score":
        valA = a.bsjpScore;
        valB = b.bsjpScore;
        break;
      case "ticker":
        return sortAsc ? a.stock.ticker.localeCompare(b.stock.ticker) : b.stock.ticker.localeCompare(a.stock.ticker);
      case "lastPrice":
        valA = a.stock.lastPrice;
        valB = b.stock.lastPrice;
        break;
      case "changePct":
        valA = a.stock.changePct;
        valB = b.stock.changePct;
        break;
      case "volumeRatio":
        valA = a.stock.volumeAdvRatio;
        valB = b.stock.volumeAdvRatio;
        break;
      case "valueIdr":
        valA = a.stock.valueIdr;
        valB = b.stock.valueIdr;
        break;
      case "proximity":
        valA = a.proximityToHighPct;
        valB = b.proximityToHighPct;
        break;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  const filteredCandidates = sortedCandidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.stock.ticker.toLowerCase().includes(q) ||
      c.stock.companyName.toLowerCase().includes(q) ||
      (c.stock.sector && c.stock.sector.toLowerCase().includes(q))
    );
  });

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case "STRONG_BUY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            STRONG BUY
          </span>
        );
      case "BUY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-semibold">
            BUY
          </span>
        );
      case "OVEREXTENDED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            ARA / EXTENDED
          </span>
        );
      case "WATCH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
            WATCH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900 text-[11px]">
            AVOID
          </span>
        );
    }
  };

  const getAccumulationBadge = (status: string, cr3: number) => {
    if (status === "BIG_ACCUMULATION") {
      return (
        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Big Accum ({cr3.toFixed(1)}x)
        </span>
      );
    }
    if (status === "NORMAL_ACCUMULATION") {
      return (
        <span className="text-teal-400 text-[11px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          Accum ({cr3.toFixed(1)}x)
        </span>
      );
    }
    if (status.includes("DISTRIBUTION")) {
      return (
        <span className="text-rose-400 text-[11px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Distr ({cr3.toFixed(1)}x)
        </span>
      );
    }
    return <span className="text-slate-400 text-[11px]">Neutral ({cr3.toFixed(1)}x)</span>;
  };

  return (
    <div className="w-full flex flex-col">
      {/* Search and Table Metrics Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-200/50 border-b border-border">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode saham, nama, atau sektor (contoh: AADI, AMMN, Energi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-100 border border-border rounded-md pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full font-mono transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-200 font-bold px-1"
                title="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>
            Menampilkan <strong className="text-emerald-400 font-semibold">{filteredCandidates.length}</strong> dari {candidates.length} kandidat
          </span>
          {searchQuery && (
            <span className="text-[11px] text-blue-400">
              (difilter: &ldquo;{searchQuery}&rdquo;)
            </span>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-surface-200/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-border select-none">
              <th className="py-2.5 px-3 font-semibold">Rank</th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("ticker")}
              >
                <div className="flex items-center gap-1">
                  Ticker <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("lastPrice")}
              >
                <div className="flex items-center justify-end gap-1">
                  Last Price <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("changePct")}
              >
                <div className="flex items-center justify-end gap-1">
                  Change (%) <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("volumeRatio")}
              >
                <div className="flex items-center justify-end gap-1">
                  Vol vs 20-ADV <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("valueIdr")}
              >
                <div className="flex items-center justify-end gap-1">
                  Turnover (IDR) <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("proximity")}
              >
                <div className="flex items-center justify-end gap-1">
                  Prox to High <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Broker Net Flow</th>
              <th className="py-2.5 px-3 font-semibold">BSJP Plan</th>
              <th className="py-2.5 px-3 font-semibold">Signal</th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center justify-end gap-1">
                  BSJP Score <ArrowUpDown className="w-3 h-3 text-blue-400" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500 font-sans text-sm">
                  <div className="inline-block animate-spin mr-2">⟳</div> Ingesting IDX late-session market data...
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500 font-sans text-sm">
                  No candidates matched the current screening criteria.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate, idx) => {
                const isSelected = selectedTicker === candidate.stock.ticker;
                const isUp = candidate.stock.changePct >= 0;
                const isStrictPass = candidate.passedFilters;

                return (
                  <tr
                    key={candidate.stock.ticker}
                    onClick={() => onSelectCandidate(candidate)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-600/15 border-l-4 border-l-blue-500"
                        : "hover:bg-surface-50/70"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-slate-400 font-bold">
                      #{idx + 1}
                    </td>

                    {/* Ticker & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-bold text-sm text-slate-100 font-mono tracking-wide">
                          {candidate.stock.ticker}
                        </span>
                        {candidate.briefingMeta?.stealthAccumulation && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold flex items-center gap-0.5 shadow-sm"
                            title={`Stealth Institutional Accumulation (Smart Money Delta: ${candidate.briefingMeta.smartMoneyDelta || 'High'})`}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                            STEALTH
                          </span>
                        )}
                        {candidate.stock.isFCA && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold" title="Watchlist Board (FCA)">
                            FCA
                          </span>
                        )}
                        {candidate.stock.notasiKhusus.length > 0 && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold" title={`Special Notation: ${candidate.stock.notasiKhusus.join(",")}`}>
                            {candidate.stock.notasiKhusus.join("")}
                          </span>
                        )}
                        {candidate.timesfmForecast && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5 shadow-sm ${
                              candidate.timesfmForecast.verdict === "CONFIRMED_BY_AI"
                                ? "bg-purple-950 text-purple-300 border border-purple-700/70"
                                : candidate.timesfmForecast.tPlus1ChangePct >= 0
                                ? "bg-blue-950 text-blue-300 border border-blue-800"
                                : "bg-surface-50 text-slate-400 border border-border"
                            }`}
                            title={`Google TimesFM 3.0 Foundation Forecast: ${candidate.timesfmForecast.tPlus1ChangePct >= 0 ? "+" : ""}${candidate.timesfmForecast.tPlus1ChangePct.toFixed(2)}% (${candidate.timesfmForecast.verdict})`}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                            AI {candidate.timesfmForecast.tPlus1ChangePct >= 0 ? "+" : ""}{candidate.timesfmForecast.tPlus1ChangePct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px] font-sans">
                        {candidate.stock.companyName}
                      </div>
                    </td>

                    {/* Last Price */}
                    <td className="py-3 px-3 text-right font-bold text-slate-100 text-sm">
                      {formatNumber(candidate.stock.lastPrice)}
                    </td>

                  {/* Change % */}
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block font-bold text-xs px-2 py-0.5 rounded ${
                        isUp
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {isUp ? "+" : ""}{candidate.stock.changePct.toFixed(2)}%
                    </span>
                  </td>

                  {/* Volume Ratio vs ADV */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={`font-bold ${
                          candidate.stock.volumeAdvRatio >= 1.5
                            ? "text-blue-400"
                            : "text-slate-400"
                        }`}
                      >
                        {candidate.stock.volumeAdvRatio.toFixed(2)}x
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatNumber(candidate.stock.volumeLots)} lots
                      </span>
                    </div>
                  </td>

                  {/* Value IDR */}
                  <td className="py-3 px-3 text-right">
                    <span className="font-semibold text-slate-200">
                      {formatIdr(candidate.stock.valueIdr)}
                    </span>
                  </td>

                  {/* Proximity to High */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-slate-200">
                        {candidate.proximityToHighPct.toFixed(0)}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            candidate.proximityToHighPct >= 75
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                          style={{ width: `${candidate.proximityToHighPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Broker Net Flow */}
                  <td className="py-3 px-3">
                    {getAccumulationBadge(
                      candidate.brokerSummary.accumulationStatus,
                      candidate.brokerSummary.top3ConcentrationRatio
                    )}
                    <div className="text-[10px] text-slate-400">
                      Foreign: {candidate.brokerSummary.foreignNetFlowIdr > 0 ? "+" : ""}{formatIdr(candidate.brokerSummary.foreignNetFlowIdr)}
                    </div>
                  </td>

                  {/* BSJP Plan Summary */}
                  <td className="py-3 px-3">
                    <div className="text-[11px] text-slate-300">
                      TP1: <strong className="text-emerald-400">{candidate.tradePlan.targetProfit1}</strong> (+{candidate.tradePlan.targetProfit1Pct}%)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      SL: <span className="text-rose-400">{candidate.tradePlan.stopLoss}</span> ({candidate.tradePlan.stopLossPct}%)
                    </div>
                  </td>

                  {/* Signal */}
                  <td className="py-3 px-3">
                    {getSignalBadge(candidate.signal)}
                  </td>

                  {/* BSJP Composite Score */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                          candidate.bsjpScore >= 75
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : candidate.bsjpScore >= 60
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {candidate.bsjpScore}
                      </span>
                    </div>
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-2 text-center text-slate-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 inline" />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

