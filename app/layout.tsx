import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDX BSJP Screener | Algorithmic Momentum & Accumulation Radar",
  description: "Quantitative BSJP (Beli Sore, Jual Pagi) trading terminal for Indonesia Stock Exchange equities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0c10] text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

