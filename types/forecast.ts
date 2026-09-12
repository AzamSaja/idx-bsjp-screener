export interface TimesFMForecastPoint {
  step: number;        // 1 to N
  date: string;        // YYYY-MM-DD
  price: number;       // Mean / P50 expected price (rounded to nearest IDR tick)
  p10: number;         // 10th percentile (bearish support floor)
  p50: number;         // 50th percentile (median)
  p90: number;         // 90th percentile (bullish resistance ceiling)
  changePct: number;   // % change from lastClose
}

export interface BsjpAiAlignment {
  aligned: boolean;
  verdict: "CONFIRMED_BY_AI" | "MODERATE_CONVERGENCE" | "DIVERGENCE_WARNING";
  scoreMultiplier: number; // e.g. 1.15 for confirmed, 0.9 for divergence
  commentary: string;
}

export interface TimesFMForecast {
  ticker: string;
  asOfDate: string;
  lastClose: number;
  horizon: number;
  points: TimesFMForecastPoint[];
  tPlus1: {
    date: string;
    price: number;
    changePct: number;
    p10: number;
    p90: number;
  };
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidenceScore: number; // 0 to 100
  bsjpAlignment: BsjpAiAlignment;
  generatedAt: string;
  model: string; // "Google TimesFM 3.0 (330M PyTorch)"
  source: "TIMESFM_MODEL" | "CACHE" | "FALLBACK";
}

export interface BatchForecastMap {
  generatedAt: string;
  totalForecasted: number;
  model: string;
  forecasts: Record<string, TimesFMForecast>;
}

