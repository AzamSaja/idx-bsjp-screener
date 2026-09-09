"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { MarketOverviewBar } from "@/components/MarketOverviewBar";
import { FilterPresets } from "@/components/FilterPresets";
import { BsjpRadarTable } from "@/components/BsjpRadarTable";
import { StockDetailPanel } from "@/components/StockDetailPanel";
import { ExportModal } from "@/components/ExportModal";
import { AlertWebhookModal } from "@/components/AlertWebhookModal";
import { SettingsModal } from "@/components/SettingsModal";
import { BsjpCandidate, FilterPresetKey, BsjpFilterParams } from "@/types/screening";
import { MarketOverview } from "@/types/market";
import { DEFAULT_BSJP_PARAMS } from "@/lib/screening/defaultParams";

export default function Home() {
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [candidates, setCandidates] = useState<BsjpCandidate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedPreset, setSelectedPreset] = useState<FilterPresetKey>("STRICT_BSJP");
  const [customParams, setCustomParams] = useState<BsjpFilterParams>(DEFAULT_BSJP_PARAMS);
  const [dataSource, setDataSource] = useState<"REAL" | "SIMULATION">("REAL");

  const [selectedCandidate, setSelectedCandidate] = useState<BsjpCandidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch Market Overview
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/market-overview?dataSource=${dataSource}`);
      const data = await res.json();
      if (data.success) {
        setOverview(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch market overview:", err);
    }
  }, [dataSource]);

  // Fetch Candidates
  const fetchCandidates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const queryParams = new URLSearchParams({
        dataSource,
        preset: selectedPreset,
        minValueIdr: customParams.minValueIdr.toString(),
        minVolumeAdvRatio: customParams.minVolumeAdvRatio.toString(),
        minChangePct: customParams.minChangePct.toString(),
        maxChangePct: customParams.maxChangePct.toString(),
        maxHighDistancePct: customParams.maxHighDistancePct.toString(),
        requireTrendAlignment: customParams.requireTrendAlignment.toString(),
        excludeNotasiKhusus: customParams.excludeNotasiKhusus.toString(),
        excludeFCA: customParams.excludeFCA.toString(),
        minTop3Ratio: customParams.minTop3Ratio.toString(),
        minBidAskRatio: customParams.minBidAskRatio.toString(),
      });

      const res = await fetch(`/api/screen?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCandidates(data.data.candidates || []);
        setStats(data.data.stats || null);

        // Keep selected candidate updated if still present
        if (selectedCandidate) {
          const updated = data.data.candidates.find(
            (c: BsjpCandidate) => c.stock.ticker === selectedCandidate.stock.ticker
          );
          if (updated) setSelectedCandidate(updated);
        }
      }
    } catch (err) {
      console.error("Failed to screen stocks:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dataSource, selectedPreset, customParams, selectedCandidate]);

  // Initial Load
  useEffect(() => {
    fetchOverview();
    fetchCandidates();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOverview();
      fetchCandidates();
    }, 30000);

    return () => clearInterval(interval);
  }, [dataSource, selectedPreset, customParams]);

  const handleManualRefresh = () => {
    fetchOverview();
    fetchCandidates();
  };

  // Navigate through candidates in detail panel
  const handleSelectNext = () => {
    if (!selectedCandidate || candidates.length === 0) return;
    const currentIndex = candidates.findIndex(
      (c) => c.stock.ticker === selectedCandidate.stock.ticker
    );
    if (currentIndex >= 0 && currentIndex < candidates.length - 1) {
      setSelectedCandidate(candidates[currentIndex + 1]);
    }
  };

  const handleSelectPrev = () => {
    if (!selectedCandidate || candidates.length === 0) return;
    const currentIndex = candidates.findIndex(
      (c) => c.stock.ticker === selectedCandidate.stock.ticker
    );
    if (currentIndex > 0) {
      setSelectedCandidate(candidates[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans">
      {/* 1. Header with Clock, Data Mode Switcher & Market Status */}
      <Header
        overview={overview}
        onRefresh={handleManualRefresh}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRefreshing={isRefreshing}
        dataSource={dataSource}
        onToggleDataSource={setDataSource}
      />

      {/* 2. Market Overview Bar */}
      <MarketOverviewBar overview={overview} />

      {/* 3. Preset Filter Tabs */}
      <FilterPresets
        currentPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
        stats={stats}
      />

      {/* 4. BSJP Radar Table */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto">
        <div className="bg-surface-100 rounded-xl border border-border overflow-hidden shadow-xl">
          <div className="p-3.5 border-b border-border bg-surface-200/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-200 font-mono tracking-wider uppercase">
                Algorithmic BSJP Candidates
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Click any stock row to open deep-dive charts &amp; orderbook stack
            </div>
          </div>

          <BsjpRadarTable
            candidates={candidates}
            selectedTicker={selectedCandidate?.stock.ticker || null}
            onSelectCandidate={setSelectedCandidate}
            isLoading={isLoading}
          />
        </div>

        {/* Footer info section */}
        <div className="mt-6 p-4 rounded-xl bg-surface-100/60 border border-border text-xs text-slate-400 space-y-2">
          <div className="font-bold text-slate-300 font-sans flex items-center gap-2">
            <span>ℹ️</span> About the BSJP (Beli Sore, Jual Pagi) Trading Framework:
          </div>
          <p className="leading-relaxed">
            The BSJP strategy exploits the structural imbalance of end-of-day order accumulation (15:50–16:15 WIB Pre-Closing &amp; Post-Closing auctions) to capture next-day morning opening momentum (09:00–09:30 WIB). Candidates must show verified institutional volume (&gt;1.5x 20-ADV, turnover &gt; Rp5B), strong closing price structure (upper 25% of day range), positive net broker concentration, and no special notation or FCA board restrictions.
          </p>
        </div>
      </main>

      {/* 5. Deep Dive Detail Side Drawer */}
      <StockDetailPanel
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onSelectNext={handleSelectNext}
        onSelectPrev={handleSelectPrev}
      />

      {/* 6. Export Modal */}
      <ExportModal
        candidates={candidates}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* 7. Alert Webhook Modal */}
      <AlertWebhookModal
        candidates={candidates}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      {/* 8. Screening Settings Modal */}
      <SettingsModal
        params={customParams}
        onChangeParams={setCustomParams}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

