# IDX BSJP Algorithmic Screener (Beli Sore, Jual Pagi)

A fast, production-ready full-stack quantitative equity terminal designed to track and screen the **Indonesia Stock Exchange (IDX / BEI)** equity market. It generates high-conviction algorithmic trading recommendations for the **BSJP** (*Beli Sore, Jual Pagi* / Buy Afternoon, Sell Morning) trading strategy.

![IDX BSJP Terminal](https://img.shields.io/badge/IDX-Equity%20Terminal-blue?style=for-the-badge)
![Next.js 15](https://img.shields.io/badge/Next.js-15%20(App%20Router)-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-cyan?style=for-the-badge&logo=react)
![Google TimesFM 3.0](https://img.shields.io/badge/TimesFM--3.0-Google%20Research-9333ea?style=for-the-badge)
![TradingView](https://img.shields.io/badge/Lightweight--Charts-TradingView-blueviolet?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Dark%20Terminal-38bdf8?style=for-the-badge&logo=tailwindcss)

---

## 1. Strategy Overview: What is BSJP?

**BSJP** (*Beli Sore, Jual Pagi*) is an institutional momentum and liquidity-capture strategy designed for the Indonesian market. It enters positions during the **Pre-Closing & Post-Closing Auction** window (**15:50 – 16:15 WIB**) and exits during the next morning's liquidity surge (**09:00 – 09:30 WIB** next trading session).

### Deterministic Filtering Logic
To qualify for a BSJP trade recommendation, a stock must pass 8 strict criteria:
1. **Liquidity Threshold:** Minimum Daily Turnover $\ge \text{IDR } 5,000,000,000$ (5 Billion IDR).
2. **Volume Spike:** Current day volume $> 1.5\times$ 20-day Average Daily Volume (20-ADV).
3. **Price Range Constraint:** Daily gain between $+2.0\%$ and $+15.0\%$ (prevents getting trapped in already capped Auto-Rejection Atas / ARA stocks).
4. **Bullish Closing Proximity:** $\text{Close} \ge \text{High} - 0.25 \times (\text{High} - \text{Low})$ (stock closes within top 25% of the day's total range).
5. **Trend Alignment:** $\text{Price} > \text{EMA}_{20}$ and $\text{Price} > \text{EMA}_{50}$.
6. **Bandar Accumulation Proxy:** Top-3 Buyer volume significantly exceeds Top-3 Seller volume ($CR_3 \ge 1.15\times$) or strong positive institutional foreign inflow.
7. **Orderbook Depth:** Healthy bid queue depth vs. ask wall right before 15:50 WIB ($\text{Bid/Ask Ratio} \ge 1.10\times$).
8. **Risk Exclusions:** Strict exclusion of stocks with Special Notation (Notasi Khusus like `X`, `B`, `E`, `M`) and Watchlist Board / Full Call Auction (FCA).

### Quantitative Composite BSJP Score (0 – 100)
- **Volume Surge (Max 25 pts):** Relative volume expansion vs 20-ADV.
- **Price Structure & Proximity (Max 20 pts):** Upper quartile closeness to high and intraday continuation.
- **Bandar Accumulation & Foreign Flow (Max 25 pts):** Top-3 concentration ratio ($CR_3$) + net foreign inflow.
- **Orderbook Depth Stack (Max 15 pts):** 10-level bid stack absorbing sell walls before 15:50 WIB.
- **Trend Strength & Turnover (Max 15 pts):** EMA 20/50 clearance and total value size ($> \text{Rp 20B}$).

---

## 2. Directory Structure

```
idx-bsjp-screener/
├── app/
│   ├── api/
│   │   ├── alerts/webhook/route.ts  # Discord / Telegram automated alert dispatch
│   │   ├── export/route.ts          # Watchlist exporter (Stockbit, Mirae, Mandiri)
│   │   ├── forecast/[ticker]/route.ts # Google TimesFM 3.0 probabilistic forecasting API
│   │   ├── market-overview/route.ts # IHSG index, turnover, foreign net flow, WIB session
│   │   ├── screen/route.ts          # Deterministic BSJP screener & scoring API
│   │   └── stocks/[ticker]/route.ts # OHLCV charts, orderbook & broker detail
│   ├── globals.css                  # Custom financial terminal theme & scrollbars
│   ├── layout.tsx                   # Root layout with dark terminal class
│   └── page.tsx                     # Main radar dashboard
├── components/
│   ├── AlertWebhookModal.tsx        # Discord/Telegram webhook dispatch modal
│   ├── BidAskDepthCard.tsx          # 10-level pre-closing orderbook queue visualizer
│   ├── BrokerSummaryBar.tsx         # Top-5 Buyer vs Seller distribution & Foreign Flow
│   ├── BsjpRadarTable.tsx           # High-density sorting table with action signals & AI badge
│   ├── CandlestickChart.tsx         # TradingView Lightweight Charts with TimesFM AI overlay
│   ├── ExportModal.tsx              # Stockbit, Mirae HOTS, Mandiri MOST watchlist export
│   ├── FilterPresets.tsx            # Preset quick buttons (Strict, AI Confirmed, Accum, 52W)
│   ├── Header.tsx                   # Terminal branding, WIB clock, session indicator
│   ├── MarketOverviewBar.tsx        # Live IHSG, Foreign Flow, Advancers/Decliners
│   ├── SettingsModal.tsx            # Parameter sliders for quantitative thresholds
│   ├── StockDetailPanel.tsx         # Deep-dive side panel with multi-tab analysis & TimesFM AI
│   ├── TimesFmForecastCard.tsx      # Google TimesFM 3.0 T+1 exit & quantile visualizer
│   └── TradePlanCard.tsx            # Automated Entry, TP1, TP2, Stop-loss & R:R calculator
├── lib/
│   ├── market-data/
│   │   ├── idxLocalData.ts          # Local IDX dataset connector
│   │   ├── marketPhase.ts           # Indonesian WIB market session detector
│   │   ├── mockFeed.ts              # High-fidelity realistic IDX live market simulator
│   │   └── yahooFinance.ts          # Yahoo Finance (.JK) OHLCV fetcher with fallback
│   ├── screening/
│   │   ├── bsjpEngine.ts            # Deterministic filtering, scoring math (0-100), signal rules
│   │   ├── defaultParams.ts         # Customizable weights & default parameter thresholds
│   │   └── indicators.ts            # EMA, ADV, IDX tick sizes, Proximity to High formulas
│   └── utils.ts                     # Formatting for IDR currency, lots, numbers
├── scripts/
│   ├── syncIdxRealData.py           # Sync & aggregate 960+ IDX stocks from internal data/
│   ├── testEngine.mjs               # Mathematical assertion test suite
│   └── testRealScreener.mjs         # Real snapshot verification test suite
├── types/
│   ├── market.ts                    # Market overview & trading phase types
│   ├── screening.ts                 # Screening parameters, candidate & trade plan types
│   └── stock.ts                     # Stock quote, orderbook, broker summary & OHLCV types
├── .env.example                     # Environment variables template
├── next.config.ts
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 3. Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested with v20.18.1)
- npm or pnpm or bun

### 1. Installation
```bash
cd idx-bsjp-screener
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure any desired external keys:
- `DISCORD_WEBHOOK_URL`: Set your channel webhook URL to receive 15:45 WIB automated alerts.
- `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`: For Telegram broadcasts.
- `NEXT_PUBLIC_SUPABASE_URL` / `KEY`: For persistent user watchlists.

### 3. Sync Real IDX Data & Machine Learning Forecasts
```bash
# Sync 960+ stocks from self-contained repository data/ directory
npm run sync:data

# Precompute Google TimesFM 3.0 (330M PyTorch) AI forecasts for top candidates
npm run forecast:timesfm

# (Optional) Run single-ticker on-demand forecast via CLI
uv run --with timesfm --with torch --with pandas --with pyarrow python scripts/forecastTimesFM.py --ticker BBRI --horizon 5

# Run BSJP math assertions & real dataset verifier
node scripts/testEngine.mjs
node scripts/testRealScreener.mjs
```

#### Automated Daily Sync via GitHub Actions (Smart Window)
A scheduled workflow (`.github/workflows/sync-idx.yml`) runs automatically on trading days (Monday–Friday) during the BSJP institutional momentum windows:
- **15:35 WIB (08:35 UTC):** Early radar accumulation scan.
- **15:50 WIB (08:50 UTC):** Pre-closing auction entry snapshot.
- **16:15 WIB (09:15 UTC):** Official market close final settlement snapshot.

When new data is detected, the workflow automatically commits the snapshot to `main`, triggering a seamless Vercel production redeploy. You can also trigger a manual sync anytime via GitHub's **Actions -> Run workflow** button.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 4. Key Features & Visual Layout

### 1. Market Overview Bar
Displays real-time IDX market metrics:
- **IHSG (Composite Index):** Points and percentage change.
- **Institutional Net Foreign Flow:** Real-time inflow/outflow in Billions IDR.
- **Market Turnover:** Cumulative turnover in Trillions IDR.
- **Market Breadth:** Advancers (green), Decliners (red), Unchanged (neutral).
- **Session Phase Indicator:** Current WIB phase (Session 1, Session 2, Pre-Closing 15:50–16:00 WIB, Post-Closing, or Market Closed).

### 2. BSJP Radar Table & AI Confirmed Preset
- Sortable ranking table powered by the composite **BSJP Score (0–100)**.
- **TimesFM AI Badges:** Real-time indicator showing predicted T+1 return (e.g. `AI +2.8%`).
- **AI Confirmed Preset Filter:** One-click filter to isolate candidates where Google TimesFM 3.0 confirms positive overnight continuation.
- Color-coded price changes, volume vs. 20-ADV ratio, turnover, and closeness to day high.
- Badges for **Notasi Khusus** (e.g. `X`, `E`) and **FCA** (Papan Pemantauan Khusus).
- Signals: `STRONG_BUY`, `BUY`, `WATCH`, `OVEREXTENDED` (ARA warning), and `AVOID`.

### 3. Deep Dive Analysis Drawer
Clicking any candidate opens a panel featuring:
- **TradingView Lightweight Charts:** Switch between 15-minute intraday and Daily candles with EMA 20 (blue line), EMA 50 (amber line), and volume histogram. Includes a **TimesFM AI Forecast** toggle extending projected future price trajectories and P10/P90 prediction corridors.
- **TimesFM 3.0 AI Forecast Tab:** Dedicated foundation model tab featuring:
  * **T+1 BSJP Morning Exit Target:** Expected exit price for 09:00 WIB session and % return.
  * **BSJP Alignment Verdict:** Institutional status (`AI CONFIRMED`, `MODERATE CONVERGENCE`, `DIVERGENCE WARNING`).
  * **5-Day Multi-Horizon Grid:** Step-by-step projection with P10 (bearish floor) and P90 (bullish breakout ceiling).
  * **On-Demand Inference Button:** Live re-computation with real-time feedback.
- **Suggested Trade Plan Card:** Automated Entry (closing auction), TP1 (+1.8% to +2.2%), TP2 (+3.0% to +3.8%), Strict Morning Cut-Loss (-2% to -3%), and Risk-to-Reward Ratio ($RR \ge 1:1.5$).
- **Bandarmology Summary Bar:** Top 5 Buyer vs. Seller distribution, broker codes (AK, ZP, BK, CC, YP, PD), and institutional vs. domestic classification.
- **Pre-Closing Orderbook Stack:** 10-level bid stack depth vs. ask wall right before 15:50 WIB.

### 4. Broker Watchlist Export
One-click export formatted for immediate copy-pasting or file import:
- **Stockbit:** Comma-separated or newline ticker list.
- **Mirae Asset Sekuritas:** Neo HOTS `.csv` format (`Code,Market`).
- **Mandiri Sekuritas:** MOST `.csv` format (`StockCode;Board`).

### 5. Automated Webhook Alerts
- Support for Discord Rich Embeds with color-coded alerts and trade plan summaries.
- Support for Telegram Markdown alerts.
- Automated 15:45 WIB trigger simulation.

