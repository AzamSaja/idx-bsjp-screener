export interface OHLCVBar {
  time: string | number; // YYYY-MM-DD or Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  ticker: string; // e.g. "BBRI"
  companyName: string; // e.g. "Bank Rakyat Indonesia (Persero) Tbk."
  sector?: string; // e.g. "Financials"
  board?: string; // e.g. "Main", "Development", "Watchlist (FCA)"
  isFCA: boolean; // Papan Pemantauan Khusus / Periodic Call Auction
  notasiKhusus: string[]; // e.g. ["X", "B", "E"] or []
  
  // Current session snapshot
  lastPrice: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePct: number;
  
  // Liquidity
  volume: number; // in shares (or lots * 100)
  volumeLots: number; // in lots (1 lot = 100 shares)
  valueIdr: number; // total traded value in IDR
  frequency: number; // trade frequency
  
  // 20-Day Moving averages & ADV
  adv20Lots: number; // 20-day Average Daily Volume in lots
  volumeAdvRatio: number; // current volume / adv20Lots
  ema20: number;
  ema50: number;
  high52w: number;
  low52w: number;

  // Timestamps
  lastUpdated: string;
}

export interface BrokerEntry {
  brokerCode: string; // e.g. "PD", "YP", "CC", "AK", "ZP", "BK", "CS"
  brokerName?: string;
  volumeLots: number;
  valueIdr: number;
  avgPrice: number;
  isForeign?: boolean;
}

export interface BrokerSummary {
  ticker: string;
  date: string;
  topBuyers: BrokerEntry[]; // Top 5
  topSellers: BrokerEntry[]; // Top 5
  top3BuyerVolumeLots: number;
  top3SellerVolumeLots: number;
  top3ConcentrationRatio: number; // Top 3 Buyer Vol / Top 3 Seller Vol
  foreignBuyValueIdr: number;
  foreignSellValueIdr: number;
  foreignNetFlowIdr: number;
  accumulationStatus: "BIG_ACCUMULATION" | "NORMAL_ACCUMULATION" | "NEUTRAL" | "NORMAL_DISTRIBUTION" | "BIG_DISTRIBUTION";
}

export interface OrderbookLevel {
  price: number;
  volumeLots: number;
  orderCount: number;
}

export interface BidAskDepth {
  ticker: string;
  bids: OrderbookLevel[]; // Top 10 Bids sorted desc
  asks: OrderbookLevel[]; // Top 10 Asks sorted asc
  totalBidLots: number;
  totalAskLots: number;
  bidAskRatio: number; // totalBidLots / totalAskLots
  preClosingPressure: "BULLISH_STACK" | "BALANCED" | "BEARISH_WALL";
}

