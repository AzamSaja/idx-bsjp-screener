/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0c10",
        surface: {
          DEFAULT: "#11141c",
          50: "#1e2230",
          100: "#161924",
          200: "#12141d",
          300: "#0c0e14",
        },
        border: "#1f2638",
        brand: {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          dark: "#1d4ed8",
        },
        idx: {
          green: "#10b981", // Advancers / TP / Up
          red: "#ef4444",   // Decliners / Stop Loss / Down
          yellow: "#f59e0b", // Pre-closing / Watch
          purple: "#a855f7", // Bandar / Accumulation
          blue: "#38bdf8",  // Volume spike
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}

