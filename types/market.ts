export type TradingSessionPhase = 
  | "PRE_OPENING"       // 08:45 - 08:59 WIB
  | "SESSION_1"          // 09:00 - 11:30 WIB (Fri: 09:00 - 11:30)
  | "MIDDAY_BREAK"      // 11:30 - 13:30 WIB (Fri: 11:30 - 14:00)
  | "SESSION_2"          // 13:30 - 15:49 WIB (Fri: 14:00 - 15:49)
  | "PRE_CLOSING"        // 15:50 - 16:00 WIB (BSJP Prime Entry Window)
  | "POST_CLOSING"       // 16:00 - 16:15 WIB (Closing Auction Execution)
  | "MARKET_CLOSED";     // 16:15 - 08:45 WIB & Weekends

export interface MarketOverview {
  ihsgPrice: number;
  ihsgChange: number;
  ihsgChangePct: number;
  totalMarketTurnoverIdr: number;
  netForeignFlowIdr: number;
  advancersCount: number;
  declinersCount: number;
  unchangedCount: number;
  currentPhase: TradingSessionPhase;
  phaseLabel: string;
  wibTime: string;
  isBsjpWindow: boolean; // True between 15:45 and 16:15 WIB
  minutesToClose: number;
}

export interface WebhookAlertPayload {
  channel: "discord" | "telegram";
  messageTitle: string;
  timestampWib: string;
  candidates: {
    ticker: string;
    lastPrice: number;
    changePct: number;
    volumeAdvRatio: number;
    score: number;
    signal: string;
    entryPrice: number;
    tp1: number;
    stopLoss: number;
    accumulationStatus: string;
  }[];
}

