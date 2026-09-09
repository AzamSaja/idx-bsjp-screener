import fs from "fs";
import path from "path";
import { StockQuote, BrokerSummary, BidAskDepth } from "@/types/stock";
import { MarketOverview } from "@/types/market";
import { BriefingMetadata } from "@/types/screening";

export interface IdxCompanyInfo {
  code: string;
  name: string;
  board?: string;
  sector?: string;
  isFCA?: boolean;
}

export interface RealStockSnapshotItem {
  quote: StockQuote;
  brokerSummary: BrokerSummary;
  bidAskDepth: BidAskDepth;
  briefingMeta?: BriefingMetadata;
}

let cachedCompanies: IdxCompanyInfo[] | null = null;
let cachedRealStocks: RealStockSnapshotItem[] | null = null;
let cachedRealOverview: MarketOverview | null = null;

/**
 * Checks if the real IDX dataset snapshot is available
 */
export function hasRealDataAvailable(): boolean {
  const snapshotPath = path.join(process.cwd(), "data", "realIdxSnapshot.json");
  return fs.existsSync(snapshotPath);
}

/**
 * Loads company master from allCompanies.json
 */
export function getIdxCompanyMaster(): IdxCompanyInfo[] {
  if (cachedCompanies) return cachedCompanies;

  const candidatePaths = [
    path.join(process.cwd(), "data", "allCompanies.json"),
    path.join(process.cwd(), "..", "idx-bei-main", "data", "allCompanies.json"),
    path.join("d:", "Workspace", "idx-bei-main", "data", "allCompanies.json"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const json = JSON.parse(raw);
        const dataList = Array.isArray(json) ? json : json?.data;
        if (Array.isArray(dataList)) {
          cachedCompanies = dataList.map((item: any) => ({
            code: item.KodeEmiten || item.code || item.StockCode || "",
            name: item.NamaEmiten || item.name || item.StockName || "",
            board: item.PapanPencatatan || item.board || "Utama",
            sector: item.Sektor || item.sector || "",
            isFCA: item.PapanPencatatan === "Pemantauan Khusus",
          })).filter((c) => c.code.length > 0);
          return cachedCompanies;
        }
      }
    } catch {
      // Fallback to next path
    }
  }

  return [];
}

/**
 * Loads real IDX stock snapshots (960+ stocks) generated from parquet/briefings
 */
export function getRealIdxStockSnapshots(): RealStockSnapshotItem[] {
  if (cachedRealStocks && cachedRealStocks.length > 0) {
    return cachedRealStocks;
  }

  const candidatePaths = [
    path.join(process.cwd(), "data", "realIdxSnapshot.json"),
    path.join("d:", "Workspace", "idx-bsjp-screener", "data", "realIdxSnapshot.json"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const json = JSON.parse(raw);
        if (json && Array.isArray(json.stocks)) {
          cachedRealStocks = json.stocks;
          return cachedRealStocks!;
        }
      }
    } catch (err) {
      console.error("Failed to load realIdxSnapshot from", p, err);
    }
  }

  return [];
}

import { getIdxMarketPhase, formatWibTime } from "./marketPhase";

/**
 * Loads real IDX Market Overview (IHSG, turnover, foreign net flow, breadth, bandarmology)
 */
export function getRealMarketOverview(): MarketOverview | null {
  if (cachedRealOverview) return cachedRealOverview;

  const candidatePaths = [
    path.join(process.cwd(), "data", "realMarketOverview.json"),
    path.join("d:", "Workspace", "idx-bsjp-screener", "data", "realMarketOverview.json"),
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        const json = JSON.parse(raw);
        if (json && json.ihsg) {
          const phaseInfo = getIdxMarketPhase();
          cachedRealOverview = {
            ihsgPrice: json.ihsg.current,
            ihsgChange: json.ihsg.change,
            ihsgChangePct: json.ihsg.changePct,
            totalMarketTurnoverIdr: json.marketTurnoverIdr,
            netForeignFlowIdr: json.foreignNetFlowIdr,
            advancersCount: json.breadth.advancers,
            declinersCount: json.breadth.decliners,
            unchangedCount: json.breadth.unchanged,
            currentPhase: phaseInfo.phase,
            phaseLabel: phaseInfo.phaseLabel,
            wibTime: formatWibTime(),
            isBsjpWindow: phaseInfo.isBsjpWindow,
            minutesToClose: phaseInfo.minutesToClose,
          };
          return cachedRealOverview;
        }
      }
    } catch (err) {
      console.error("Failed to load realMarketOverview from", p, err);
    }
  }

  return null;
}
