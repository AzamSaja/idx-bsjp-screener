import { TradingSessionPhase, MarketOverview } from "@/types/market";

/**
 * Returns current date and time in Jakarta (WIB, UTC+7)
 */
export function getJakartaDate(): Date {
  const now = new Date();
  // Format as UTC string then offset +7 hours
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

/**
 * Determines current IDX Trading Session Phase based on WIB time
 */
export function getIdxMarketPhase(nowWib = getJakartaDate()): {
  phase: TradingSessionPhase;
  phaseLabel: string;
  isBsjpWindow: boolean;
  minutesToClose: number;
} {
  const day = nowWib.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return {
      phase: "MARKET_CLOSED",
      phaseLabel: "Weekend (Market Closed)",
      isBsjpWindow: false,
      minutesToClose: 0,
    };
  }

  const hours = nowWib.getHours();
  const minutes = nowWib.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const isFriday = day === 5;

  // Pre-Opening: 08:45 - 08:59 (525 - 539)
  if (timeInMinutes >= 525 && timeInMinutes < 540) {
    return {
      phase: "PRE_OPENING",
      phaseLabel: "Pre-Opening (08:45 - 08:59 WIB)",
      isBsjpWindow: false,
      minutesToClose: 975 - timeInMinutes,
    };
  }

  // Session 1: 09:00 - 11:30 (540 - 690)
  if (timeInMinutes >= 540 && timeInMinutes < 690) {
    return {
      phase: "SESSION_1",
      phaseLabel: "Session 1 (09:00 - 11:30 WIB)",
      isBsjpWindow: false,
      minutesToClose: 975 - timeInMinutes,
    };
  }

  // Midday Break: Mon-Thu (11:30 - 13:30, 690 - 810), Fri (11:30 - 14:00, 690 - 840)
  const session2Start = isFriday ? 840 : 810;
  if (timeInMinutes >= 690 && timeInMinutes < session2Start) {
    return {
      phase: "MIDDAY_BREAK",
      phaseLabel: `Midday Break (11:30 - ${isFriday ? "14:00" : "13:30"} WIB)`,
      isBsjpWindow: false,
      minutesToClose: 975 - timeInMinutes,
    };
  }

  // Session 2: Start until 15:49 (session2Start - 949)
  if (timeInMinutes >= session2Start && timeInMinutes < 950) {
    return {
      phase: "SESSION_2",
      phaseLabel: "Session 2 (13:30 - 15:49 WIB)",
      isBsjpWindow: timeInMinutes >= 945, // BSJP radar activates from 15:45 WIB
      minutesToClose: 975 - timeInMinutes,
    };
  }

  // Pre-Closing: 15:50 - 15:59 (950 - 959) - Prime BSJP Selection
  if (timeInMinutes >= 950 && timeInMinutes < 960) {
    return {
      phase: "PRE_CLOSING",
      phaseLabel: "Pre-Closing Auction (15:50 - 16:00 WIB) 🔥 BSJP Radar",
      isBsjpWindow: true,
      minutesToClose: 975 - timeInMinutes,
    };
  }

  // Post-Closing: 16:00 - 16:15 (960 - 975) - BSJP Execution
  if (timeInMinutes >= 960 && timeInMinutes <= 975) {
    return {
      phase: "POST_CLOSING",
      phaseLabel: "Post-Closing (16:00 - 16:15 WIB) ⚡ BSJP Entry Order",
      isBsjpWindow: true,
      minutesToClose: 975 - timeInMinutes,
    };
  }

  // Closed
  return {
    phase: "MARKET_CLOSED",
    phaseLabel: "Market Closed (16:15 - 08:45 WIB)",
    isBsjpWindow: false,
    minutesToClose: 0,
  };
}

/**
 * Formats WIB time string e.g. "15:52:10 WIB"
 */
export function formatWibTime(date = getJakartaDate()): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}:${m}:${s} WIB`;
}

