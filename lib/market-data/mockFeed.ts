import { StockQuote, BrokerSummary, BidAskDepth, OrderbookLevel, OHLCVBar } from "@/types/stock";
import { MarketOverview } from "@/types/market";
import { getIdxMarketPhase, formatWibTime } from "./marketPhase";
import { roundToIdxTick } from "../screening/indicators";

// Authentic Indonesian Broker Master List
export const IDX_BROKERS = [
  { code: "ZP", name: "Maybank Sekuritas", isForeign: true },
  { code: "AK", name: "UBS Sekuritas Indonesia", isForeign: true },
  { code: "BK", name: "J.P. Morgan Sekuritas", isForeign: true },
  { code: "KZ", name: "CLSA Sekuritas", isForeign: true },
  { code: "CC", name: "Mandiri Sekuritas", isForeign: false },
  { code: "CS", name: "Credit Suisse Sekuritas", isForeign: true },
  { code: "CG", name: "CGS International", isForeign: true },
  { code: "YP", name: "Mirae Asset Sekuritas", isForeign: false },
  { code: "PD", name: "Indo Premier Sekuritas", isForeign: false },
  { code: "XC", name: "Ajaib Sekuritas", isForeign: false },
  { code: "NI", name: "BNI Sekuritas", isForeign: false },
  { code: "GR", name: "Panin Sekuritas", isForeign: false },
  { code: "OD", name: "BRI Danareksa Sekuritas", isForeign: false },
  { code: "DR", name: "RHB Sekuritas", isForeign: false },
  { code: "LG", name: "Trimegah Sekuritas", isForeign: false },
];

export interface BaseStockSeed {
  ticker: string;
  name: string;
  sector: string;
  basePrice: number;
  avgDailyVolLots: number;
  isFCA?: boolean;
  notasi?: string[];
  bias: "BSJP_PRIME" | "MODERATE_ACCUM" | "ARA_OVEREXTENDED" | "DISTRIBUTION" | "FCA_RISK";
}

const STOCK_SEEDS: BaseStockSeed[] = [
  {
    ticker: "MEDC",
    name: "Medco Energi Internasional Tbk.",
    sector: "Energy / Oil & Gas",
    basePrice: 1380,
    avgDailyVolLots: 420000,
    bias: "BSJP_PRIME", // Ideal candidate: high volume, close near high, top broker accumulation
  },
  {
    ticker: "BRIS",
    name: "Bank Syariah Indonesia Tbk.",
    sector: "Financials / Sharia Banking",
    basePrice: 2980,
    avgDailyVolLots: 310000,
    bias: "BSJP_PRIME", // Breakout momentum with strong foreign buying
  },
  {
    ticker: "AMMN",
    name: "Amman Mineral Internasional Tbk.",
    sector: "Basic Materials / Copper & Gold",
    basePrice: 9850,
    avgDailyVolLots: 185000,
    bias: "BSJP_PRIME", // Institutional loading before close
  },
  {
    ticker: "ADRO",
    name: "Adaro Energy Indonesia Tbk.",
    sector: "Energy / Coal & Minerals",
    basePrice: 3820,
    avgDailyVolLots: 560000,
    bias: "BSJP_PRIME", // Heavy turnover, high proximity
  },
  {
    ticker: "BBRI",
    name: "Bank Rakyat Indonesia (Persero) Tbk.",
    sector: "Financials / Banking",
    basePrice: 4890,
    avgDailyVolLots: 980000,
    bias: "MODERATE_ACCUM", // Bluechip high liquidity, moderate gain
  },
  {
    ticker: "BMRI",
    name: "Bank Mandiri (Persero) Tbk.",
    sector: "Financials / Banking",
    basePrice: 6650,
    avgDailyVolLots: 620000,
    bias: "MODERATE_ACCUM",
  },
  {
    ticker: "BBCA",
    name: "Bank Central Asia Tbk.",
    sector: "Financials / Banking",
    basePrice: 10450,
    avgDailyVolLots: 510000,
    bias: "MODERATE_ACCUM",
  },
  {
    ticker: "BUMI",
    name: "Bumi Resources Tbk.",
    sector: "Energy / Coal Mining",
    basePrice: 142,
    avgDailyVolLots: 2400000,
    bias: "BSJP_PRIME", // Huge volume spike, retail + bandar frenzy
  },
  {
    ticker: "ENRG",
    name: "Energi Mega Persada Tbk.",
    sector: "Energy / Oil & Gas",
    basePrice: 244,
    avgDailyVolLots: 680000,
    bias: "BSJP_PRIME",
  },
  {
    ticker: "ANTM",
    name: "Aneka Tambang Tbk.",
    sector: "Basic Materials / Gold & Nickel",
    basePrice: 1590,
    avgDailyVolLots: 390000,
    bias: "MODERATE_ACCUM",
  },
  {
    ticker: "GOTO",
    name: "GoTo Gojek Tokopedia Tbk.",
    sector: "Technology / Internet",
    basePrice: 68,
    avgDailyVolLots: 4500000,
    bias: "MODERATE_ACCUM",
  },
  {
    ticker: "PANI",
    name: "Pantai Indah Kapuk Dua Tbk.",
    sector: "Properties & Real Estate",
    basePrice: 14600,
    avgDailyVolLots: 120000,
    bias: "ARA_OVEREXTENDED", // +19% gain close to ARA, overextended warning
  },
  {
    ticker: "PTPS",
    name: "Pulau Subur Tbk.",
    sector: "Consumer Non-Cyclicals / Plantation",
    basePrice: 185,
    avgDailyVolLots: 90000,
    bias: "ARA_OVEREXTENDED", // +24% ARA locked
  },
  {
    ticker: "ASII",
    name: "Astra International Tbk.",
    sector: "Consumer Discretionary / Automotive",
    basePrice: 4950,
    avgDailyVolLots: 350000,
    bias: "DISTRIBUTION", // Decliners / selloff
  },
  {
    ticker: "TLKM",
    name: "Telkom Indonesia (Persero) Tbk.",
    sector: "Telecommunication",
    basePrice: 2840,
    avgDailyVolLots: 480000,
    bias: "DISTRIBUTION",
  },
  {
    ticker: "GIAA",
    name: "Garuda Indonesia (Persero) Tbk.",
    sector: "Transportation / Airlines",
    basePrice: 62,
    avgDailyVolLots: 150000,
    notasi: ["E", "X"],
    bias: "FCA_RISK", // Has Notasi Khusus
  },
  {
    ticker: "KREN",
    name: "Quantum Clovera Investama Tbk.",
    sector: "Technology",
    basePrice: 48,
    avgDailyVolLots: 30000,
    isFCA: true,
    notasi: ["X", "C"],
    bias: "FCA_RISK", // FCA Watchlist Board
  },
  {
    ticker: "ARTO",
    name: "Bank Jago Tbk.",
    sector: "Financials / Digital Bank",
    basePrice: 2680,
    avgDailyVolLots: 280000,
    bias: "BSJP_PRIME",
  },
  {
    ticker: "MBMA",
    name: "Merdeka Battery Materials Tbk.",
    sector: "Basic Materials / EV Metals",
    basePrice: 585,
    avgDailyVolLots: 490000,
    bias: "BSJP_PRIME",
  },
  {
    ticker: "SMRA",
    name: "Summarecon Agung Tbk.",
    sector: "Properties & Real Estate",
    basePrice: 625,
    avgDailyVolLots: 210000,
    bias: "MODERATE_ACCUM",
  },
];

/**
 * Generates synthetic intraday & daily OHLCV bars for a stock
 */
export function generateCandlestickBars(
  ticker: string,
  lastPrice: number,
  timeframe: "15m" | "1d" = "1d"
): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  const barCount = timeframe === "15m" ? 30 : 60;
  
  // Deterministic pseudo-random walk based on ticker letters
  const seedNum = ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  let currentClose = lastPrice * (timeframe === "15m" ? 0.96 : 0.82);

  const now = new Date();

  for (let i = barCount; i >= 0; i--) {
    const barDate = new Date(now.getTime() - i * (timeframe === "15m" ? 15 * 60000 : 24 * 3600000));
    const isLastBar = i === 0;

    // Upward trend towards lastPrice
    const stepProgress = 1 - i / barCount;
    const targetPrice = isLastBar ? lastPrice : lastPrice * (0.85 + 0.15 * stepProgress);
    const wiggle = (Math.sin(i * 1.3 + seedNum) * 0.015);
    const open = roundToIdxTick(currentClose);
    const close = isLastBar ? lastPrice : roundToIdxTick(targetPrice * (1 + wiggle));
    const high = roundToIdxTick(Math.max(open, close) * (1 + Math.abs(Math.sin(i * 2.1)) * 0.018));
    const low = roundToIdxTick(Math.min(open, close) * (1 - Math.abs(Math.cos(i * 1.7)) * 0.014));
    
    // Volume increases in recent periods
    const baseVol = 15000 + Math.floor(Math.abs(Math.sin(i + seedNum)) * 45000);
    const volume = isLastBar ? Math.floor(baseVol * 2.8) : baseVol;

    const timeStr = timeframe === "15m"
      ? Math.floor(barDate.getTime() / 1000)
      : barDate.toISOString().split("T")[0];

    bars.push({
      time: timeStr,
      open,
      high,
      low,
      close,
      volume,
    });

    currentClose = close;
  }

  return bars;
}

/**
 * Generates realistic IDX broker summary for a stock
 */
export function generateBrokerSummary(seed: BaseStockSeed, quote: StockQuote): BrokerSummary {
  const isAccum = seed.bias === "BSJP_PRIME" || seed.bias === "MODERATE_ACCUM";
  const isDist = seed.bias === "DISTRIBUTION";

  const totalLotTraded = quote.volumeLots;
  const topBuyersLots = isAccum ? Math.floor(totalLotTraded * 0.48) : Math.floor(totalLotTraded * 0.22);
  const topSellersLots = isDist ? Math.floor(totalLotTraded * 0.46) : Math.floor(totalLotTraded * 0.24);

  // Pick prominent brokers
  const buyerCodes = isAccum ? ["AK", "ZP", "BK", "CC", "KZ"] : ["YP", "PD", "XC", "NI", "GR"];
  const sellerCodes = isAccum ? ["YP", "PD", "XC", "GR", "DR"] : ["AK", "ZP", "BK", "CS", "CC"];

  const topBuyers = buyerCodes.map((code, idx) => {
    const fraction = [0.42, 0.26, 0.16, 0.10, 0.06][idx];
    const vol = Math.floor(topBuyersLots * fraction);
    const bMeta = IDX_BROKERS.find((b) => b.code === code);
    return {
      brokerCode: code,
      brokerName: bMeta?.name || `${code} Sekuritas`,
      volumeLots: vol,
      valueIdr: vol * 100 * quote.lastPrice,
      avgPrice: roundToIdxTick(quote.lastPrice * (1 - (0.005 * idx))),
      isForeign: bMeta?.isForeign ?? false,
    };
  });

  const topSellers = sellerCodes.map((code, idx) => {
    const fraction = [0.38, 0.28, 0.18, 0.10, 0.06][idx];
    const vol = Math.floor(topSellersLots * fraction);
    const bMeta = IDX_BROKERS.find((b) => b.code === code);
    return {
      brokerCode: code,
      brokerName: bMeta?.name || `${code} Sekuritas`,
      volumeLots: vol,
      valueIdr: vol * 100 * quote.lastPrice,
      avgPrice: roundToIdxTick(quote.lastPrice * (1 - (0.008 * idx))),
      isForeign: bMeta?.isForeign ?? false,
    };
  });

  const top3BuyerVolumeLots = topBuyers.slice(0, 3).reduce((acc, b) => acc + b.volumeLots, 0);
  const top3SellerVolumeLots = topSellers.slice(0, 3).reduce((acc, b) => acc + b.volumeLots, 0);
  const top3ConcentrationRatio = Number((top3BuyerVolumeLots / Math.max(1, top3SellerVolumeLots)).toFixed(2));

  // Foreign flow calculation
  const foreignBuyValueIdr = topBuyers.filter((b) => b.isForeign).reduce((acc, b) => acc + b.valueIdr, 0);
  const foreignSellValueIdr = topSellers.filter((b) => b.isForeign).reduce((acc, b) => acc + b.valueIdr, 0);
  const foreignNetFlowIdr = foreignBuyValueIdr - foreignSellValueIdr;

  let accumulationStatus: BrokerSummary["accumulationStatus"] = "NEUTRAL";
  if (top3ConcentrationRatio >= 1.8 || foreignNetFlowIdr > 20_000_000_000) {
    accumulationStatus = "BIG_ACCUMULATION";
  } else if (top3ConcentrationRatio >= 1.25 || foreignNetFlowIdr > 5_000_000_000) {
    accumulationStatus = "NORMAL_ACCUMULATION";
  } else if (top3ConcentrationRatio <= 0.65 || foreignNetFlowIdr < -15_000_000_000) {
    accumulationStatus = "BIG_DISTRIBUTION";
  } else if (top3ConcentrationRatio <= 0.85) {
    accumulationStatus = "NORMAL_DISTRIBUTION";
  }

  return {
    ticker: quote.ticker,
    date: new Date().toISOString().split("T")[0],
    topBuyers,
    topSellers,
    top3BuyerVolumeLots,
    top3SellerVolumeLots,
    top3ConcentrationRatio,
    foreignBuyValueIdr,
    foreignSellValueIdr,
    foreignNetFlowIdr,
    accumulationStatus,
  };
}

/**
 * Generates realistic 10-level Pre-Closing Orderbook Bid-Ask Stack
 */
export function generateBidAskDepth(seed: BaseStockSeed, quote: StockQuote): BidAskDepth {
  const tick = Math.max(1, (quote.lastPrice < 200 ? 1 : quote.lastPrice < 500 ? 2 : quote.lastPrice < 2000 ? 5 : quote.lastPrice < 5000 ? 10 : 25));
  const isBullish = seed.bias === "BSJP_PRIME";
  const isBearish = seed.bias === "DISTRIBUTION";

  const bids: OrderbookLevel[] = [];
  const asks: OrderbookLevel[] = [];

  const baseLot = Math.floor(quote.volumeLots / 40);

  for (let level = 1; level <= 10; level++) {
    const bidPrice = quote.lastPrice - (level - 1) * tick;
    const askPrice = quote.lastPrice + level * tick;

    // In bullish pre-closing, bids are densely stacked to absorb closing auction
    const bidMultiplier = isBullish ? (1.6 - (level * 0.05)) : isBearish ? 0.7 : 1.0;
    const askMultiplier = isBullish ? (0.7 + (level * 0.04)) : isBearish ? 1.8 : 1.0;

    const bidVol = Math.max(50, Math.floor(baseLot * bidMultiplier * (1 + Math.sin(level * 2) * 0.25)));
    const askVol = Math.max(50, Math.floor(baseLot * askMultiplier * (1 + Math.cos(level * 2) * 0.25)));

    bids.push({
      price: bidPrice,
      volumeLots: bidVol,
      orderCount: Math.floor(bidVol / 12) + 5,
    });

    asks.push({
      price: askPrice,
      volumeLots: askVol,
      orderCount: Math.floor(askVol / 14) + 4,
    });
  }

  const totalBidLots = bids.reduce((acc, b) => acc + b.volumeLots, 0);
  const totalAskLots = asks.reduce((acc, a) => acc + a.volumeLots, 0);
  const bidAskRatio = Number((totalBidLots / Math.max(1, totalAskLots)).toFixed(2));

  let preClosingPressure: BidAskDepth["preClosingPressure"] = "BALANCED";
  if (bidAskRatio >= 1.35) {
    preClosingPressure = "BULLISH_STACK";
  } else if (bidAskRatio <= 0.8) {
    preClosingPressure = "BEARISH_WALL";
  }

  return {
    ticker: quote.ticker,
    bids,
    asks,
    totalBidLots,
    totalAskLots,
    bidAskRatio,
    preClosingPressure,
  };
}

/**
 * Generates all active stock snapshots and technical indicators
 */
export function getAllStockSnapshots(): {
  quote: StockQuote;
  brokerSummary: BrokerSummary;
  bidAskDepth: BidAskDepth;
}[] {
  return STOCK_SEEDS.map((seed) => {
    let changePct = 0;
    let volumeRatio = 1.0;

    if (seed.bias === "BSJP_PRIME") {
      changePct = Number((3.5 + (seed.ticker.charCodeAt(0) % 5) * 1.4).toFixed(2)); // +3.5% to +9.1%
      volumeRatio = Number((1.85 + (seed.ticker.charCodeAt(1) % 4) * 0.65).toFixed(2)); // 1.85x to 3.8x
    } else if (seed.bias === "MODERATE_ACCUM") {
      changePct = Number((1.5 + (seed.ticker.charCodeAt(0) % 3) * 0.9).toFixed(2)); // +1.5% to +3.3%
      volumeRatio = Number((1.2 + (seed.ticker.charCodeAt(2) % 3) * 0.4).toFixed(2));
    } else if (seed.bias === "ARA_OVEREXTENDED") {
      changePct = Number((16.5 + (seed.ticker.charCodeAt(0) % 6) * 1.5).toFixed(2)); // +16.5% to +24%
      volumeRatio = Number((3.5 + (seed.ticker.charCodeAt(1) % 3) * 1.2).toFixed(2));
    } else if (seed.bias === "DISTRIBUTION") {
      changePct = Number((-1.2 - (seed.ticker.charCodeAt(0) % 3) * 1.1).toFixed(2));
      volumeRatio = Number((0.8 + (seed.ticker.charCodeAt(1) % 2) * 0.3).toFixed(2));
    } else {
      // FCA
      changePct = Number((0.5 - (seed.ticker.charCodeAt(0) % 4) * 0.5).toFixed(2));
      volumeRatio = 0.5;
    }

    const previousClose = seed.basePrice;
    const lastPrice = roundToIdxTick(previousClose * (1 + changePct / 100));
    const change = lastPrice - previousClose;

    // Intraday High & Low ensuring high proximity for BSJP_PRIME
    let high = lastPrice;
    let low = previousClose;
    if (changePct > 0) {
      // For prime BSJP, high is at most 1-2 ticks above lastPrice
      const tick = roundToIdxTick(lastPrice * 0.005) || 5;
      high = seed.bias === "BSJP_PRIME" ? roundToIdxTick(lastPrice + tick) : roundToIdxTick(lastPrice * 1.03);
      low = roundToIdxTick(previousClose * 0.99);
    } else {
      high = roundToIdxTick(previousClose * 1.01);
      low = roundToIdxTick(lastPrice * 0.98);
    }

    const volumeLots = Math.floor(seed.avgDailyVolLots * volumeRatio);
    const volumeShares = volumeLots * 100;
    const valueIdr = volumeShares * lastPrice;

    // Moving averages & 52-week
    const ema20 = roundToIdxTick(lastPrice * 0.96);
    const ema50 = roundToIdxTick(lastPrice * 0.92);
    const high52w = roundToIdxTick(lastPrice * 1.12);
    const low52w = roundToIdxTick(lastPrice * 0.65);

    const quote: StockQuote = {
      ticker: seed.ticker,
      companyName: seed.name,
      sector: seed.sector,
      board: seed.isFCA ? "Watchlist (FCA)" : "Main Board",
      isFCA: seed.isFCA ?? false,
      notasiKhusus: seed.notasi ?? [],
      lastPrice,
      previousClose,
      open: roundToIdxTick(previousClose * 1.005),
      high,
      low,
      change,
      changePct,
      volume: volumeShares,
      volumeLots,
      valueIdr,
      frequency: Math.floor(volumeLots / 35) + 1200,
      adv20Lots: seed.avgDailyVolLots,
      volumeAdvRatio: volumeRatio,
      ema20,
      ema50,
      high52w,
      low52w,
      lastUpdated: new Date().toISOString(),
    };

    const brokerSummary = generateBrokerSummary(seed, quote);
    const bidAskDepth = generateBidAskDepth(seed, quote);

    return {
      quote,
      brokerSummary,
      bidAskDepth,
    };
  });
}

/**
 * Computes live IDX Market Overview (IHSG, Turnover, Foreign Flow, Advancers/Decliners)
 */
export function getMarketOverview(): MarketOverview {
  const snapshots = getAllStockSnapshots();
  const phaseInfo = getIdxMarketPhase();

  const totalMarketTurnoverIdr = snapshots.reduce((acc, s) => acc + s.quote.valueIdr, 0) + 7_800_000_000_000; // Plus other broad market turnover (~Rp 9.5 Trillion)
  const netForeignFlowIdr = snapshots.reduce((acc, s) => acc + s.brokerSummary.foreignNetFlowIdr, 0) + 480_000_000_000; // Positive institutional inflow

  const advancersCount = snapshots.filter((s) => s.quote.changePct > 0).length * 14 + 182;
  const declinersCount = snapshots.filter((s) => s.quote.changePct < 0).length * 12 + 134;
  const unchangedCount = 189;

  // IHSG Index baseline
  const ihsgPrice = 7782.45;
  const ihsgChange = +58.12;
  const ihsgChangePct = +0.75;

  return {
    ihsgPrice,
    ihsgChange,
    ihsgChangePct,
    totalMarketTurnoverIdr,
    netForeignFlowIdr,
    advancersCount,
    declinersCount,
    unchangedCount,
    currentPhase: phaseInfo.phase,
    phaseLabel: phaseInfo.phaseLabel,
    wibTime: formatWibTime(),
    isBsjpWindow: phaseInfo.isBsjpWindow,
    minutesToClose: phaseInfo.minutesToClose,
  };
}

